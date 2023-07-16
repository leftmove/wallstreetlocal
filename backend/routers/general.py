from fastapi import APIRouter

router = APIRouter(
    tags=["general"],
    responses={
    },
)


@router.get("/", status_code=200)
async def info():
    return {"message": "Hello World!"}
