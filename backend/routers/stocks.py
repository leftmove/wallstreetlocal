from fastapi import HTTPException, APIRouter, BackgroundTasks
from pydantic import BaseModel

from .utils.api import *
from .utils.mongo import *
from .utils.scrape import *
from .utils.cache import *

# pyright: reportGeneralTypeIssues=false

router = APIRouter(
    prefix="/stocks",
    tags=["stocks"],
    responses={},
)


class Tickers(BaseModel):
    tickers: list


class Cusip(BaseModel):
    cusip: list


@cache
@router.post("/query", tags=["stocks"], status_code=200)
async def query_stocks(stock: Tickers, background: BackgroundTasks):
    tickers = stock.tickers

    found_stocks = find_stocks("ticker", {"$in": tickers})
    background.add_task(query_stocks, found_stocks)

    return {"description": "Stocks started updating."}


# @router.post("/info", tags=["stocks"], status_code=200)
# async def stock_info(stock: Cusip):

#     cusip_list = stock.cusip
#     results = {}

#     cursor = find_stocks('cusip', {'$in': cusip_list})
#     async for document in cursor:
#         cusip = document['cusip']
#         results[cusip] = document


@cache
@router.get("/info", tags=["stocks", "filers"], status_code=200)
async def stock_info(cik: str):
    stocks = find_filer(
        cik, {"_id": 0, "stocks.local": 0, "stocks.global.timeseries": 0}
    )
    if stocks == None:
        raise HTTPException(detail="Filer not found.", status_code=404)
    try:
        stock_list = stocks["stocks"]["global"]
    except KeyError:
        raise HTTPException(detail="Filer not found.", status_code=404)

    return {"stocks": stock_list}


@cache(4)
@router.get("/timeseries", tags=["stocks", "filers"], status_code=200)
async def stock_timeseries(cik: str, time: float):
    filer = find_filer(cik, {"stocks.global.cusip": 1})
    if filer == None:
        raise HTTPException(detail="Filer not found.", status_code=404)
    filer_stocks = filer["stocks"]["global"]

    stock_list = []
    cusip_list = list(map(lambda x: x["cusip"], filer_stocks))

    batch = []
    batch_limit = 100
    pipeline = [
        {"$match": {"cusip": {"$in": batch}}},
        {
            "$project": {
                "_id": 0,
                "cusip": 1,
                "ticker": 1,
                "timeseries": {
                    "$map": {
                        "input": "$timeseries",
                        "as": "time",
                        "in": {
                            "close": "$$time.close",
                            "time": "$$time.time",
                            "diff": {"$abs": {"$subtract": [time, "$$time.time"]}},
                        },
                    }
                },
            }
        },
        {"$unwind": "$timeseries"},
        {"$sort": {"timeseries.diff": 1}},
        {
            "$group": {
                "_id": "$cusip",
                "timeseries": {"$first": "$timeseries"},
            }
        },
        {
            "$project": {
                "cusip": "$_id",
                "_id": 0,
                "timeseries.close": 1,
                "timeseries.time": 1,
            }
        },
    ]

    for batch_cusip in cusip_list:
        if len(batch) < batch_limit:
            batch.append(batch_cusip)
            continue
        else:
            cursor = search_stocks(pipeline)
            for document in cursor:
                cusip = document["cusip"]
                close = document["timeseries"]["close"]
                close_str = f"${close}"
                close_time = document["timeseries"]["time"]
                stock_list.append(
                    {
                        "cusip": cusip,
                        "close": close,
                        "close_str": close_str,
                        "time": close_time,
                    }
                )
            batch = []

    cursor = search_stocks(pipeline)
    for document in cursor:
        cusip = document["cusip"]
        close = document["timeseries"]["close"]
        close_str = f"${close}"
        close_time = document["timeseries"]["time"]
        stock_list.append(
            {
                "cusip": cusip,
                "close": close,
                "close_str": close_str,
                "time": close_time,
            }
        )

    return {"stocks": stock_list}
