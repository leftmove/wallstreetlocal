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
OPEN_FIGI_API_KEY = getenv("OPEN_FIGI_API_KEY")


def rate_limit(cik):
    log = find_log(
        cik,
        {
            "_id": 0,
            "logs": 0,
        },
    )
    add_log(cik, "Waiting 60 Seconds...", "Rate Limit", cik)

    if log == None:
        raise LookupError

    log["rate_limit"] = True
    log["time"]["required"] += 60
    edit_log(cik, log)

    time.sleep(60)

    log["rate_limit"] = False
    edit_log(cik, log)
    add_log(cik, "Resuming...", "Rate Limit", cik)


def get_request(
    url,
    cik,
    params={},
    custom_headers=headers,
):
    retries = 5
    while retries:
        try:
            res = session.get(url, params=params, headers=custom_headers)

            if res.status_code == 429:
                rate_limit(cik)
                retries -= 1
                continue

            return res
        except Exception as e:
            print(e)
            retries -= 1
            continue
    raise LookupError


def post_request(
    url,
    cik,
    payload={},
    custom_headers=headers,
):
    retries = 5
    while retries:
        try:
            res = session.post(url, json=payload, headers=custom_headers)

            if res.status_code == 429:
                rate_limit(cik)
                retries -= 1
                continue

            return res
        except Exception as e:
            print(e)
            retries -= 1
            continue
    raise LookupError


def sec_filer_search(cik):
    res = get_request(f"https://data.sec.gov/submissions/CIK{cik.zfill(10)}.json", cik)
    data = res.json()

    if res.status_code == 400:
        raise LookupError

    return data


def sec_stock_search(cik, access_number):
    access_number_replace = access_number.replace("-", " ")

    res = get_request(
        f"https://www.sec.gov/Archives/edgar/data/{cik}/{access_number_replace}/{access_number}-index.html",
        cik,
    )
    data = res.content

    return data


def sec_directory_search(directory, cik):
    res = get_request(f"https://www.sec.gov{directory}", cik)
    data = res.content

    return data


def ticker_request(function, symbol, cik):
    params = {
        "function": function,
        "symbol": symbol,
        "apikey": ALPHA_VANTAGE_API_KEY,
    }
    res = get_request("https://www.alphavantage.co/query", cik, params=params)
    data = res.json()

    return data


def cusip_request(value, cik):
    params = {"q": value, "token": FINN_HUB_API_KEY}
    res = get_request(f"https://finnhub.io/api/v1/search", cik, params=params)

    data = res.json()
    count = data["count"]

    if count > 0:
        result = data["result"][0]

        name = result["description"]
        ticker = result["symbol"]
        name = name if name else "NA"
        ticker = ticker if ticker else "NA"

        result = {"ticker": ticker, "name": result["description"]}
        return result

    headers = {"Content-Type": "text/json", "X-OPENFIGI-APIKEY": OPEN_FIGI_API_KEY}
    jobs = [{"idType": "ID_CUSIP", "idValue": value}]
    res = post_request(
        "https://api.openfigi.com/v2/mapping",
        cik=cik,
        payload=jobs,
        custom_headers=headers,
    )

    data = res.json()
    results = data[0]["data"]

    if len(results) > 0:
        result = results[0]

        name = result["name"]
        ticker = result["ticker"]
        name = name if name else "NA"
        ticker = ticker if ticker else "NA"

        result = {"ticker": result["ticker"], "name": result["name"]}
        return result

    raise LookupError


print("[ APIs Initialized ]")
