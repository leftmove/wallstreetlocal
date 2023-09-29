from fastapi import BackgroundTasks, APIRouter, HTTPException, WebSocket
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import FileResponse
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
        404: {"model": HTTPError, "description": "Not found."},
        409: {
            "model": HTTPError,
            "description": "Conflict with server state.",
        },
    },
)


async def create_filer(sec_data, cik):
    company = {
        "name": sec_data["name"],
        "cik": cik,
        "status": "Building",
        "log": {
            "logs": [],
            "stop": False,
            "time": {
                "remaining": await estimate_time(sec_data, cik),
            },
            "start": datetime.now().timestamp(),
        },
    }
    await add_filer(company)
    company = await scrape_filer(sec_data, cik)

    company.update(
        {
            "cik": cik,
            "stocks": {
                "local": await scrape_new_stocks(company),
                "global": [],
            },
        }
    )

    name = company["name"]
    await add_log(cik, f"Filer Queried [ {name} ({cik}) ]")
    await edit_filer({"cik": cik}, {"$set": company})
    try:
        await analyze_filer(cik)
    except Exception as e:
        await edit_filer({"cik": cik}, {"$set": {"status": "Updated", "update": False}})
        print(e)


@cache
async def update_filer(company):
    cik = company["cik"]
    time = datetime.now().timestamp()

    if company["status"] == "Building":
        raise HTTPException(409, detail="Filer already building.")

    # if (time - company["updated"]) < 3600:
    #     raise HTTPException(detail="Filer queried too recently.", status_code=429)

    update = await check_new(cik=cik, last_updated=company["updated"])
    if update:
        await edit_filer({"cik": cik}, {"$set": {"status": "Building"}})
        filings, latest_report = await scrape_filer_newest(company)
        scraped_stocks = await scrape_latest_stocks(company)
        await edit_filer(
            {"cik": cik},
            {
                "$set": {
                    "status": "Updated",
                    "updated": time,
                    "filings": filings,
                    "latest_report": latest_report,
                    "stocks": {"local": scraped_stocks, "global": []},
                }
            },
        )
        return {"description": "Updated filer."}
    else:
        raise HTTPException(200, detail="Filer already up to date.")


@router.get(
    "/query/",
    tags=["filers"],
    status_code=201,
)
async def query_filer(cik: str, background_tasks: BackgroundTasks):
    cik = cik.lstrip("0") or "0"
    filer = await find_filer(cik)
    if filer == None:
        try:
            sec_data = await sec_filer_search(cik)
        except Exception as e:
            raise HTTPException(404, detail="CIK not found.")
        background_tasks.add_task(create_filer, sec_data, cik)
        res = {"description": "Filer creation started."}
    else:
        res = await update_filer(filer)

    return res


# @router.get("/query/", status_code=200,)
# async def query(q: str):

#     # Grab info from database using query string.

#     return res


@cache(24)
@router.get("/search/", tags=["filers"], status_code=200)
async def search_filers(q: str):
    options = {"limit": 4, "filter": ["13f = true"]}
    hits = await search_companies(q, options)

    results = []
    for result in hits:
        result_names = list(map(lambda n: n["name"], results))
        if result["name"] not in result_names:
            results.append(result)

    return {"description": "Successfully queried 13F filers.", "results": hits}


# @router.websocket("/logs")
# async def logs(websocket: WebSocket, cik: str):
#     await websocket.accept()
#     await asyncio.sleep(3)

#     pipeline = [{"$match": {"cik": cik}}, {"$project": {"log": 1}}]
#     try:
#         cursor = await find_logs(pipeline)

#         document = [document async for document in cursor][0]
#         log = document["log"]
#         logs = []
#         for raw_log in log["logs"]:
#             logs.extend(raw_log.split("\n"))
#         log["logs"] = logs
#     except IndexError:
#         raise HTTPException(404, detail="CIK not found.")
#     except Exception as e:
#         print(e)
#         raise HTTPException(404, detail="Error fetching logs.")

#     await websocket.send_text("\n".join(logs))
#     skip = len(logs)

#     run = True
#     while run:
#         cursor = await find_logs(pipeline)
#         document = [document async for document in cursor][0]
#         log = document["log"]
#         results = log["logs"][skip:]
#         stop = log["stop"]

#         for log in results:
#             await websocket.send_text(log)
#         logs.extend(results)

#         if stop:
#             run = False
#             time_taken = await time_format(log["end"] - log["start"])

#             await websocket.send_text(f"\n\nCreated Filer in {time_taken}!")
#             await websocket.send_text(f"Reloading the page in 10 seconds...")
#             await asyncio.sleep(3)
#             break

#         skip = len(logs)
#         await asyncio.sleep(3)


@router.get("/logs")
async def logs(cik: str, start: int = 0):
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
        "updated": 0,
        "log.logs": {"$slice": [start, 10**5]},
    }
    try:
        filer = await find_filer(
            cik,
            project,
        )
        log = filer["log"]
        logs = []
        for raw_log in log["logs"]:
            logs.extend(raw_log.split("\n"))
        count = len(logs)

        log["count"] = count
        log["logs"] = logs

        await edit_filer({"cik": cik}, {"$inc": {"log.time.remaining": 0 - count}})
    except (IndexError, TypeError):
        raise HTTPException(404, detail="CIK not found.")
    except Exception as e:
        print(e)
        raise HTTPException(404, detail="Error fetching logs.")

    return log


@router.get("/estimate")
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
        "updated": 0,
        "log.logs": 0,
    }
    try:
        filer = await find_filer(
            cik,
            project,
        )
        log = filer["log"]
        time_remaining = log["time"]["remaining"]

        message = {
            "description": "Found time estimation",
            "time": time_remaining,
        }

    except (IndexError, TypeError):
        raise HTTPException(404, detail="CIK not found.")
    except Exception as e:
        print(e)
        raise HTTPException(404, detail="Error fetching time estimation.")

    return message


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
#             found_filer = await companies.find_one({"cik": filer["cik"]})

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
#                 await companies.insert_one(new_filer)

#         except Exception as e:
#             print("Failed...", e)
#         count += 1


# @router.websocket("/raw")
# async def raw(websocket: WebSocket, cik: str):
#     await websocket.accept()

#     try:
#         pipeline = [
#             {"$match": {"cik": cik}},
#             {"$project": {"log.logs": 1}},
#         ]
#         cursor = main.watch(pipeline)
#         # stream = cursor.collect()
#         # async with cursor as stream:
#         #     while stream.alive:
#         #         change = await stream.try_next()
#         #         print(change)

#         #         await asyncio.sleep(3)
#         # cursor = await watch_logs(pipeline)

#         async with cursor as stream:
#             async for change in stream:
#                 print(change)

#                 await asyncio.sleep(3)
#     except Exception as e:
#         print(e)
#         await websocket.send_text("Error.")
#         raise HTTPException(404, detail="Error fetching logs.")

#     await websocket.send_text("Connected.")


@cache
@router.get("/info/", tags=["filers"], status_code=200)
async def filer_info(cik: str):
    filer = await find_filer(cik, {"_id": 0, "stocks": 0, "filings": 0})
    if filer == None:
        raise HTTPException(404, detail="Filer not found.")

    return {"description": "Found filer.", "filer": filer}


@cache(24)
@router.get("/record/", tags=["filers", "records"], status_code=200)
async def record(cik: str):
    filer = await find_filer(cik, {"_id": 0})
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
    filer = await find_filer(cik, {"stocks.local": 1, "tickers": 1, "name": 1})
    if filer == None:
        raise HTTPException(detail="Filer not found.", status_code=404)
    filer_stocks = filer["stocks"]["local"]

    stock_list = []
    cusip_list = list(map(lambda x: x, filer_stocks))
    cursor = await search_stocks(
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
