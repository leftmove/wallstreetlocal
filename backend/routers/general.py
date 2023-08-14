from fastapi import APIRouter
from asyncio import run

from .utils import start

start.initialize()
router = APIRouter(
    tags=["general"],
    responses={},
)


@router.get("/", status_code=200)
async def info():
    return {"message": "Hello World!"}
