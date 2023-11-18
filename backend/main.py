from fastapi import FastAPI
from fastapi.middleware import Middleware
from fastapi.middleware.cors import CORSMiddleware

from routers import general
from routers import filer
from routers import stocks

middleware = [
    Middleware(
        CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
    )
]
app = FastAPI(middleware=middleware)
app.include_router(general.router)
app.include_router(filer.router)
app.include_router(stocks.router)
