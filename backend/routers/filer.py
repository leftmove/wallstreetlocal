from fastapi import BackgroundTasks, APIRouter, HTTPException, WebSocket
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from .utils.scrape import *
from .utils.mongo import *
from .utils.search import *
from .utils.api import *
from .utils.analysis import *
from .utils.cache import *

from datetime import datetime
import json


from dotenv import load_dotenv

load_dotenv()

# pyright: reportGeneralTypeIssues=false
# pyright: reportOptionalSubscript=false


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


def create_filer(sec_data, cik):
    timestamp = {
        "logs": [],
        "status": 3,
        "time": {
            "remaining": 0,
            "elapsed": 0,
            "required": 0,
        },
        "start": datetime.now().timestamp(),
    }
    company = {
        "name": sec_data["name"],
        "cik": cik,
        "status": 3,
        "log": timestamp,
    }
    add_filer(company)
    company = scrape_filer(sec_data, cik)

    company["log"] = timestamp
    company["log"]["time"] = {
        "status": 2,
        "required": estimate_time_newest(company["last_report"], cik),
        "elapsed": datetime.now().timestamp() - timestamp["start"],
    }
    company.update(
        {
            "cik": cik,
            "stocks": {
                "local": scrape_latest_stocks(company),
                "global": [],
            },
        }
    )

    add_log(cik, "Filer Queried with Latest Stocks", company["name"], cik)
    edit_filer({"cik": cik}, {"$set": company})
    try:
        analyze_filer_newest(cik, company["stocks"]["local"])
    except Exception as e:
        edit_filer({"cik": cik}, {"$set": {"status": 2, "update": False}})
        print(e)
    add_query_log(cik, "create-latest")

    edit_filer({"cik": cik}, {"$set": {"log": {**timestamp, "status": 2}}})
    scrape_new_stocks(company)
    add_log(cik, "Filer Queried with Historical Stocks", company["name"], cik)

    try:
        analyze_filer(cik)
    except Exception as e:
        edit_filer({"cik": cik}, {"$set": {"status": 0, "update": False}})
        print(e)
    add_query_log(cik, "create-historical")


def update_filer(company):
    cik = company["cik"]
    time = datetime.now().timestamp()

    if company["status"] > 2:
        raise HTTPException(409, detail="Filer still building.")

    # if (time - company["updated"]) < 3600:
    #     raise HTTPException(detail="Filer queried too recently.", status_code=429)

    update = check_new(cik=cik, last_updated=company["updated"])
    if update:
        edit_filer({"cik": cik}, {"$set": {"status": 1}})
        filings, latest_report = scrape_filer_newest(company)
        scraped_stocks = scrape_latest_stocks(company)
        edit_filer(
            {"cik": cik},
            {
                "$set": {
                    "updated": time,
                    "filings": filings,
                    "latest_report": latest_report,
                    "stocks": {"local": scraped_stocks},
                }
            },
        )
        try:
            analyze_filer_newest(cik)
        except Exception as e:
            edit_filer({"cik": cik}, {"$set": {"status": 1, "update": False}})
            print(e)
        return {"description": "Updated filer."}
    else:
        raise HTTPException(200, detail="Filer already up to date.")


@router.get(
    "/query/",
    tags=["filers"],
    status_code=201,
)
async def query_filer(cik: str, background: BackgroundTasks):
    cik = cik.lstrip("0") or "0"
    filer = find_filer(cik)
    if filer == None:
        try:
            sec_data = sec_filer_search(cik)
        except Exception as e:
            raise HTTPException(404, detail="CIK not found.")

        background.add_task(create_filer, sec_data, cik)
        res = {"description": "Filer creation started."}
    else:
        res = update_filer(filer)

    return res


@cache(24)
@router.get("/search/", tags=["filers"], status_code=200)
async def search_filers(q: str):
    options = {"limit": 4, "filter": ["13f = true"]}
    hits = search_companies(q, options)

    results = []
    for result in hits:
        result_names = list(map(lambda n: n["name"], results))
        if result["name"] not in result_names:
            results.append(result)

    return {"description": "Successfully queried 13F filers.", "results": hits}


@router.get("/logs", status_code=202)
async def logs(cik: str, start: int = 0):
    project = {
        "_id": 0,
        "name": 0,
        "filings": 0,
        "stocks": 0,
        "data": 0,
        "cik": 0,
        "tickers": 0,
        "exchanges": 0,
        "first_report": 0,
        "last_report": 0,
        "updated": 0,
        "log.logs": {"$slice": [start, 10**5]},
    }
    try:
        filer = find_filer(
            cik,
            project,
        )
        filer_status = filer["status"]
        log = filer["log"]
        time = log["time"]

        status = log["status"]
        if status <= 1:
            return JSONResponse(status_code=201, content={"time": time})
        if status == 2:
            return JSONResponse(status_code=200, content={"time": time})

        logs = []
        for raw_log in log["logs"]:
            logs.extend(raw_log.split("\n"))

        count = len(logs)

        log["count"] = count
        log["logs"] = logs

        if time.get("wait") == True:
            raise HTTPException(503, detail="Rate limited, please wait 60 seconds.")

        required = time["required"]
        elapsed = datetime.now().timestamp() - log["start"]
        remaining = required - elapsed if status <= 2 else 0

        log["time"]["elapsed"] = elapsed
        log["time"]["remaining"] = remaining

        edit_filer(
            {"cik": cik},
            {
                "$set": {
                    "log.time.remaining": remaining,
                    "log.time.elapsed": elapsed,
                }
            },
        )

        return {
            "logs": logs,
            "time": time,
            "status": filer_status,
        }

    except (IndexError, TypeError):
        raise HTTPException(404, detail="CIK not found.")
    except Exception as e:
        print(e)
        raise HTTPException(404, detail="Error fetching logs.")


@router.get("/estimate", status_code=202)
async def estimate(cik: str):
    project = {
        "_id": 0,
        "name": 0,
        "filings": 0,
        "stocks": 0,
        "data": 0,
        "cik": 0,
        "status": 0,
        "tickers": 0,
        "exchanges": 0,
        "first_report": 0,
        "last_report": 0,
        "market_value": 0,
        "updated": 0,
        "log.logs": 0,
    }
    try:
        filer = find_filer(
            cik,
            project,
        )

        log = filer["log"]
        time_remaining = log["time"]["remaining"]
        status = log["status"]
        wait = log.get("wait", False)

        return {
            "description": "Found time estimation",
            "time": time_remaining,
            "status": status,
        }

    except (IndexError, TypeError):
        raise HTTPException(404, detail="CIK not found.")
    except Exception as e:
        print(e)
        raise HTTPException(404, detail="Error fetching time estimation.")


# @router.get("/aggregate/", tags=["filers"], status_code=201)
# async def migrate_filers(password: str):
#     if password != getenv("ADMIN_PASSWORD"):
#         raise HTTPException(
#             403,
#             detail="Incorrect password, access is forbidden. This route is meant for admins.",
#         )

#     directory = "../submissions"
#     count = 0
#     for filename in scandir(directory):
#         try:
#             with open(filename, "r") as submission:
#                 filer = json.load(submission)

#             if "submissions" in filename.name:
#                 filings = filer
#                 filer_dir = f"{directory}/{filename.name[:13]}.json"
#                 with open(filer_dir, "r") as submission:
#                     filer = json.load(submission)
#             else:
#                 filings = filer["filings"]["recent"]

#             cik = filer["cik"]
#             found_filer = companies.find_one({"cik": filer["cik"]})

#             if found_filer == None:
#                 name = filer["name"]
#                 form_types = filings["form"]
#                 if "13F-HR" in form_types:
#                     13f = True
#                     print(f"Found 13F-HR filing for {name} ({count})")
#                 else:
#                     13f = False

#                 new_filer = {
#                     "name": name,
#                     "cik": cik,
#                     "tickers": filer["tickers"],
#                     "exchanges": filer["exchanges"],
#                     "sic": filer["sic"],
#                     "ein": filer["ein"],
#                     "13f": 13f,
#                     "description": filer["description"],
#                     "sic_description": filer["sicDescription"],
#                     "website": filer["website"],
#                     "category": filer["category"],
#                     "phone": filer["phone"],
#                     "addresses": filer["addresses"],
#                     "former_names": filer["formerNames"],
#                 }
#                 companies.insert_one(new_filer)

#         except Exception as e:
#             print("Failed...", e)
#         count += 1


# @router.websocket("/raw")
# async def raw(websocket: WebSocket, cik: str):
#     websocket.accept()

#     try:
#         pipeline = [
#             {"$match": {"cik": cik}},
#             {"$project": {"log.logs": 1}},
#         ]
#         cursor = main.watch(pipeline)
#         # stream = cursor.collect()
#         # async with cursor as stream:
#         #     while stream.alive:
#         #         change = stream.try_next()
#         #         print(change)

#         #         asyncio.sleep(3)
#         # cursor = watch_logs(pipeline)

#         async with cursor as stream:
#             async for change in stream:
#                 print(change)

#                 asyncio.sleep(3)
#     except Exception as e:
#         print(e)
#         websocket.send_text("Error.")
#         raise HTTPException(404, detail="Error fetching logs.")

#     websocket.send_text("Connected.")


@cache(1 / 6)
@router.get("/info/", tags=["filers"], status_code=200)
async def filer_info(cik: str):
    filer = find_filer(cik, {"_id": 0, "stocks": 0, "filings": 0})
    if filer == None:
        raise HTTPException(404, detail="Filer not found.")

    return {"description": "Found filer.", "filer": filer}


@cache(24)
@router.get("/record/", tags=["filers", "records"], status_code=200)
async def record(cik: str):
    filer = find_filer(cik, {"_id": 0})
    if filer == None:
        raise HTTPException(404, detail="Filer not found.")

    filename = f"wallstreetlocal-{cik}.json"
    file_path = f"./public/filers/{filename}"
    try:
        with open(file_path, "w") as r:
            pass
    except:
        with open(file_path, "w+") as r:
            json.dump(filer, r, indent=6)

    return FileResponse(
        file_path, media_type="application/octet-stream", filename=filename
    )


@cache(24)
@router.get("/record/timeseries/", tags=["filers", "records"], status_code=200)
async def partial_record(cik: str, time: float):
    filer = find_filer(cik, {"stocks.local": 1, "tickers": 1, "name": 1})
    if filer == None:
        raise HTTPException(detail="Filer not found.", status_code=404)
    filer_stocks = filer["stocks"]["local"]

    stock_list = []
    cusip_list = list(map(lambda x: x, filer_stocks))
    cursor = search_stocks(
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
    async for document in cursor:
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
    with open(file_path, "w+") as r:
        json.dump(filer, r, indent=6)

    return FileResponse(
        file_path, media_type="application/octet-stream", filename=filename
    )
