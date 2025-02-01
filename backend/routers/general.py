from fastapi import BackgroundTasks, APIRouter, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

import os
import logging

from worker import tasks as worker

from .lib import database
from .lib import cache as cm
from .lib.backup import save_collections

from . import filer

cache = cm.cache
router = APIRouter(
    tags=["general"],
)

cwd = os.getcwd()
router.mount(f"{cwd}/static", StaticFiles(directory="static"), name="static")

ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "password")
production_environment = getattr(worker, "production_environment", False)
popular_cik_list = filer.popular_cik_list
top_cik_list = filer.top_cik_list


@router.get("/", status_code=200)
@cache(24)
async def info():
    return {"description": "Hello World!"}


@router.get("/undefined", status_code=200)
@cache
async def info_undefined():
    return {"description": "Hello World!"}


@router.get("/health", status_code=200)
@cache(4)
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
            if found_status > 0:
                health_checks.append(False)
            else:
                health_checks.append(True)
        except Exception as e:
            logging.error(e)
            health_checks.append(False)
            continue

    health_passed = sum(health_checks) / len(health_checks) if health_checks else 0
    if health_passed < 0.8:
        raise HTTPException(status_code=500, detail="The server doesn't seem healthy.")

    return {"description": "The server is healthy."}


# @router.get("/error", include_in_schema=False)
# async def trigger_error():
#     1 / 0
#     return {"description": "This will never be reached."}


@router.get("/task-error", include_in_schema=False)
async def task_error(password: str):

    if password != ADMIN_PASSWORD:
        raise HTTPException(detail="Unable to give access.", status_code=403)

    worker.delay_error.delay()

    return {"description": "Task error triggered."}


# Terrible code
# Too much abstraction
# I don't know what I was thinking when writing this, will change later


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
            logging.error(e)
            continue

    cm.set_key_no_expiration(query_type, "stopped")


@router.get("/query", status_code=200, include_in_schema=False)
async def query_top(password: str, background: BackgroundTasks = BackgroundTasks):
    if password != ADMIN_PASSWORD:
        raise HTTPException(detail="Unable to give access.", status_code=403)

    filer_ciks = popular_cik_list
    filer_ciks.extend(top_cik_list)

    if production_environment:
        background_query("query", filer_ciks, lambda cik: worker.try_filer.delay(cik))
    else:
        background_query(
            "query", filer_ciks, lambda cik: background.add_task(filer.try_filer, cik)
        )

    return {"description": "Started querying filers."}


@router.get("/restore", status_code=200)
async def progressive_restore(
    password: str, background: BackgroundTasks = BackgroundTasks
):
    if password != ADMIN_PASSWORD:
        raise HTTPException(detail="Unable to give access.", status_code=403)

    filers = database.find_filers({}, {"cik": 1})
    all_ciks = [filer["cik"] for filer in filers]

    if production_environment:
        background_query(
            "restore", all_ciks, lambda cik: worker.repair_filer.delay(cik)
        )
    else:
        background_query(
            "restore",
            all_ciks,
            lambda cik: background.add_task(filer.repair_filer, cik),
        )

    return {"description": "Started progressive restore of filers."}


@router.get("/backup", status_code=201)
async def backup(password: str, background: BackgroundTasks = BackgroundTasks):
    if password != ADMIN_PASSWORD:
        raise HTTPException(detail="Unable to give access.", status_code=403)

    background.add_task(save_collections)
    return {"description": "Started backing up collections."}


def repair_all_filers_task():  # For use in Celery beat

    query_type = "repair"
    query = cm.get_key(query_type)
    if query and query == "running":
        raise HTTPException(detail="Query is already running.", status_code=409)
    cm.set_key_no_expiration(query_type, "running")

    filers = database.find_filers({}, {"cik": 1})
    all_ciks = [filer["cik"] for filer in filers]

    for cik in all_ciks:
        filer.repair_filer(cik)

    cm.set_key_no_expiration(query_type, "stopped")


@router.get("/repair", status_code=200)
async def repair_all_filers(
    password: str, background: BackgroundTasks = BackgroundTasks
):
    if password != ADMIN_PASSWORD:
        raise HTTPException(detail="Unable to give access.", status_code=403)

    filers = database.find_filers({}, {"cik": 1})
    all_ciks = [filer["cik"] for filer in filers]

    if production_environment:
        background_query("repair", all_ciks, lambda cik: worker.repair_filer.delay(cik))
    else:
        background_query(
            "repair", all_ciks, lambda cik: background.add_task(filer.repair_filer, cik)
        )

    return {"description": "Started repairing all filers."}


# from .lib import analysis
# @router.get("/test", status_code=200, include_in_schema=False)
# async def test_route(password: str, background: BackgroundTasks = BackgroundTasks):
#     if password != ADMIN_PASSWORD:
#         raise HTTPException(detail="Unable to give access.", status_code=403)

#     changes = analysis.analyze_changes("1037389")
#     print(changes)

#     return {"description": "Hello World!"}


@router.get("/favicon.ico", status_code=200)
@cache
async def favicon():
    return FileResponse(f"{cwd}/static/favicon.ico")
