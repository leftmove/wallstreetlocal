from fastapi import HTTPException, APIRouter, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

import json
import os
import logging
import re
from urllib import parse
from datetime import datetime

from worker import tasks as worker
from .responses import BrowserCachedResponse

from .lib import web
from .lib import database
from .lib import analysis

from .lib.errors import report_error
from .lib.search import search_companies
from .lib.api import sec_filer_search
from .lib.cache import cache

production_environment = getattr(worker, "production_environment", False)
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "password")


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
# 5 : Filer is broken, and has no query data. Will never be updated unless manually.
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

        try:
            for access_number, filing_stocks in web.process_stocks(
                cik, [recent_filing]
            ):
                recent_filing["stocks"] = filing_stocks
                database.edit_filing(
                    {**filer_query, "access_number": access_number},
                    {"$set": {"stocks": filing_stocks}},
                )
        except (
            IndexError
        ) as e:  # Filer is broken, no forms found. Special case for first query.
            break_filer(cik)
            report_error(cik, e)
            raise HTTPException(404, detail="Forms not found for filer.")

        database.add_log(cik, "Queried Filer Recent Stocks", company_name, cik)
    except Exception as e:
        report_error(cik, e)
        raise HTTPException(status_code=500, detail="Error getting newest stocks.")

    try:
        database.add_log(cik, "Creating Filer (Newest)", company_name, cik)
        recent_filing = database.find_filing(cik, last_report)
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
        recent_market_value = recent_filing.get("market_value", "N/A")
        database.edit_filer(
            filer_query, {"$set": {"market_value": recent_market_value}}
        )

        for stock_query, log_item in analysis.analyze_stocks(cik, [recent_filing]):
            database.edit_filer(filer_query, stock_query)
            database.add_log(cik, log_item)

        database.add_log(cik, "Updated Filer Recent Stocks", company_name, cik)
        database.edit_status(cik, 2)
    except Exception as e:
        report_error(cik, e)
        database.edit_filer(
            {"cik": cik}, {"$set": {"market_value": "N/A", "update": False}}
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

    # The following code is far too nested. This is because originally, filings were
    # processed all at once. Every filing was queried, then every filing analyzed, then
    # every filing updated. This was changed to a more user-friendly method where each
    # individual filing is queried, analyzed, and updated by itself. The new approach
    # is far more flexible, and feels faster, but the code was built for the first
    # approach, so in its current state, the code is too nested.
    # TLDR: This should be refactored in the future.

    try:
        database.add_log(cik, "Creating Filer (Historical)", company_name, cik)
        filings = [
            result
            for result in database.search_filings(
                [
                    {
                        "$match": {
                            "cik": cik,
                            "access_number": {"$ne": last_report},
                            "form": {"$in": database.holding_forms},
                        }
                    },
                    {"$group": {"_id": "$access_number", "doc": {"$first": "$$ROOT"}}},
                    {"$replaceRoot": {"newRoot": "$doc"}},
                    {"$sort": {"report_date": -1}},
                ]
            )
        ]
        access_numbers = [filing["access_number"] for filing in filings]
        database.edit_filer(filer_query, {"$set": {"filings": access_numbers}})

        for access_number, filing_stocks in web.process_stocks(cik, filings):

            database.edit_filing(
                {**filer_query, "access_number": access_number},
                {"$set": {"stocks": filing_stocks}},
            )
            database.add_log(cik, "Queried Filing Stocks", company_name, access_number)

            try:
                previous_access = last_report
                current_filing = database.find_filing(cik, access_number)

                for (
                    access_number,
                    filing_stock,
                ) in analysis.analyze_filings(cik, [current_filing], last_report):
                    stock_cusip = filing_stock["cusip"]
                    stock_query = f"stocks.{stock_cusip}"
                    database.edit_filing(
                        {**filer_query, "access_number": access_number},
                        {"$set": {stock_query: filing_stock}},
                    )

                    for change_query, change_stock in analysis.analyze_changes(
                        cik, previous_access, access_number
                    ):
                        if change_query is None:
                            continue
                        database.edit_filing(
                            {
                                **filer_query,
                                "access_number": access_number,
                                "stocks": {"$exists": True},
                            },
                            {"$set": {change_query: change_stock}},
                        )

                current_filing = database.find_filing(cik, access_number)
                for stock_query, log_item in analysis.analyze_stocks(
                    cik, [current_filing]
                ):

                    database.edit_filer(filer_query, stock_query)
                    database.add_log(cik, log_item)

                previous_access = access_number
                database.add_log(
                    cik, "Updated Filing Stocks", company_name, access_number
                )

            except Exception as e:
                report_error(cik, e)
                database.edit_filer(filer_query, {"$set": {"update": False}})
                database.add_log(
                    cik, "Failed to Update Filer Historical Stocks", company_name, cik
                )
                database.edit_status(cik, 5)

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
        database.add_log(cik, "Queried Filer Historical Stocks", company_name, cik)
        database.edit_status(cik, 0)

    except Exception as e:
        report_error(cik, e)
        database.edit_status(cik, 5)
        database.add_log(
            cik, "Failed to Query Filer Historical Stocks", company_name, cik
        )
        return

    start = stamp["start"]
    stamp = {"time.elapsed": datetime.now().timestamp() - start, "logs": []}
    database.edit_log(cik, stamp)
    database.edit_status(cik, 0)
    database.add_query_log(cik, "create-historical")


def create_filer(cik, sec_data):
    company, stamp = web.initialize_filer(cik, sec_data)
    create_recent(cik, company, stamp)
    create_historical(cik, company, stamp)


@router.get(
    "/query",
    tags=["filers"],
    status_code=201,
)
async def query_filer(cik: str, background: BackgroundTasks = BackgroundTasks):
    filer = database.find_filer(cik)
    if not filer:
        try:
            sec_data = sec_filer_search(cik)
        except Exception as e:
            logging.error(e)
            raise HTTPException(404, detail="CIK not found.")

        if production_environment:
            worker.create_filer.delay(cik, sec_data)
        else:
            background.add_task(create_filer, cik, sec_data)

        return {"description": "Filer creation started."}
    else:
        return update_filer(filer, background=background)


def update_filer(company, background: BackgroundTasks = BackgroundTasks):
    cik = company["cik"]
    time = datetime.now().timestamp()

    operation = database.find_log(cik)
    if operation is None:
        raise HTTPException(404, detail="Filer log not found.")
    elif (
        production_environment and operation["status"] == 2 or operation["status"] == 1
    ):
        raise HTTPException(  # @IgnoreException
            302, detail="Filer is partially building."
        )
    elif operation["status"] >= 2:
        raise HTTPException(409, detail="Filer still building.")  # @IgnoreException

    update, last_report = web.check_new(cik)
    if not update:
        raise HTTPException(200, detail="Filer already up to date.")  # @IgnoreException

    database.edit_status(cik, 1)
    database.edit_filer({"cik": cik}, {"$set": {"last_report": last_report}})

    stamp = {"name": company["name"], "start": time}
    if production_environment:
        worker.create_recent.delay(cik, company, stamp)
    else:
        background.add_task(create_recent, cik, company, stamp)

    return {"description": "Filer update started."}


def repair_filer(cik: str):
    filer = database.find_filer(cik)
    if not filer:
        raise LookupError("CIK not found.")

    filings = database.find_filings(cik, {"_id": 0}, {"$in": database.holding_forms})
    forms = web.check_forms(cik)

    query_errors = []
    for filing in filings:
        if filing["form"] not in forms:
            query_errors.append(filing)
            report_error(cik, Exception("Form not found."))

    if query_errors:
        database.add_statistic(cik, "repair", {"errors": query_errors}, None)
        create_filer_replace(cik)


@router.get("/repair", tags=["filers"], status_code=201)
def inspect_filer(
    cik: str, password: str, background: BackgroundTasks = BackgroundTasks
):

    if password != ADMIN_PASSWORD:
        raise HTTPException(detail="Unable to give access.", status_code=403)

    try:
        if production_environment:
            worker.repair_filer.delay(cik)
        else:
            background.add_task(repair_filer, cik)
    except LookupError:
        raise HTTPException(404, detail="CIK not found.")
    except Exception as e:
        report_error(cik, e)
        raise HTTPException(500, detail="Error inspecting filer.")

    return {"description": "Filer repair started."}


@router.get("/rollback", tags=["filers"], status_code=201, include_in_schema=False)
async def rollback_filer(
    cik: str, password: str, background: BackgroundTasks = BackgroundTasks
):
    filer = database.find_filer(cik, {"last_report": 1})
    if not filer:
        raise HTTPException(404, detail="CIK not found.")
    if password != ADMIN_PASSWORD:
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

            filings[access_number]["stocks"][cusip][
                "first_appearance"
            ] = first_appearance
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

    if production_environment:
        worker.create_historical.delay(cik, filer, stamp)
    else:
        background.add_task(create_historical, cik, filer, stamp)

    return {"description": "Filer rollback started."}


async def break_filer(cik: str):
    document_reports = web.check_forms(cik)
    if len(document_reports) == 0:
        database.edit_status(cik, 5)
        database.add_log(cik, "Filer has no filings.", "Error", cik)
    else:
        report_error(cik, Exception("Filer is broken but has forms."))


@router.get("/search", tags=["filers"], status_code=200)
@cache(24)
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
        raise HTTPException(500, detail="Error fetching logs.")  # @IgnoreException


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
        raise HTTPException(
            500, detail="Error fetching time estimation."  # @IgnoreException
        )  # @IgnoreException


@router.get("/info", tags=["filers"], status_code=200)
@cache(1 / 6)
async def filer_info(cik: str):
    filer = database.find_filer(cik, {"_id": 0, "stocks": 0, "analysis": 0})
    if filer is None:
        raise HTTPException(404, detail="Filer not found.")

    status = database.find_log(cik, {"status": 1, "_id": 0})
    if status is None:
        raise HTTPException(404, detail="Filer log not found.")
    filer["status"] = status["status"]

    return {"description": "Found filer.", "filer": filer}


def convert_title(d):
    if d:
        d = re.sub(
            r"(^\w|\s\w)(\S*)",
            lambda m: (
                m.group(1).upper() + m.group(2).lower()
                if not re.search(r"[a-z][A-Z]|[A-Z][a-z]", m.group(1) + m.group(2))
                else m.group(1) + m.group(2)
            ),
            d,
        )
        for word in ["LLC", "LP", "L.P.", "LLP", "N.A."]:
            d = d.replace(word.capitalize(), word)
    return d


def snake_to_camel(s: dict):
    def to_camel_case(snake_str):
        components = snake_str.split("_")
        return components[0] + "".join(x.title() for x in components[1:])

    def convert_keys(obj):
        if isinstance(obj, dict):
            new_obj = {}
            for k, v in obj.items():
                new_obj[to_camel_case(k)] = convert_keys(v)
            return new_obj
        elif isinstance(obj, list):
            return [convert_keys(i) for i in obj]
        else:
            return obj

    return convert_keys(s)


people_dict = {
    "1067983": ["Warren Buffet"],
    "1167483": ["Chase Coleman", "Scott Shleifer"],
    "1336528": ["Bill Ackman"],
    "1350694": ["Ray Dalio"],
}  # Change later


@router.get("/preview", tags=["filers"], status_code=200)
@cache(24)
async def filer_preview(cik: str, holding_count: int = 5):

    if holding_count > 10:
        raise HTTPException(422, detail="Holding count cannot exceed 10.")

    filer = database.find_filer(
        cik,
        {
            "_id": 0,
            "cik": 1,
            "name": 1,
            "tickers": 1,
            "market_value": 1,
            "last_report": 1,
        },
    )
    if filer is None:
        raise HTTPException(404, detail="Filer not found.")

    status = database.find_log(cik, {"status": 1, "_id": 0})
    if status is None:
        raise HTTPException(404, detail="Filer log not found.")
    filer["status"] = status["status"]

    filer_cik = filer["cik"]
    filer["name"] = convert_title(filer["name"])

    if filer_cik in people_dict:
        filer["people"] = people_dict[filer_cik]
    else:
        filer["people"] = filer.get("people", [])

    top_holding_length = 5 + 1
    holding_count = holding_count + 1

    last_report = filer["last_report"]
    filing = [
        result
        for result in database.search_filings(
            [
                {"$match": {"cik": filer_cik, "access_number": last_report}},
                {
                    "$addFields": {
                        "stocks": {"$objectToArray": "$stocks"},
                    }
                },
                {"$unwind": "$stocks"},
                {"$sort": {"stocks.v.market_value": -1}},
                {"$limit": 5},
                {
                    "$group": {
                        "_id": "$_id",
                        "stocks": {"$push": {"k": "$stocks.k", "v": "$stocks.v"}},
                        "report_date": {"$first": "$report_date"},
                    }
                },
                {
                    "$addFields": {
                        "stocks": {"$arrayToObject": "$stocks"},
                    }
                },
                {"$project": {"_id": 0, "stocks": 1, "report_date": 1}},
            ]
        )
    ][0]
    raw_holdings = [
        s["cusip"]
        for s in sorted(
            filing["stocks"].values(),
            key=lambda x: x.get("market_value", 0),
            reverse=True,
        )[: min(holding_count, len(filing["stocks"]))]
    ]
    filer["date"] = datetime.fromtimestamp(filing["report_date"]).strftime("%B %d, %Y")

    stock_list = [
        {
            **s,
            "market_value": filing["stocks"][s["cusip"]]["market_value"],
            "portfolio_percent": filing["stocks"][s["cusip"]]["ratios"][
                "portfolio_percent"
            ],
        }
        for s in database.find_stocks(
            "cusip",
            {"$in": raw_holdings},
            {
                "_id": 0,
                "cusip": 1,
                "name": 1,
                "ticker": 1,
            },
        )
    ]
    filer["top_holdings"] = [
        s["ticker"] for s in stock_list[: min(top_holding_length, len(stock_list))]
    ]  # Doesn't handle for no tickers
    filer["holdings"] = stock_list
    filer = snake_to_camel(filer)

    return {"description": "Filer preview loaded.", "filer": filer}


def get_sample_filers():
    cik_list = [
        "1067983",
        "1167483",
        "102909",
        "1350694",
        "1336528",
        "1364742",
        "93751",
        "19617",
        "73124",
        "884546",
    ]
    filer_list = database.find_filers(
        {"cik": {"$in": cik_list}},
        {
            "_id": 0,
            "cik": 1,
            "name": 1,
            "tickers": 1,
            "market_value": 1,
            "last_report": 1,
        },
    )
    final_list = []

    for filer in filer_list:

        filer_cik = filer["cik"]
        filer["name"] = convert_title(filer["name"])

        if filer_cik in people_dict:
            filer["people"] = people_dict[filer_cik]
        else:
            filer["people"] = []

        last_report = filer["last_report"]
        filing = [
            result
            for result in database.search_filings(
                [
                    {"$match": {"cik": filer_cik, "access_number": last_report}},
                    {"$addFields": {"stocks": {"$objectToArray": "$stocks"}}},
                    {"$unwind": "$stocks"},
                    {"$sort": {"stocks.v.market_value": -1}},
                    {"$limit": 5},
                    {
                        "$group": {
                            "_id": "$_id",
                            "stocks": {"$push": {"k": "$stocks.k", "v": "$stocks.v"}},
                        }
                    },
                    {"$addFields": {"stocks": {"$arrayToObject": "$stocks"}}},
                    {"$project": {"_id": 0, "stocks": 1, "report_date": 1}},
                ]
            )
        ][0]
        raw_holdings = [
            s["cusip"]
            for s in sorted(
                filing["stocks"].values(),
                key=lambda x: x.get("market_value", 0),
                reverse=True,
            )[: min(11, len(filing["stocks"]))]
        ]
        filer["date"] = datetime.fromtimestamp(filing["report_date"]).strftime(
            "%B %d, %Y"
        )

        stock_list = [
            {
                **s,
                "market_value": filing["stocks"][s["cusip"]]["market_value"],
                "portfolio_percent": filing["stocks"][s["cusip"]]["ratios"][
                    "portfolio_percent"
                ],
            }
            for s in database.find_stocks(
                "cusip",
                {"$in": raw_holdings},
                {
                    "_id": 0,
                    "cusip": 1,
                    "name": 1,
                    "ticker": 1,
                },
            )
        ]
        filer["top_holdings"] = [
            s["ticker"] for s in stock_list[: min(4, len(stock_list))]
        ]  # Doesn't handle for no tickers
        filer["holdings"] = stock_list

        filer = snake_to_camel(filer)

        final_list.append(filer)

    final_list = sorted(final_list, key=lambda x: cik_list.index(x["cik"]))

    print("Sample Filers Loaded.")
    print(final_list)

    return final_list


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
            report_error(cik, e)

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


cwd = os.getcwd()

top_ciks_path = f"{cwd}/static/top.json"
with open(top_ciks_path, "r") as f:
    top_cik_list = json.load(f)


@router.get("/top", status_code=200)
@cache(24)
async def top_ciks():
    try:
        filers_sorted = analysis.sort_and_format(top_cik_list)
    except Exception as e:
        report_error("Top CIKs", e)
        raise HTTPException(500, detail="Error fetching filers.")

    return BrowserCachedResponse(content={"filers": filers_sorted}, cache_hours=1)


popular_ciks_path = f"{cwd}/static/popular.json"
with open(popular_ciks_path, "r") as f:
    popular_cik_list = json.load(f)


@router.get("/searched", status_code=200)
@cache(24)
async def popular_ciks():
    try:
        filers_sorted = analysis.sort_and_format(popular_cik_list)
    except Exception as e:
        report_error("Popular CIKs", e)
        raise HTTPException(500, detail="Error fetching filers.")

    return BrowserCachedResponse(content={"filers": filers_sorted}, cache_hours=1)


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
    if password != ADMIN_PASSWORD:
        raise HTTPException(detail="Unable to give access.", status_code=403)

    database.delete_filer(cik)

    return {"description": "Successfully deleted filer."}


@router.get("/hang", status_code=200, include_in_schema=False)
async def hang_dangling(password: str):
    if password != ADMIN_PASSWORD:
        raise HTTPException(detail="Unable to give access.", status_code=403)

    results = analysis.end_dangling()

    return {"description": "Successfully ended dangling processes.", "ciks": results}


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
