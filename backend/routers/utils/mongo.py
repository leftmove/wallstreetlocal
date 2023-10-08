from dotenv import load_dotenv
from os import getenv
from datetime import datetime

from pymongo import MongoClient

load_dotenv()

MONGO_SERVER_URL = getenv("MONGO_SERVER_URL")
print("[ Database (MongoDB) Initializing ] ...")

client = MongoClient(MONGO_SERVER_URL)
db = client["wallstreetlocal"]
main = db["filers"]
stocks = db["stocks"]
companies = db["companies"]
logs = db["logs"]


def check_stock(ticker):
    stock = stocks.find_one({"ticker": ticker})
    if stock == None:
        return False
    else:
        return True


def search_stocks(pipeline):
    cursor = stocks.aggregate(pipeline)
    return cursor


def find_stock(field, value):
    result = stocks.find_one({field: value})
    return result


def find_stocks(field, value):
    results = stocks.find({field: value}, {"_id": 0})
    return results


def edit_stock(query, value):
    stocks.update_one(query, value)


def add_stock(stock):
    stocks.insert_one(stock)


def find_filer(cik, project={"_id": 0}):
    result = main.find_one({"cik": cik}, project)
    return result


def add_filer(company):
    main.insert_one(company)


def edit_filer(query, value):
    main.update_one(query, value)


def add_log(cik, message, name, identifier):
    logs = [f"{log} ({name}) ({identifier})" for log in message.split("\n")]
    main.update_one({"cik": cik}, {"$push": {"log.logs": {"$each": logs}}})


def find_logs(pipeline):
    cursor = main.aggregate(pipeline)

    return cursor


def watch_logs(pipeline):
    cursor = main.watch(pipeline)
    return cursor


def aggregate_filers(pipeline):
    cursor = main.aggregate(pipeline)
    return cursor


def add_query_log(cik, query):
    try:
        filer_done = find_filer(cik, {"cik": 1, "name": 1, "log": 1, "_id": 0})
        if filer_done:
            query_log = {
                **filer_done,
                "type": query,
                "timestamp": datetime.now().timestamp(),
            }
            logs.insert_one(query_log)
    except Exception as e:
        print(e)


# def search_sec(pipeline):
#     cursor = companies.aggregate(pipeline)
#     return cursor


print("[ Database (MongoDB) Initialized ]")
