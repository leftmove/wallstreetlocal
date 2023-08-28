import asyncio

import motor.motor_asyncio
from dotenv import load_dotenv
import os
import json
from itertools import islice

load_dotenv()


MONGO_SERVER_URL = os.getenv("MONGO_SERVER_URL")
client = motor.motor_asyncio.AsyncIOMotorClient()
db = client["Whale-Stocks"]
main = db["filers"]
stocks = db["stocks"]
companies = db["companies"]


async def main():
    client.admin.command("copydb", fromdb="Whale-Stocks", todb="wallstreetlocal")
    client.drop_database("Whale-Stocks")


if __name__ == "__main__":
    asyncio.run(main())
