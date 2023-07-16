import motor.motor_asyncio
from dotenv import load_dotenv
from os import getenv

load_dotenv()


MONGO_SERVER_URL = getenv("MONGO_SERVER_URL")
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_SERVER_URL)
db = client["Whale-Stocks"]
main = db["filers"]
stocks = db["stocks"]
companies = db["companies"]


async def check_stock(ticker):
    stock = await stocks.find_one({"ticker": ticker})
    if stock == None:
        return False
    else:
        return True


async def search_stocks(pipeline):
    cursor = stocks.aggregate(pipeline)
    return cursor


async def find_stock(field, value):
    result = await stocks.find_one({field: value})
    return result


async def find_stocks(field, value):
    results = stocks.find({field: value}, {"_id": 0})
    return results


async def edit_stock(query, value):
    await stocks.update_one(query, value)


async def add_stock(stock):
    await stocks.insert_one(stock)


async def find_filer(cik, project={"_id": 0}):
    result = await main.find_one({"cik": cik}, project)
    return result


async def add_filer(company):
    await main.insert_one(company)


async def edit_filer(query, value):
    await main.update_one(query, value)


async def add_log(cik, log):
    logs = log.split("\n")
    await main.update_one({"cik": cik}, {"$push": {"log.logs": {"$each": logs}}})


async def find_logs(pipeline):
    cursor = main.aggregate(pipeline)

    return cursor


async def watch_logs(pipeline):
    cursor = main.watch(pipeline)
    return cursor


async def search_sec(pipeline):
    cursor = companies.aggregate(pipeline)
    return cursor
