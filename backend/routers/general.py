from fastapi import APIRouter
from fastapi.responses import FileResponse
from fastapi.concurrency import run_in_threadpool

from .utils.cache import *

router = APIRouter(
    tags=["general"],
    responses={},
)


@cache
@router.get("/", status_code=200)
async def info():
    return {"message": "Hello World!"}


@cache
@router.get("/undefined", status_code=200)
async def info_undefined():
    return {"message": "Hello World!"}


@cache
@router.get("/favicon.ico", status_code=200)
async def favicon():
    return FileResponse("./public/favicon.ico")
