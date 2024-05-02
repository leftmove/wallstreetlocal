from fastapi import BackgroundTasks, APIRouter, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

import os

from traceback import format_exc
from datetime import datetime

from .lib import database
from .lib import cache as cm

from .lib.backup import save_collections

from .filer import popular_cik_list, top_cik_list
from .worker import try_filer, replace_filer

environment = os.environ["ENVIRONMENT"]

cache = cm.cache
router = APIRouter(
    tags=["general"],
)

cwd = os.getcwd()
router.mount(f"{cwd}/static", StaticFiles(directory="static"), name="static")


@cache(24)
@router.get("/", status_code=200)
async def info():
    return {"message": "Hello World!"}


@cache
@router.get("/undefined", status_code=200)
async def info_undefined():
    return {"message": "Hello World!"}


@router.get("/health", status_code=200)
async def health():
    health_checks = []

    pipeline = [
        {"$match": {}},
        {"$sample": {"size": 3}},
        {"$limit": 5},
    ]
    random_filers = database.search_filers(pipeline)
    for filer in random_filers:
        cik = filer["cik"]
        try:
            found_log = database.find_log(cik, {"status": 1})
            found_status = found_log.get("status", 0)
            if found_status >= 0:
                health_checks.append(False)
            else:
                health_checks.append(True)
        except Exception as e:
            create_error(cik, e)
            health_checks.append(False)
            continue

    health_passed = sum(health_checks) / len(health_checks)
    if health_passed < 0.8:
        raise HTTPException(status_code=500, detail="The server doesn't seem healthy.")

    return {"message": "The server is healthy."}


def background_query(query_type, cik_list, query_function):
    query = cm.get_key(query_type)
    if query and query == "running":
        raise HTTPException(detail="Query is already running.", status_code=409)
    cm.set_key_no_expiration(query_type, "running")

    for cik in cik_list:
        try:
            found_log = database.find_log(cik, {"status": 1})
            found_status = found_log.get("status", 0) if found_log else 0

            if found_status <= 0:
                query_function(cik)
        except Exception as e:
            print(e)
            create_error(cik, e)
            continue

    cm.set_key_no_expiration(query_type, "stopped")


@router.get("/query", status_code=200, include_in_schema=False)
async def query_top(password: str):
    if password != os.environ["ADMIN_PASSWORD"]:
        raise HTTPException(detail="Unable to give access.", status_code=403)

    filer_ciks = popular_cik_list
    filer_ciks.extend(top_cik_list)

    background_query("query", filer_ciks, try_filer.delay)

    return {"description": "Started querying filers."}


@router.get("/restore", status_code=200)
async def progressive_restore(password: str):
    if password != os.environ["ADMIN_PASSWORD"]:
        raise HTTPException(detail="Unable to give access.", status_code=403)

    filers = database.find_filers({}, {"cik": 1})
    all_ciks = [filer["cik"] for filer in filers]

    background_query("restore", all_ciks, replace_filer.delay)

    return {"description": "Started progressive restore of filers."}


def create_error(cik, e):
    stamp = str(datetime.now())
    cwd = os.getcwd()
    with open(f"{cwd}/static/errors/error-general-{stamp}.log", "w") as f:
        error_string = f"Failed to Query Filer {cik}\n{repr(e)}\n{format_exc()}"
        f.write(error_string)


@router.get("/backup", status_code=201)
async def backup(password: str, background: BackgroundTasks):
    if password != os.environ["ADMIN_PASSWORD"]:
        raise HTTPException(detail="Unable to give access.", status_code=403)

    background.add_task(save_collections)
    return {"description": "Started backing up collections."}


@cache
@router.get("/favicon.ico", status_code=200)
async def favicon():
    return FileResponse(f"{cwd}/static/favicon.ico")
