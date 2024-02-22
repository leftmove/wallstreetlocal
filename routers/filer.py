from fastapi import BackgroundTasks, HTTPException, APIRouter
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from datetime import datetime
import json
import os
from traceback import format_exc

from .utils import web
from .utils import database
from .utils import analysis

from .utils.search import search_companies
from .utils.api import sec_filer_search
from .utils.cache import cache


class Filer(BaseModel):
    cik: str


class HTTPError(BaseModel):
    detail: str


router = APIRouter(
    prefix="/filers",
    tags=["filers"],
    responses={
        200: {"model": HTTPError, "description": "Success."},
        201: {"model": HTTPError, "description": "Successfully created object."},
        202: {"model": HTTPError, "description": "Accepted."},
        403: {"model": HTTPError, "description": "Forbidden."},
        404: {"model": HTTPError, "description": "Not found."},
        409: {
            "model": HTTPError,
            "description": "Conflict with server state.",
        },
        422: {"model": HTTPError, "description": "Malformed content."},
    },
)


# Different Filer Stages
# 3 : Filer was non-existent before and is being fully built from the ground up.
# 2 : Filer's newest filing is built, but older filings are still being updated and sorted.
# 1 : Fully built from previous query, but filer is being updated with newest filing recently acquired. That or newest filing is just missing.
# 0 : Fully built, filer is up and ready to go.

# Different Log Stages
# 2 : Filer creation started, estimation time being calculated.
# 1 : Filer still building, but estimation time has been calculated.
# 0 : Filer is done being built, logs are no longer kept.

# Different Filer Stages
# 4 : Filer was non-existent before and is being fully built from the ground up.
# 3 : Filer still building, but estimation time has been calculated.
# 2 : Filer's newest filing is built, but older filings are still being updated and sorted. Estimation time is calculated.
# 1 : Fully built from previous query, but filer is being updated with newest filing recently acquired. That or newest filing is just missing.
# 0 : Fully built, filer is up and ready to go.

# Note: Once two is set, three MUST be cancelled.


def create_recent(cik, company, stamp):
    filer_query = {"cik": cik}
    company_name = company["name"]

    try:
        filings = company["filings"]
        last_report = company["last_report"]
        recent_filing = filings[last_report]

        for access_number, filing_stocks in web.process_stocks(
            cik, {last_report: recent_filing}, last_report
        ):
            recent_filing["stocks"] = filing_stocks
            database.edit_filer(
                filer_query,
                {"$set": {f"filings.{access_number}.stocks": filing_stocks}},
            )

        database.add_log(cik, "Queried Filer Recent Stocks", company_name, cik)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error getting newest stocks.")

    try:
        database.add_log(cik, "Creating Filer (Newest)", company_name, cik)

        for (
            stock_query,
            filing_stock,
        ) in analysis.analyze_filings(cik, {last_report: recent_filing}):
            database.edit_filer(filer_query, {"$set": {stock_query: filing_stock}})

        filings = database.find_filer(cik, {"filings": 1})
        filings = filings["filings"]
        recent_market_value = filings[last_report].get("market_value", "NA")
        database.edit_filer(
            filer_query, {"$set": {"market_value": recent_market_value}}
        )

        for stock_query, log_item in analysis.analyze_stocks(cik, filings):
            database.edit_filer(filer_query, stock_query)
            database.add_log(cik, log_item)

        database.add_log(cik, "Updated Filer Recent Stocks", company_name, cik)
        database.edit_status(cik, 2)
    except Exception as e:
        database.edit_filer(
            {"cik": cik}, {"$set": {"market_value": "NA", "update": False}}
        )
        database.add_log(cik, "Failed to Update Filer Recent Stocks", company_name, cik)
        database.edit_status(cik, 2)
        print(e)

    start = stamp["start"]
    stamp = {"time.elapsed": datetime.now().timestamp() - start}
    database.edit_log(cik, stamp)
    database.add_query_log(cik, "create-latest")


def create_historical(cik, company, stamp):
    filer_query = {"cik": cik}
    company_name = company["name"]
    last_report = company["last_report"]

    try:
        filings = company["filings"]
        for access_number, filing_stocks in web.process_stocks(
            cik, filings, last_report
        ):
            database.edit_filer(
                filer_query,
                {"$set": {f"filings.{access_number}.stocks": filing_stocks}},
            )

        filings = database.find_filer(cik, {"filings": 1})
        filings = filings["filings"]

        database.add_log(cik, "Queried Filer Historical Stocks", company_name, cik)
    except Exception as e:
        print(e)
        database.add_log(
            cik, "Failed to Query Filer Historical Stocks", company_name, cik
        )

    try:
        database.add_log(cik, "Creating Filer (Historical)", company_name, cik)

        for (
            stock_query,
            filing_stock,
        ) in analysis.analyze_filings(cik, filings):
            database.edit_filer(filer_query, {"$set": {stock_query: filing_stock}})

        filings = database.find_filer(cik, {"filings": 1})
        filings = filings["filings"]

        for stock_query, log_item in analysis.analyze_stocks(cik, filings, {}):
            database.edit_filer(filer_query, stock_query)
            database.add_log(cik, log_item)

        database.add_log(cik, "Updated Filer Historical Stocks", company_name, cik)
        database.edit_status(cik, 0)
    except Exception as e:
        database.edit_filer(filer_query, {"$set": {"update": False}})
        database.add_log(cik, "Failed to Update Filer Recent Stocks")
        print(e)

    start = stamp["start"]
    stamp = {"time.elapsed": datetime.now().timestamp() - start}
    database.edit_log(cik, stamp)
    database.add_query_log(cik, "create-historical")


def create_filer(sec_data, cik):
    company, stamp = web.initalize_filer(cik, sec_data)
    create_recent(cik, company, stamp)
    create_historical(cik, company, stamp)


def update_filer(company, background):
    cik = company["cik"]
    time = datetime.now().timestamp()

    operation = database.find_log(cik)
    if operation == None:
        raise HTTPException(404, detail="CIK not found.")
    if operation["status"] > 0:
        raise HTTPException(409, detail="Filer still building.")

    # if (time - company["updated"]) < 3600:
    #     raise HTTPException(detail="Filer queried too recently.", status_code=429)

    update, last_report = web.check_new(cik)
    if not update:
        raise HTTPException(200, detail="Filer already up to date.")

    database.edit_status(cik, 1)
    database.edit_filer({"cik": cik}, {"$set": {"last_report": last_report}})

    stamp = {"name": company["name"], "start": time}
    background.add_task(create_historical, cik, company, stamp)

    return {"description": "Filer update started."}


@router.get("/rollback", tags=["filers"], status_code=201, include_in_schema=False)
async def rollback_filer(cik: str, password: str, background: BackgroundTasks):

    filer = database.find_filer(cik)
    if not filer:
        raise HTTPException(404, detail="CIK not found")
    if password != os.environ["ADMIN_PASSWORD"]:
        raise HTTPException(detail="Unable to give access.", status_code=403)

    filings = filer["filings"]
    last_report = filer["last_report"]
    filings.pop(last_report, None)

    for access_number in filings:
        filing = filings[access_number]
        filing_stocks = filing["stocks"]
        for cusip in filing_stocks:
            filing_stock = filing_stocks[cusip]
            first_appearance, last_appearance = analysis.analyze_report(
                filing_stock, filings
            )

            filings[access_number]["stocks"][cusip][
                "first_appearance"
            ] = first_appearance
            filings[access_number]["stocks"][cusip]["last_appearance"] = last_appearance

    filings_sorted = sorted(
        [filings[an] for an in filings], key=lambda d: d["report_date"]
    )
    for access_number in filings:
        filing_stocks = filings[access_number]
        database.edit_filer(
            {"cik": cik}, {"$set": {f"filings.{access_number}.stocks": filing_stocks}}
        )

    filer["filings"] = filings
    last_report = filings_sorted[-1]["access_number"]
    database.edit_filer({"cik": cik}, {"$set": {"last_report": last_report}})

    start = datetime.now().timestamp()
    stamp = {"name": filer["name"], "start": start}
    background.add_task(create_historical, cik, filer, stamp)

    return {"description": "Filer rollback started."}


@router.get(
    "/query",
    tags=["filers"],
    status_code=201,
)
async def query_filer(cik: str, background: BackgroundTasks):
    filer = database.find_filer(cik)
    if filer == None:
        try:
            sec_data = sec_filer_search(cik)
        except Exception:
            raise HTTPException(404, detail="CIK not found.")

        background.add_task(create_filer, sec_data, cik)
        res = {"description": "Filer creation started."}
    else:
        res = update_filer(filer, background)

    return res


@cache(24)
@router.get("/search", tags=["filers"], status_code=200)
async def search_filers(q: str, limit: int = 4):
    options = {"limit": limit, "filter": "thirteen_f = true"}
    hits = search_companies(q, options)

    results = []
    for result in hits:
        results.append(result)

    return {"description": "Successfully queried 13F filers.", "results": hits}


@router.get("/logs", status_code=202)
async def logs(cik: str, start: int = 0):
    try:

        if start == 0:
            calculate_skip = True
            start = -10
        else:
            calculate_skip = False

        log = database.find_log(
            cik,
            {
                "logs": {"$slice": [start, 10**5]},
            },
        )

        if log == None:
            raise HTTPException(404, detail="CIK not found.")

        filer_status = log["status"]
        time = log["time"]

        if filer_status <= 1:
            return JSONResponse(status_code=201, content={"time": time})

        logs = []
        for raw_log in log["logs"]:
            logs.extend(raw_log.split("\n"))

        if filer_status == 2:
            return JSONResponse(status_code=200, content={"logs": logs, "time": time})

        count = len(logs)
        log["count"] = count
        log["logs"] = logs

        if log.get("rate_limit") == True:
            raise HTTPException(503, detail="Rate limited, please wait 60 seconds.")

        required = time["required"]
        elapsed = datetime.now().timestamp() - log["start"]
        remaining = required - elapsed if filer_status <= 3 else 0

        if calculate_skip:
            cursor = database.search_filers(
                [{"$match": {"cik": cik}}, {"$project": {"count": {"$size": "$logs"}}}]
            )
            result = next(cursor)
            start = result["count"]

        log["time"]["elapsed"] = elapsed
        log["time"]["remaining"] = remaining

        database.edit_log(cik, log)

        return {
            "logs": logs,
            "time": time,
            "skipped": start,
            "status": filer_status,
        }

    except (IndexError, TypeError):
        raise HTTPException(404, detail="CIK not found.")
    except Exception as e:
        print(e)
        raise HTTPException(500, detail="Error fetching logs.")


@router.get("/estimate", status_code=202)
async def estimate(cik: str):
    try:
        filer = database.find_log(
            cik,
            {
                "_id": 0,
                "logs": 0,
            },
        )

        if not filer:
            raise HTTPException(404, detail="CIK not found.")

        log = filer["log"]
        time = log["time"]

        elapsed = time["elapsed"]
        required = time["required"]
        status = log["status"]

        return {
            "description": "Found time estimation",
            "time": required - elapsed,
            "status": status,
        }

    except (IndexError, TypeError):
        raise HTTPException(404, detail="CIK not found.")
    except Exception as e:
        print(e)
        raise HTTPException(500, detail="Error fetching time estimation.")


@cache(1 / 6)
@router.get("/info", tags=["filers"], status_code=200)
async def filer_info(cik: str):
    filer = database.find_filer(cik, {"_id": 0, "stocks": 0, "filings": 0})
    if filer == None:
        raise HTTPException(404, detail="Filer not found.")

    status = database.find_log(cik, {"status": 1, "_id": 0})
    filer["status"] = status["status"]

    return {"description": "Found filer.", "filer": filer}


@cache(24)
@router.get("/record", tags=["filers", "records"], status_code=200)
async def record(cik: str):
    filer = database.find_filer(cik, {"_id": 1})
    if filer == None:
        raise HTTPException(404, detail="Filer not found.")

    filename = f"wallstreetlocal-{cik}.json"
    file_path = analysis.create_json(cik, filename)

    return FileResponse(
        file_path, media_type="application/octet-stream", filename=filename
    )


@cache(24)
@router.get("/recordcsv", tags=["filers", "records"], status_code=200)
async def record_csv(cik: str, headers: str = None):
    filer = database.find_filer(cik, {"_id": 1})
    if filer == None:
        raise HTTPException(404, detail="Filer not found.")

    if headers:
        header_string = headers
        try:
            headers = json.loads(header_string)
        except:
            raise HTTPException(
                status_code=422, detail="Malformed headers, unable to process request."
            )

    file_path, filename = analysis.create_csv(cik, headers)

    return FileResponse(
        file_path, media_type="application/octet-stream", filename=filename
    )


@cache(24)
@router.get("/record/timeseries", tags=["filers", "records"], status_code=200)
async def partial_record(cik: str, time: float):
    filer = database.find_filer(cik, {"stocks.local": 1, "tickers": 1, "name": 1})
    if filer == None:
        raise HTTPException(detail="Filer not found.", status_code=404)
    filer_stocks = filer["stocks"]["local"]

    stock_list = []
    cusip_list = list(map(lambda x: x, filer_stocks))
    cursor = database.search_stocks(
        [
            {"$match": {"cusip": {"$in": cusip_list}}},
            {
                "$project": {
                    "_id": 0,
                    "cusip": 1,
                    "ticker": 1,
                    "timeseries": {
                        "$map": {
                            "input": "$timeseries",
                            "as": "time",
                            "in": {
                                "close": "$$time.close",
                                "time": "$$time.time",
                                "diff": {"$abs": {"$subtract": [time, "$$time.time"]}},
                            },
                        }
                    },
                }
            },
            {"$unwind": "$timeseries"},
            {"$sort": {"timeseries.diff": 1}},
            {"$group": {"_id": "$cusip", "timeseries": {"$first": "$timeseries"}}},
            {
                "$project": {
                    "cusip": "$_id",
                    "_id": 0,
                    "timeseries.close": 1,
                    "timeseries.time": 1,
                }
            },
        ]
    )
    for document in cursor:
        cusip = document["cusip"]
        close = document["timeseries"]["close"]
        close_str = f"${close}"
        close_time = document["timeseries"]["time"]
        stock_list.append(
            {
                "cusip": cusip,
                "close": close,
                "close_str": close_str,
                "time": close_time,
            }
        )

    filer = {
        "name": filer["name"],
        "tickers": filer["tickers"],
        "cik": cik,
        "time": time,
        "stocks": stock_list,
    }

    filename = f"wallstreetlocal-{cik}-{int(time)}.json"
    file_path = f"./public/filers/{filename}"
    with open(file_path, "w") as r:
        json.dump(filer, r, indent=6)

    return FileResponse(
        file_path, media_type="application/octet-stream", filename=filename
    )


@cache(24)
@router.get("/top", status_code=200)
async def top():
    with open("./public/top.json") as t:
        filer_ciks = json.load(t)

    try:
        filers_sorted = analysis.sort_and_format(filer_ciks)
    except:
        raise HTTPException(500, detail="Error fetching filers.")

    return {"filers": filers_sorted}


@cache(24)
@router.get("/searched", status_code=200)
async def top():
    with open("./public/searched.json") as t:
        filer_ciks = json.load(t)

    try:
        filers_sorted = analysis.sort_and_format(filer_ciks)
    except:
        raise HTTPException(500, detail="Error fetching filers.")

    return {"filers": filers_sorted}


def create_filer_try(cik):
    try:
        filer = database.find_filer(cik)
        if filer == None:
            try:
                sec_data = sec_filer_search(cik)
            except Exception:
                raise HTTPException(status_code=404, detail="CIK not found.")
            create_filer(sec_data, cik)
        else:
            raise HTTPException(detail="Filer already exists.", status_code=409)
    except Exception as e:
        stamp = str(datetime.now())
        with open(f"./public/errors/error-{stamp}.log", "w") as f:
            error_string = f"Failed to Query Filer {cik}\n{repr(e)}\n{format_exc()}"
            f.write(error_string)
        print("Error Occured\n", e)


# @cache(24)
# @router.get("/top/update", status_code=200, include_in_schema=False)
# async def update_top(password: str, background: BackgroundTasks):
#     if password != "whale":
#         return {}

#     with open("./public/top.json") as t:
#         filer_ciks = json.load(t)

#     background.add_task(create_filer_try, filer_ciks)

#     return {"message": "Filers updating."}


@router.get("/hang", status_code=200, include_in_schema=False)
async def hang_dangling(password: str):

    if password != os.environ["ADMIN_PASSWORD"]:
        raise HTTPException(detail="Unable to give access.", status_code=403)

    results = analysis.end_dangling()

    return {"description": "Successfully ended dangling processes.", "ciks": results}


@router.get("/filings", status_code=200)
async def query_filings(cik: str):

    pipeline = [
        {"$match": {"cik": cik}},
        {"$project": {"filings": {"$objectToArray": "$filings"}}},
        {"$project": {"filings": "$filings.v"}},
        {"$unwind": "$filings"},
        {"$replaceRoot": {"newRoot": "$filings"}},
        {"$project": {"stocks": 0}},
    ]
    cursor = database.search_filers(pipeline)
    if not cursor:
        raise HTTPException(detail="Filer not found.", status_code=404)
    filings = [result for result in cursor]

    return {"filings": filings}
