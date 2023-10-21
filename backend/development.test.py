import asyncio

import motor.motor_asyncio
from dotenv import load_dotenv
import os
import json
from itertools import islice
import requests
import json5

import lxml
import cchardet

from bs4 import BeautifulSoup

load_dotenv()
# type: reportGeneralTypeIssues=False

# MONGO_SERVER_URL = os.getenv("MONGO_SERVER_URL")
# client = motor.motor_asyncio.AsyncIOMotorClient()
# db = client["Whale-Stocks"]
# main = db["filers"]
# stocks = db["stocks"]
# companies = db["companies"]


async def main():
    py_obj = [
        {
            "display": "Ticker",
            "sort": "ticker",
            "accessor": "ticker_str",
            "active": True,
        },
        {"display": "Name", "sort": "name", "accessor": "name", "active": False},
        {"display": "Class", "sort": "class", "accessor": "class", "active": False},
        {"display": "Sector", "sort": "sector", "accessor": "sector", "active": False},
        {
            "display": "Shares Held (Or Principal Amount)",
            "sort": "shares_held",
            "accessor": "shares_held_str",
            "active": False,
        },
        {
            "display": "Market Value",
            "sort": "market_value",
            "accessor": "market_value_str",
            "active": True,
        },
        {
            "display": "% of Portfolio",
            "sort": "portfolio_percent",
            "accessor": "portfolio_str",
            "active": True,
        },
        {
            "display": "% Ownership",
            "sort": "ownership_percent",
            "accessor": "ownership_str",
            "active": False,
        },
        {
            "display": "Sold",
            "sort": "sold_time",
            "accessor": "sold_str",
            "active": False,
        },
        {"display": "Buy Date", "sort": "buy", "accessor": "buy_str", "active": False},
        {
            "display": "Price Paid",
            "sort": "buy_price",
            "accessor": "buy_price_str",
            "active": True,
        },
        {
            "display": "Recent Price",
            "sort": "recent_price",
            "accessor": "recent_price_str",
            "active": True,
        },
        {
            "display": "% Gain",
            "sort": "gain_percent",
            "accessor": "gain_str",
            "active": True,
        },
        {
            "display": "Industry",
            "sort": "industry",
            "accessor": "industry",
            "active": False,
        },
        {
            "display": "Report Date",
            "sort": "report",
            "accessor": "report_str",
            "active": False,
        },
    ]
    new_obj = []
    for key in py_obj:
        del key["active"]
        del key["sort"]

        new_obj.append(key)

    py_obj = new_obj

    print(py_obj)


if __name__ == "__main__":
    asyncio.run(main())
