import asyncio

import motor.motor_asyncio
from dotenv import load_dotenv
import os
import json
from itertools import islice

load_dotenv()


MONGO_SERVER_URL = os.getenv("MONGO_SERVER_URL")
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_SERVER_URL)
db = client["Whale-Stocks"]
main = db["filers"]
stocks = db["stocks"]
companies = db["companies"]


async def main():
    queries = []

    pipeline = [
        {
            "$search": {
                "index": "search-companies",
                "compound": {
                    "should": [{"autocomplete": {"query": "man group", "path": "name"}}]
                },
            }
        },
        {"$match": {"13f": True}},
        {"$limit": 4},
        {"$project": {"_id": 0}},
    ]
    results = []
    cursor = await companies.aggregate(pipeline)
    async for document in cursor:
        results.append(document)

    print(results)


if __name__ == "__main__":
    asyncio.run(main())
