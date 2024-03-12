from fastapi import BackgroundTasks, APIRouter, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

import os

from .lib import database
from .lib import cache as cm
from .lib import analysis

from .lib.api import popular_ciks_request, top_ciks_request
from .lib.backup import save_collections

from .filer import create_filer_try

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


@router.on_event("startup")
async def startup():

    startup_key = "startup-process"
    value = cm.get_key(startup_key)
    if value == "running":
        return
    else:
        if value == "stopped":
            return
    cm.set_key_no_expiration(startup_key, "running")

    # if environment == "development":
    #     debug_cik = os.environ["DEBUG_CIK"]
    #     database.delete_filer(debug_cik)
    analysis.end_dangling()

    cm.set_key_no_expiration(startup_key, "stopped")


@cache
@router.get("/undefined", status_code=200)
async def info_undefined():
    return {"message": "Hello World!"}


@cache(1)
@router.get("/query", status_code=200, include_in_schema=False)
async def query_top(password: str, background: BackgroundTasks):
    if password != os.environ["ADMIN_PASSWORD"]:
        raise HTTPException(detail="Unable to give access.", status_code=403)

    type_query = {"type": "query"}
    restore_log = database.find_specific_log(type_query)
    if restore_log:
        status = restore_log["status"]
        if status == "running":
            raise HTTPException(status_code=429, detail="Restore already running.")
        else:
            database.edit_specific_log(type_query, {"$set": {"status": "running"}})
    else:
        database.create_log({**type_query, "status": "running"})

    filer_ciks = top_ciks_request()
    filer_ciks.extend(popular_ciks_request())

    def cycle_filers(ciks):
        for cik in ciks:
            create_filer_try(cik)
        database.edit_specific_log(type_query, {"$set": {"status": "stopped"}})

    background.add_task(cycle_filers, filer_ciks)

    return {"description": "Started querying filers."}


@cache(1)
@router.get("/restore", status_code=200)
async def progressive_restore(password: str, background: BackgroundTasks):
    if password != os.environ["ADMIN_PASSWORD"]:
        raise HTTPException(detail="Unable to give access.", status_code=403)

    type_query = {"type": "restore"}
    restore_log = database.find_specific_log(type_query)
    if restore_log:
        status = restore_log["status"]
        if status == "running":
            raise HTTPException(status_code=429, detail="Restore already running.")
        else:
            database.edit_specific_log(type_query, {"$set": {"status": "running"}})
    else:
        database.create_log({**type_query, "status": "running"})

    filers = database.find_filers({}, {"cik": 1})
    all_ciks = [filer["cik"] for filer in filers]

    def cycle_filers(ciks):
        for cik in ciks:
            database.delete_filer(cik)
            create_filer_try(cik)
        database.edit_specific_log(type_query, {"$set": {"status": "stopped"}})

    background.add_task(cycle_filers, all_ciks)

    return {"description": "Started progressive restore of filers."}


@router.get("/backup", status_code=201)
async def backup(password: str, background: BackgroundTasks):

    if password != os.environ["ADMIN_PASSWORD"]:
        raise HTTPException(detail="Unable to give access.", status_code=403)

    background.add_task(save_collections)
    return {"description": "Started backing up collections."}


@cache
@router.get("/favicon.ico", status_code=200)
async def favicon():
    return FileResponse("./public/favicon.ico")
