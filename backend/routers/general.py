from fastapi import APIRouter

from . import start

start.initialize()
router = APIRouter(
    tags=["general"],
    responses={},
)


@router.get("/", status_code=200)
async def info():
    return {"message": "Hello World!"}

@router.get("/undefined", status_code=200)
async def info():
    return {"message": "Hello World!"}