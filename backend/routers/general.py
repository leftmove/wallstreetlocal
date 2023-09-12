from fastapi import APIRouter
from fastapi.responses import FileResponse
from fastapi.concurrency import run_in_threadpool

from .utils.cache import *

router = APIRouter(
    tags=["general"],
    responses={},
)


@cache(168)
@router.get("/", status_code=200)
async def info():
    return {"message": "Hello World!"}


@cache(168)
@router.get("/undefined", status_code=200)
async def info_undefined():
    return {"message": "Hello World!"}


@cache(168)
@router.get("/favicon.ico", status_code=200)
async def favicon():
    return FileResponse("./public/favicon.ico")
