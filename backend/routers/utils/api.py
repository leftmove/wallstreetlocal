from dotenv import load_dotenv
from os import getenv
import asyncio

import requests

from .database import *

# from requests_ratelimiter import LimiterMixin, MemoryQueueBucket
# from requests_cache import CacheMixin, SQLiteCache
# from requests import Session
# from requests.adapters import HTTPAdapter
# from urllib3.util.retry import Retry

load_dotenv()

print("[ APIs Initializing ] ...")

# # YFinance
# session = requests.Session()
# retry = Retry(connect=3, backoff_factor=0.5)
# adapter = HTTPAdapter(max_retries=retry)
# session.mount("http://", adapter)
# session.mount("https://", adapter)
# class CachedLimiterSession(CacheMixin, LimiterMixin, Session):
#     """ """
# yfSession = CachedLimiterSession(
#     per_second=0.9,
#     bucket_class=MemoryQueueBucket,
#     backend=SQLiteCache("yfinance.cache"),
# )

# Requests
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:108.0) Gecko/20100101 Firefox/108.0"
}

# Environment Variables
FINN_HUB_API_KEY = getenv("FINN_HUB_API_KEY")
ALPHA_VANTAGE_API_KEY = getenv("ALPHA_VANTAGE_API_KEY")


async def sec_filer_search(cik):
    res = requests.get(
        f"https://data.sec.gov/submissions/CIK{cik.zfill(10)}.json", headers=headers
    )
    data = res.json()

    if res.status_code == 400:
        raise LookupError

    return data


async def sec_stock_search(cik, access_number):
    access_number_replace = access_number.replace("-", " ")

    res = requests.get(
        f"https://www.sec.gov/Archives/edgar/data/{cik}/{access_number_replace}/{access_number}-index.html",
        headers=headers,
    )
    data = res.text

    return data


async def sec_directory_search(directory):
    res = requests.get(f"https://www.sec.gov{directory}", headers=headers)
    data = res.text

    return data


async def ticker_request(function, symbol, cik):
    while True:
        params = {
            "function": function,
            "symbol": symbol,
            "apikey": ALPHA_VANTAGE_API_KEY,
        }
        res = requests.get("https://www.alphavantage.co/query", params=params)
        if res.status_code == 429:
            await add_log(cik, "Waiting 60 Seconds...")
            await edit_filer({"cik": cik}, {"$set": {"log.wait": True}})

            await asyncio.sleep(60)
            await edit_filer({"cik": cik}, {"$set": {"log.wait": False}})
        else:
            data = res.json()
            break

    return data


async def cusip_request(value, cik):
    while True:
        params = {"q": value, "token": FINN_HUB_API_KEY}
        res = requests.get(f"https://finnhub.io/api/v1/search", params=params)
        if res.status_code == 429:
            if cik == "":
                await asyncio.sleep(60)
                continue

            await add_log(cik, "Waiting 60 Seconds...")
            await edit_filer({"cik": cik}, {"$set": {"log.wait": True}})

            await asyncio.sleep(60)

            await edit_filer({"cik": cik}, {"$set": {"log.wait": False}})
        else:
            data = res.json()
            break
    return data


print("[ APIs Initialized ]")
