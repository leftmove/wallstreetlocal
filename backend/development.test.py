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


def sort_rows(row_one, row_two):
    nameColumn = 0
    classColumn = 1
    cusipColumn = 2
    valueColumn = 5
    shrsColumn = 6
    multiplier = 1
    for i, (lineOne, lineTwo) in enumerate(
        zip(row_one.find_all("td"), row_two.find_all("td"))
    ):
        if lineTwo.text == "NAME OF ISSUER":
            nameColumn = i
        elif lineTwo.text == "TITLE OF CLASS":
            classColumn = i
        elif lineTwo.text == "CUSIP":
            cusipColumn = i
        elif lineOne.text == "VALUE":
            valueColumn = i
            if lineTwo.text == "(x$1000)":
                multiplier = 1000
        elif lineTwo.text == "PRN AMT":
            shrsColumn = i
    return nameColumn, classColumn, cusipColumn, valueColumn, shrsColumn, multiplier


headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:108.0) Gecko/20100101 Firefox/108.0"
}


def sec_directory_search(directory):
    res = requests.get(f"https://www.sec.gov{directory}", headers=headers)
    data = res.content

    return data


info_table_key = ["INFORMATION TABLE"]


async def main():
    res = requests.get(
        "https://www.sec.gov/Archives/edgar/data/1364742/000130655023009732/0001306550-23-009732-index.html",
        headers=headers,
    )
    index_soup = BeautifulSoup(res.content, "lxml")
    rows = index_soup.find_all("tr")
    directory = None
    for row in rows:
        # The most genius code ever written
        info_row = any(
            [
                True
                if any(
                    [
                        True if d in table_key and d and d != " " else False
                        for d in [b.text.strip() for b in row]
                    ]
                )
                else False
                for table_key in info_table_key
            ]
        )
        if info_row:
            link = row.find("a")
            directory = link["href"]
            break
    if directory == None:
        return 0

    data = sec_directory_search(directory)
    stock_soup = BeautifulSoup(data, "html.parser")
    stock_table = stock_soup.find_all("table")[3]
    stock_fields = stock_table.find_all("tr")[1:3]
    stock_rows = stock_table.find_all("tr")[3:]

    (
        _,
        _,
        cusipColumn,
        _,
        _,
        _,
    ) = sort_rows(stock_fields[0], stock_fields[1])

    stock_count = 0
    local_stocks = []
    for row in stock_rows:
        columns = row.find_all("td")
        stock_cusip = columns[cusipColumn].text

        if stock_cusip in local_stocks:
            continue
        else:
            local_stocks.append(stock_cusip)
            stock_count += 1

    return stock_count


if __name__ == "__main__":
    asyncio.run(main())
