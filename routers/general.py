from fastapi import BackgroundTasks, APIRouter, HTTPException
from fastapi.responses import FileResponse

import os
import json

from .utils.cache import cache
from .utils.backup import backup_collections
from .utils.analysis import end_dangling
from .utils.database import find_filers, delete_filer

from .filer import create_filer_try


router = APIRouter(
    tags=["general"],
    responses={},
)


@router.on_event("startup")
async def startup():
    end_dangling()


@cache(24)
@router.get("/", status_code=200)
async def info():
    return {"message": "Hello World!"}


@cache
@router.get("/undefined", status_code=200)
async def info_undefined():
    return {"message": "Hello World!"}


@cache
@router.get("/backup", status_code=200)
async def backup(password: str, background: BackgroundTasks):
    if password != os.environ["ADMIN_PASSWORD"]:
        raise HTTPException(detail="Unable to give access.", status_code=403)

    background.add_task(backup_collections)
    return {"message": "Backup started."}


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


@cache(1)
@router.get("/restore", status_code=200)
async def progressive_restore(password: str, background: BackgroundTasks):
    if password != os.environ["ADMIN_PASSWORD"]:
        raise HTTPException(detail="Unable to give access.", status_code=403)

    filers = find_filers({}, {"cik": 1})
    all_ciks = [filer["cik"] for filer in filers]

    def cycle_filers(ciks):
        for cik in ciks:
            delete_filer(cik)
            create_filer_try(cik)

    background.add_task(cycle_filers, all_ciks)

    return {"description": "Started progressive restore of filers."}


@cache
@router.get("/favicon.ico", status_code=200)
async def favicon():
    return FileResponse("./public/favicon.ico")
