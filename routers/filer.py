from fastapi import BackgroundTasks, HTTPException, APIRouter
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from datetime import datetime
import json
import asyncio
import os

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


def create_filer(sec_data, cik):

    # Initialize Filer
    company, stamp, start = web.initalize_filer(cik, sec_data)
    company_name = company["name"]
    filer_query = {"cik": cik}

    # Gather New Stocks
    try:
        filings = company["filings"]
        last_report = company["last_report"]
        new_stocks = web.process_recent_stocks(cik, filings, last_report)

        database.edit_filer(filer_query, {"$set": {"cik": cik, "stocks": new_stocks}})
        database.add_log(cik, "Queried Filer Recent Stocks", company_name, cik)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error getting newest stocks.")

    # Update Newest Stocks
    try:
        analyze_recent_stocks(cik, new_stocks, new_filings)

        database.add_log(cik, "Updated Filer Recent Stocks")
        database.edit_status(cik, 2)
        # Do actual analysis here, like market value
    except Exception as e:
        database.edit_filer(
            {"cik": cik}, {"$set": {"market_value": "NA", "update": False}}
        )
        database.add_log(cik, "Failed to Update Filer Recent Stocks")
        database.edit_status(cik, 2)
        print(e)

    stamp = {"time.elapsed": datetime.now().timestamp() - start}
    database.edit_log(cik, stamp)
    database.add_query_log(cik, "create-latest")

    # Gather All Filings
    try:
        recent_filing = filings[0]
        new_filings = web.process_historical_filing(filings)

        database.edit_filer(
            filer_query, {"$set": {"filings": new_filings, "filings.0": recent_filing}}
        )
        database.add_log(cik, "Queried Filer Recent Filing", company_name, cik)
    except Exception as e:
        print(e)
        database.add_log("Failed to Query Filer Historical Filings")

    # Gather Historical Stocks
    try:
        new_stocks = web.process_historical_stocks(filings)

        database.edit_filer(filer_query, {"$set": {"cik": cik, "stocks": new_stocks}})
        database.add_log(cik, "Queried Filer Historical Stocks", company_name, cik)
    except Exception as e:
        print(e)
        database.add_log(cik, "Failed to Query Filer Historical Stocks")

    # Update Historical Stocks
    try:
        analyzed_stocks = update_historical_stocks(cik, new_stocks, new_filings)
        analyze_historical_stocks(cik, analyzed_stocks)

        database.add_log(cik, "Updated Filer Historical Stocks")
        database.edit_status(cik, 0)
        # Do actual analysis here, like market value
    except Exception as e:
        database.edit_filer(
            {"cik": cik}, {"$set": {"market_value": "NA", "update": False}}
        )
        database.add_log(cik, "Failed to Update Filer Recent Stocks")
        print(e)

    stamp = {"time.elapsed": datetime.now().timestamp() - start}
    database.edit_log(cik, stamp)
    database.add_query_log(cik, "create-historical")


def update_filer(company):
    cik = company["cik"]
    time = datetime.now().timestamp()

    operation = database.find_log(cik)
    if operation == None:
        raise HTTPException(404, detail="CIK not found.")
    if operation["status"] > 2:
        raise HTTPException(409, detail="Filer still building.")

    # if (time - company["updated"]) < 3600:
    #     raise HTTPException(detail="Filer queried too recently.", status_code=429)

    update = web.check_new(cik=cik, last_updated=company["updated"])
    if update:
        database.edit_status(cik, 1)
        filings, latest_report = web.process_filer_newest(company)
        scraped_stocks = web.process_latest_stocks(company)
        database.edit_filer(
            {"cik": cik},
            {
                "$set": {
                    "updated": time,
                    "filings": filings,
                    "latest_report": latest_report,
                    "stocks.local": scraped_stocks,
                }
            },
        )
        try:
            analysis.analyze_newest(cik, scraped_stocks)
        except Exception as e:
            database.edit_filer({"cik": cik}, {"$set": {"update": False}})
            database.edit_status(cik, 1)
            print(e)
        return {"description": "Updated filer."}
    else:
        raise HTTPException(200, detail="Filer already up to date.")


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
        # background.add_task(web.estimate_time_newest, cik) # To be added back when it actually works
        res = {"description": "Filer creation started."}
    else:
        res = update_filer(filer)

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

        log["time"]["elapsed"] = elapsed
        log["time"]["remaining"] = remaining

        database.edit_log(cik, log)

        return {
            "logs": logs,
            "time": time,
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
async def record_csv(cik: str):
    filer = database.find_filer(cik, {"_id": 1})
    if filer == None:
        raise HTTPException(404, detail="Filer not found.")

    filename = f"wallstreetlocal-{cik}.csv"
    file_path = analysis.create_csv(cik, filename)

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
                raise HTTPException(404, detail="CIK not found.")

            create_filer(sec_data, cik)
        else:
            raise HTTPException(detail="Filer already exists.", status_code=409)
    except Exception as e:
        stamp = str(datetime.now())
        with open(f"./public/errors/error-{stamp}.log", "w+") as f:
            f.write(str(e))
        print("Error Occured\n", e)


@cache(1)
@router.get("/query/saved", status_code=200, include_in_schema=False)
async def query_top(password: str, background: BackgroundTasks):
    if password != os.environ["ADMIN_PASSWORD"]:
        raise HTTPException(detail="Unable to give access.", status_code=403)

    with open("./public/searched.json") as t:
        filer_ciks = json.load(t)
    with open("./public/top.json") as t:
        filer_ciks.extend(json.load(t))

    def cycle_filers(ciks):
        for cik in ciks:
            create_filer_try(cik)

    background.add_task(cycle_filers, filer_ciks)
    return {"description": "Started querying filers."}


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
    if password != "whale":
        return {}

    results = analysis.end_dangling()

    return {"description": "Successfully ended dangling processes.", "ciks": results}
