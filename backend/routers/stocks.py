from fastapi import APIRouter, HTTPException
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
@router.post("/query/", tags=["stocks"], status_code=200)
async def query_stocks(stock: Tickers):
    tickers = stock.tickers
    found_stocks = await find_stocks("ticker", {"$in": tickers})

    async for found_stock in found_stocks:
        if found_stock == None:
            continue

        ticker = found_stock.get("ticker")
        time = datetime.now().timestamp()
        last_updated = found_stock.get("updated")

        if last_updated != None:
            if (time - last_updated) < 172800:
                continue

        try:
            price_info = await ticker_request("GLOBAL_QUOTE", ticker, "")
            global_quote = price_info["Global Quote"]
            price = global_quote["05. price"]
        except Exception as e:
            print(e)
            continue

        await edit_stock(
            {"ticker": ticker},
            {"$set": {"updated": time, "recent_price": price, "quote": global_quote}},
        )

    return {"description": "Stocks updated."}


# @router.post("/info/", tags=["stocks"], status_code=200)
# async def stock_info(stock: Cusip):

#     cusip_list = stock.cusip
#     results = {}

#     cursor = await find_stocks('cusip', {'$in': cusip_list})
#     async for document in cursor:
#         cusip = document['cusip']
#         results[cusip] = document


@cache
@router.get("/info/", tags=["stocks", "filers"], status_code=200)
async def stock_info(cik: str):
    stocks = await find_filer(
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
@router.get("/timeseries/", tags=["stocks", "filers"], status_code=200)
async def stock_timeseries(cik: str, time: float):
    filer = await find_filer(cik, {"stocks.local": 1})
    if filer == None:
        raise HTTPException(detail="Filer not found.", status_code=404)
    filer_stocks = filer["stocks"]["local"]

    stock_list = []
    cusip_list = list(map(lambda x: x, filer_stocks))
    cursor = await search_stocks(
        [
            {"$match": {"cusip": {"$in": cusip_list}}},
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
            {"$group": {"_id": "$cusip", "timeseries": {"$first": "$timeseries"}}},
            {
                "$project": {
                    "cusip": "$_id",
                    "_id": 0,
                    "timeseries.close": 1,
                    "timeseries.time": 1,
                }
            },
        ]
    )
    async for document in cursor:
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
