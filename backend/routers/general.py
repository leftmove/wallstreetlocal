from fastapi import APIRouter
from fastapi.responses import FileResponse

router = APIRouter(
    tags=["general"],
    responses={},
)


@router.get("/", status_code=200)
async def info():
    return {"message": "Hello World!"}


@router.get("/undefined", status_code=200)
async def info_undefined():
    return {"message": "Hello World!"}


@router.get("/favicon.ico", status_code=200)
async def favicon():
    return FileResponse("./public/favicon.ico")
