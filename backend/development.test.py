import asyncio

import motor.motor_asyncio
from dotenv import load_dotenv
import os
import json
from itertools import islice
import requests

import lxml
import cchardet

from bs4 import BeautifulSoup

load_dotenv()
# type: reportGeneralTypeIssues=false

# MONGO_SERVER_URL = os.getenv("MONGO_SERVER_URL")
# client = motor.motor_asyncio.AsyncIOMotorClient()
# db = client["Whale-Stocks"]
# main = db["filers"]
# stocks = db["stocks"]
# companies = db["companies"]

session = requests.Session()


async def main():
    companies = []
    with open(r"C:\Users\Anonyo\Downloads\poop.txt") as f:
        lines = f.readlines()
        for line in lines:
            country = line[:18].strip()
            if country == "United States":
                companies.append(line[18:].strip())

    company_ciks = []
    for company in companies:
        res = session.get("http://localhost:8000/filers/search", params={"q": company})
        data = res.json()

        results = data["results"]
        found_company = results[0] if results else None

        if found_company:
            company_ciks.append(found_company["cik"])

    with open(r"C:\Users\Anonyo\Downloads\poop.json", "w") as f:
        json.dump(company_ciks, f)


if __name__ == "__main__":
    asyncio.run(main())
