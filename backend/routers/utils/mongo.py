import motor.motor_asyncio
from dotenv import load_dotenv
from os import getenv

from pymongo import MongoClient

load_dotenv()

MONGO_SERVER_URL = f"mongosynchronousDb://{getenv('MONGO_SERVER_URL')}"
print("[ Database (MongoDB) Initializing ] ...")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_SERVER_URL)
synchronousClient = MongoClient(MONGO_SERVER_URL)


db = client["wallstreetlocal"]
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


async def aggregate_filers(pipeline):
    cursor = main.aggregate(pipeline)
    return cursor


synchronousDb = synchronousClient["wallstreetlocal"]
synchronousMain = synchronousDb["filers"]
synchronousStocks = synchronousDb["stocks"]
synchronousCompanies = synchronousDb["companies"]


def synchronous_check_stock(ticker):
    stock = synchronousStocks.find_one({"ticker": ticker})
    if stock == None:
        return False
    else:
        return True


def synchronous_search_stocks(pipeline):
    cursor = synchronousStocks.aggregate(pipeline)
    return cursor


def synchronous_find_stock(field, value):
    result = synchronousStocks.find_one({field: value})
    return result


def synchronous_find_stocks(field, value):
    results = synchronousStocks.find({field: value}, {"_id": 0})
    return results


def synchronous_edit_stock(query, value):
    synchronousStocks.update_one(query, value)


def synchronous_add_stock(stock):
    synchronousStocks.insert_one(stock)


def synchronous_find_filer(cik, project={"_id": 0}):
    result = synchronousMain.find_one({"cik": cik}, project)
    return result


def synchronous_add_filer(company):
    synchronousMain.insert_one(company)


def synchronous_edit_filer(query, value):
    synchronousMain.update_one(query, value)


def synchronous_add_log(cik, log):
    logs = log.split("\n")
    synchronousMain.update_one({"cik": cik}, {"$push": {"log.logs": {"$each": logs}}})


def synchronous_find_logs(pipeline):
    cursor = synchronousMain.aggregate(pipeline)

    return cursor


def synchronous_watch_logs(pipeline):
    cursor = synchronousMain.watch(pipeline)
    return cursor


def synchronous_aggregate_filers(pipeline):
    cursor = synchronousMain.aggregate(pipeline)
    return cursor


# def synchronous_search_sec(pipeline):
#     cursor = synchronousCompanies.aggregate(pipeline)
#     return cursor


print("[ Database (MongoDB) Initialized ]")
