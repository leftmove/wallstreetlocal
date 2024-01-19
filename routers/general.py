from fastapi import BackgroundTasks, APIRouter, HTTPException
from fastapi.responses import FileResponse

import os

from .utils.cache import cache
from .utils.backup import backup_collections
from .utils.analysis import end_dangling


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


@cache
@router.get("/favicon.ico", status_code=200)
async def favicon():
    return FileResponse("./public/favicon.ico")
