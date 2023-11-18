from fastapi import BackgroundTasks, Request
from fastapi.responses import FileResponse

from .router import APIRouter
from .utils.cache import *
from .utils.backup import *


router = APIRouter(
    tags=["general"],
    responses={},
)


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
    if password != "whale":
        return {}

    background.add_task(backup_collections)
    return {"message": "Backup started."}


@cache
@router.get("/favicon.ico", status_code=200)
async def favicon():
    return FileResponse("./public/favicon.ico")
