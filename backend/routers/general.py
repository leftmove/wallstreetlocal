from fastapi import APIRouter

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
