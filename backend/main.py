from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import general
from routers import filer
from routers import stocks

# origins = [
#     "http://localhost:3000",
#     "https://localhost:3000",
#     "http://wallstreetlocal.com",
#     "http://wallstreetlocal.com:80"
#     "https://wallstreetlocal.com"
#     "https://wallstreetlocal.com:443",
# ]
origins = ["*"]

app = FastAPI()
app.include_router(general.router)
app.include_router(filer.router)
app.include_router(stocks.router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
