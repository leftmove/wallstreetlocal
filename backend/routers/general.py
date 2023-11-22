from fastapi import BackgroundTasks, Request, APIRouter
from fastapi.responses import FileResponse

from .utils.cache import *
from .utils.backup import *
from .utils.analysis import *


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
    if password != "whale":
        return {}

    background.add_task(backup_collections)
    return {"message": "Backup started."}


@cache
@router.get("/favicon.ico", status_code=200)
async def favicon():
    return FileResponse("./public/favicon.ico")


@router.get("/generate", status_code=200, include_in_schema=False)
async def generate(password: str, background: BackgroundTasks):
    if password != "whale":
        return {}

    background.add_task(generate_collections)

    return {"description": "Successfully started generating collections."}
