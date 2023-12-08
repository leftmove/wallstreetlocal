import os

from fastapi.middleware import Middleware
from fastapi.middleware.cors import CORSMiddleware

# from fastapi import HTTPException

# from api_analytics.fastapi import Analytics

# class HTTPError(HTTPException):
#     def __init__(self, detail: str):
#         super().__init__(status_code=400, detail=detail)


ENVIRONMENT = os.environ["ENVIRONMENT"]
ANALYTICS_API_KEY = os.environ["ANALYTICS_API_KEY"]

middleware = [
    Middleware(
        CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
    )
]

# if ENVIRONMENT == "production":
#     middleware.append(Middleware(Analytics, api_key=ANALYTICS_API_KEY))


def pipeline():
    return middleware
