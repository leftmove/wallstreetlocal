from fastapi import HTTPException, APIRouter
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

import json
import os
import logging
from urllib import parse
from datetime import datetime

from . import worker

from .lib import web
from .lib import database
from .lib import analysis

from .lib.errors import report_error
from .lib.search import search_companies
from .lib.api import sec_filer_search
from .lib.cache import cache


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
        302: {"model": HTTPError, "description": "See other"},
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
        last_report = company["last_report"]
        recent_filing = database.find_filing(cik, last_report)

        for access_number, filing_stocks in web.process_stocks(cik, [recent_filing]):
            recent_filing["stocks"] = filing_stocks
            database.edit_filing(
                {**filer_query, "access_number": access_number},
                {"$set": {"stocks": filing_stocks}},
            )

        database.add_log(cik, "Queried Filer Recent Stocks", company_name, cik)
    except Exception as e:
        report_error(cik, e)
        raise HTTPException(status_code=500, detail="Error getting newest stocks.")

    try:
        database.add_log(cik, "Creating Filer (Newest)", company_name, cik)

        for (
            access_number,
            filing_stock,
        ) in analysis.analyze_filings(cik, [recent_filing], last_report):
            stock_cusip = filing_stock["cusip"]
            stock_query = f"stocks.{stock_cusip}"
            database.edit_filing(
                {**filer_query, "access_number": access_number},
                {"$set": {stock_query: filing_stock}},
            )

        recent_filing = database.find_filing(cik, last_report)
        recent_market_value = recent_filing.get("market_value", "NA")
        database.edit_filer(
            filer_query, {"$set": {"market_value": recent_market_value}}
        )

        filings = database.find_filings(cik)
        for stock_query, log_item in analysis.analyze_stocks(cik, filings):
            database.edit_filer(filer_query, stock_query)
            database.add_log(cik, log_item)

        database.add_log(cik, "Updated Filer Recent Stocks", company_name, cik)
        database.edit_status(cik, 2)
    except Exception as e:
        report_error(cik, e)
        database.edit_filer(
            {"cik": cik}, {"$set": {"market_value": "NA", "update": False}}
        )
        database.add_log(cik, "Failed to Update Filer Recent Stocks", company_name, cik)
        database.edit_status(cik, 2)

    start = stamp["start"]
    stamp = {"time.elapsed": datetime.now().timestamp() - start}
    database.edit_log(cik, stamp)
    database.add_query_log(cik, "create-latest")


def create_historical(cik, company, stamp):
    filer_query = {"cik": cik}
    company_name = company["name"]
    last_report = company["last_report"]

    try:
        filings = database.find_filings(cik)
        for access_number, filing_stocks in web.process_stocks(cik, filings):
            database.edit_filing(
                {**filer_query, "access_number": access_number},
                {"$set": {"stocks": filing_stocks}},
            )

        database.add_log(cik, "Queried Filer Historical Stocks", company_name, cik)
    except Exception as e:
        report_error(cik, e)
        database.add_log(
            cik, "Failed to Query Filer Historical Stocks", company_name, cik
        )

    try:
        database.add_log(cik, "Creating Filer (Historical)", company_name, cik)
        filings = database.find_filings(cik)
        for (
            access_number,
            filing_stock,
        ) in analysis.analyze_filings(cik, filings, last_report):
            stock_cusip = filing_stock["cusip"]
            stock_query = f"stocks.{stock_cusip}"
            database.edit_filing(
                {**filer_query, "access_number": access_number},
                {"$set": {stock_query: filing_stock}},
            )

        filings = database.find_filings(cik)
        for stock_query, log_item in analysis.analyze_stocks(cik, filings):
            database.edit_filer(filer_query, stock_query)
            database.add_log(cik, log_item)

        allocation_list = analysis.analyze_allocation(cik)
        aum_list = analysis.analyze_aum(cik)
        database.edit_filer(
            {"cik": cik},
            {
                "$set": {
                    "analysis.allocation": allocation_list,
                    "analysis.aum_timeseries": aum_list,
                }
            },
        )

        database.add_log(cik, "Updated Filer Historical Stocks", company_name, cik)
        database.edit_status(cik, 0)
    except Exception as e:
        report_error(cik, e)
        database.edit_filer(filer_query, {"$set": {"update": False}})
        database.add_log(
            cik, "Failed to Update Filer Historical Stocks", company_name, cik
        )
        database.edit_status(cik, 0)

    start = stamp["start"]
    stamp = {"time.elapsed": datetime.now().timestamp() - start, "logs": []}
    database.edit_log(cik, stamp)
    database.add_query_log(cik, "create-historical")


def create_filer(cik, sec_data):
    company, stamp = web.initalize_filer(cik, sec_data)
    create_recent(cik, company, stamp)
    create_historical(cik, company, stamp)


def update_filer(company):
    cik = company["cik"]
    time = datetime.now().timestamp()

    operation = database.find_log(cik)
    if operation is None:
        raise HTTPException(404, detail="CIK not found.")
    if operation["status"] == 2 or operation["status"] == 1:
        raise HTTPException(  # @IgnoreException
            302, detail="Filer continuous building."
        )  # @IgnoreException
    if operation["status"] > 2:
        raise HTTPException(409, detail="Filer still building.")

    update, last_report = web.check_new(cik)
    if not update:
        raise HTTPException(200, detail="Filer already up to date.")  # @IgnoreException

    database.edit_status(cik, 1)
    database.edit_filer({"cik": cik}, {"$set": {"last_report": last_report}})

    stamp = {"name": company["name"], "start": time}
    worker.create_historical.delay(cik, company, stamp)

    return {"description": "Filer update started."}


@router.get(
    "/query",
    tags=["filers"],
    status_code=201,
)
async def query_filer(cik: str):
    filer = database.find_filer(cik)
    if not filer:
        try:
            sec_data = sec_filer_search(cik)
        except Exception as e:
            logging.error(e)
            raise HTTPException(404, detail="CIK not found.")

        worker.create_filer.delay(cik, sec_data)
        res = {"description": "Filer creation started."}
    else:
        res = update_filer(filer)

    return res


@router.get("/rollback", tags=["filers"], status_code=201, include_in_schema=False)
async def rollback_filer(cik: str, password: str):
    filer = database.find_filer(cik, {"last_report": 1})
    if not filer:
        raise HTTPException(404, detail="CIK not found.")
    if password != os.environ["ADMIN_PASSWORD"]:
        raise HTTPException(detail="Unable to give access.", status_code=403)

    filings = database.map_filings(cik)
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

            filings[access_number]["stocks"][cusip]["first_appearance"] = (
                first_appearance
            )
            filings[access_number]["stocks"][cusip]["last_appearance"] = last_appearance

    filings_sorted = sorted(
        [filings[an] for an in filings], key=lambda d: d["report_date"]
    )
    for access_number in filings:
        filing_stocks = filings[access_number]["stocks"]
        database.edit_filing(
            {"cik": cik, "access_number": access_number},
            {"$set": {"stocks": filing_stocks}},
        )

    last_report = filings_sorted[-1]["access_number"]
    database.edit_filer({"cik": cik}, {"$set": {"last_report": last_report}})

    start = datetime.now().timestamp()
    stamp = {"name": filer["name"], "start": start}
    worker.create_historical(cik, filer, stamp)

    return {"description": "Filer rollback started."}


@cache(24)
@router.get("/search", tags=["filers"], status_code=200)
async def search_filers(q: str, limit: int = 4):
    hits = await search_companies(q, limit=limit, filter="thirteen_f = true")

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

        if log is None:
            raise HTTPException(404, detail="CIK not found.")

        filer_status = log["status"]
        time = log["time"]

        if filer_status <= 1:
            return JSONResponse(status_code=201, content={"time": time})

        logs = []
        for raw_log in log["logs"]:
            logs.extend(raw_log.split("\n"))

        if calculate_skip:
            cursor = database.search_logs(
                [
                    {"$match": {"cik": cik}},
                    {"$project": {"count": {"$size": ["$logs"]}}},
                ]
            )
            result = next(cursor)
            start = result["count"]

        if filer_status == 2:
            return JSONResponse(
                status_code=200, content={"logs": logs, "time": time, "skip": start}
            )

        count = len(logs)
        log["count"] = count
        log["logs"] = logs

        if log.get("rate_limit"):
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
            "skip": start,
            "status": filer_status,
        }

    except (IndexError, TypeError):
        raise HTTPException(404, detail="CIK not found.")
    except Exception as e:
        logging.error(e)
        raise HTTPException(500, detail="Error fetching logs.")


@router.get("/estimate", status_code=202)
async def estimate(cik: str):
    try:
        log = database.find_log(
            cik,
            {
                "_id": 0,
                "log.logs": 0,
            },
        )

        if not log:
            raise HTTPException(404, detail="CIK not found.")

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
        logging.error(e)
        raise HTTPException(500, detail="Error fetching time estimation.")


@cache(1 / 6)
@router.get("/info", tags=["filers"], status_code=200)
async def filer_info(cik: str):
    filer = database.find_filer(cik, {"_id": 0, "stocks": 0})
    if filer is None:
        raise HTTPException(404, detail="Filer not found.")

    status = database.find_log(cik, {"status": 1, "_id": 0})
    filer["status"] = status["status"]

    return {"description": "Found filer.", "filer": filer}


@cache(24)
@router.get("/record", tags=["filers", "records"], status_code=200)
async def record(cik: str):
    filer = database.find_filer(cik, {"_id": 1})
    if filer is None:
        raise HTTPException(404, detail="Filer not found.")
    filer_log = database.find_log(cik, {"status": 1})
    if filer_log.get("status", 100) > 0:
        raise HTTPException(409, detail="Filer still building.")

    filename = f"wallstreetlocal-{cik}.json"
    filer = database.search_filer(cik, {"_id": 0, "stocks.timeseries": 0})
    file_path = analysis.create_json(filer, filename)

    return FileResponse(
        file_path, media_type="application/octet-stream", filename=filename
    )


@cache(24)
@router.get("/recordcsv", tags=["filers", "records"], status_code=200)
async def record_csv(cik: str, headers: str = None):
    filer = database.find_filer(cik, {"_id": 1})
    if filer is None:
        raise HTTPException(404, detail="Filer not found.")
    filer_log = database.find_log(cik, {"status": 1})
    if filer_log.get("status", 100) > 0:
        raise HTTPException(409, detail="Filer still building.")

    if headers:
        try:
            headers_string = parse.unquote(headers)
            headers = json.loads(headers_string)
            header_hash = hash(headers_string)
            file_name = f"wallstreetlocal-{cik}-{header_hash}.csv"
        except Exception as e:
            print(e)
            raise HTTPException(
                status_code=422, detail="Malformed headers, unable to process request."
            )
    else:
        file_name = f"wallstreetlocal-{cik}.csv"

    filer = database.find_filer(cik, {"stocks": 1})
    stock_list = filer["stocks"]
    file_path, filename = analysis.create_csv(stock_list, file_name, headers)

    return FileResponse(
        file_path, media_type="application/octet-stream", filename=filename
    )


@cache(24)
@router.get("/record/timeseries", tags=["filers", "records"], status_code=200)
async def partial_record(cik: str, time: float):
    filer = database.find_filer(cik, {"stocks": 1, "tickers": 1, "name": 1})
    if not filer:
        raise HTTPException(detail="Filer not found.", status_code=404)
    filer_log = database.find_log(cik, {"status": 1})
    if filer_log.get("status", 100) > 0:
        raise HTTPException(409, detail="Filer still building.")

    filer_stocks = filer["stocks"]
    stock_list = []
    cusip_list = list(map(lambda x: x["cusip"], filer_stocks))
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
    file_path = analysis.create_json(filer, filename)

    return FileResponse(
        file_path, media_type="application/octet-stream", filename=filename
    )


@cache(24)
@router.get("/record/filing", tags=["filers", "records"], status_code=200)
async def record_filing(cik: str, access_number):
    filer = database.find_filer(cik, {"_id": 1})
    if filer is None:
        raise HTTPException(404, detail="Filer not found.")
    filer_log = database.find_log(cik, {"status": 1})
    if filer_log.get("status", 100) > 0:
        raise HTTPException(409, detail="Filer still building.")

    filing = database.find_filing(cik, access_number)
    filename = f"wallstreetlocal-{cik}-{access_number}.json"
    file_path = analysis.create_json(filing, filename)

    return FileResponse(
        file_path, media_type="application/octet-stream", filename=filename
    )


@cache(24)
@router.get("/record/filingcsv", tags=["filers", "records"], status_code=200)
async def record_filing_csv(cik: str, access_number: str, headers: str = None):
    filer = database.find_filer(cik, {"_id": 1})
    if filer is None:
        raise HTTPException(404, detail="Filer not found.")
    filer_log = database.find_log(cik, {"status": 1})
    if filer_log.get("status", 100) > 0:
        raise HTTPException(409, detail="Filer still building.")

    if headers:
        try:
            headers_string = parse.unquote(headers)
            headers = json.loads(headers_string)
            headers_string = headers_string + f"-{access_number}"
            header_hash = hash(headers_string)
            file_name = f"wallstreetlocal-{cik}{header_hash}.csv"
        except Exception as e:
            print(e)
            raise HTTPException(
                status_code=422, detail="Malformed headers, unable to process request."
            )
    else:
        file_name = f"wallstreetlocal-{cik}-{access_number}.csv"

    filing = database.find_filing(cik, access_number)
    stock_dict = filing["stocks"]
    stock_list = [stock_dict[cusip] for cusip in stock_dict]

    file_path, filename = analysis.create_csv(stock_list, file_name, headers)
    return FileResponse(
        file_path, media_type="application/octet-stream", filename=filename
    )


cwd = os.getcwd()

top_ciks_path = f"{cwd}/static/top.json"
with open(top_ciks_path, "r") as f:
    top_cik_list = json.load(f)


@cache(24)
@router.get("/top", status_code=200)
async def top_ciks():
    try:
        filers_sorted = analysis.sort_and_format(top_cik_list)
    except Exception as e:
        print(e)
        raise HTTPException(500, detail="Error fetching filers.")

    return {"filers": filers_sorted}


popular_ciks_path = f"{cwd}/static/popular.json"
with open(popular_ciks_path, "r") as f:
    popular_cik_list = json.load(f)


@cache(24)
@router.get("/searched", status_code=200)
async def popular_ciks():
    try:
        filers_sorted = analysis.sort_and_format(popular_cik_list)
    except Exception as e:
        print(e)
        raise HTTPException(500, detail="Error fetching filers.")

    return {"filers": filers_sorted}


def create_filer_try(cik):
    try:
        filer = database.find_filer(cik)
        if filer is None:
            try:
                sec_data = sec_filer_search(cik)
            except Exception:
                raise HTTPException(status_code=404, detail="CIK not found.")
            create_filer(cik, sec_data)
        else:
            raise HTTPException(detail="Filer already exists.", status_code=409)
    except Exception as e:
        report_error(cik, e)


def create_filer_replace(cik):
    try:
        filer = database.find_filer(cik, {"_id": 1})
        if filer:
            database.delete_filer(cik)
        try:
            sec_data = sec_filer_search(cik)
        except Exception:
            raise HTTPException(status_code=404, detail="CIK not found.")
        create_filer(cik, sec_data)

    except Exception as e:
        report_error(cik, e)


@router.get("/remove", status_code=200, include_in_schema=False)
async def remove_filer(cik: str, password: str):
    if password != os.environ["ADMIN_PASSWORD"]:
        raise HTTPException(detail="Unable to give access.", status_code=403)

    database.delete_filer(cik)

    return {"description": "Successfully deleted filer."}


@router.get("/hang", status_code=200, include_in_schema=False)
async def hang_dangling(password: str):
    if password != os.environ["ADMIN_PASSWORD"]:
        raise HTTPException(detail="Unable to give access.", status_code=403)

    results = analysis.end_dangling()

    return {"description": "Successfully ended dangling processes.", "ciks": results}


@router.get("/filings", status_code=200)
async def query_filings(cik: str):
    pipeline = [
        {"$match": {"cik": cik, "form": "13F-HR"}},
        {"$project": {"stocks": 0, "_id": 0}},
    ]
    cursor = database.search_filings(pipeline)
    if not cursor:
        raise HTTPException(detail="Filer not found.", status_code=404)
    filings = [result for result in cursor]

    return {"filings": filings}


@router.get("/analysis", status_code=200)
async def analysis_info(cik: str, key: str):
    filer_log = database.find_log(cik, {"status": 1})
    if not filer_log:
        raise HTTPException(404, detail="CIK not found.")
    if filer_log.get("status", 100) > 0:
        raise HTTPException(409, detail="Filer still building.")

    analysis_key = f"analysis.{key}"
    filer = database.find_filer(cik, {analysis_key: 1})
    info = filer["analysis"][key]

    return {"filings": info}
