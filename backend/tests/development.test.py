import asyncio

import motor.motor_asyncio
from dotenv import load_dotenv
import os
import json
from itertools import islice
import requests
import bson

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
    cwd = os.getcwd()
    with open("./backend/public/backup/filers.bson", "rb") as f:
        for document in bson.decode_file_iter(f):
            print(document)


if __name__ == "__main__":
    asyncio.run(main())
