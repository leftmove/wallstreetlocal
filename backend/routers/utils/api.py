from dotenv import load_dotenv
from os import getenv
import time

import requests

from .mongo import *

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
session = requests.Session()
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:108.0) Gecko/20100101 Firefox/108.0"
}

# Environment Variables
FINN_HUB_API_KEY = getenv("FINN_HUB_API_KEY")
ALPHA_VANTAGE_API_KEY = getenv("ALPHA_VANTAGE_API_KEY")


def sec_filer_search(cik):
    res = session.get(
        f"https://data.sec.gov/submissions/CIK{cik.zfill(10)}.json", headers=headers
    )
    data = res.json()

    if res.status_code == 400:
        raise LookupError

    return data


def sec_stock_search(cik, access_number):
    access_number_replace = access_number.replace("-", " ")

    res = session.get(
        f"https://www.sec.gov/Archives/edgar/data/{cik}/{access_number_replace}/{access_number}-index.html",
        headers=headers,
    )
    data = res.content

    return data


def sec_directory_search(directory):
    res = session.get(f"https://www.sec.gov{directory}", headers=headers)
    data = res.content

    return data


def rate_limit(cik):
    add_log(cik, "Waiting 60 Seconds...", "Rate Limit", cik)
    edit_filer({"cik": cik}, {"$set": {"log.wait": True}})
    edit_filer({"cik": cik}, {"$inc": {"log.time.required": 60}})
    time.sleep(60)
    edit_filer({"cik": cik}, {"$set": {"log.wait": False}})


def ticker_request(function, symbol, cik):
    while True:
        params = {
            "function": function,
            "symbol": symbol,
            "apikey": ALPHA_VANTAGE_API_KEY,
        }
        res = session.get("https://www.alphavantage.co/query", params=params)
        if res.status_code == 429:
            rate_limit(cik)
        else:
            data = res.json()
            break

    return data


def cusip_request(value, cik):
    while True:
        params = {"q": value, "token": FINN_HUB_API_KEY}
        res = session.get(f"https://finnhub.io/api/v1/search", params=params)
        if res.status_code == 429:
            rate_limit(cik)
        else:
            data = res.json()
            break
    return data


print("[ APIs Initialized ]")
