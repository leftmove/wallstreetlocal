import os
from datetime import datetime

from pymongo import MongoClient


MONGO_SERVER_URL = os.environ["MONGO_SERVER_URL"]
print("[ Database (MongoDB) Initializing ] ...")

client = MongoClient(MONGO_SERVER_URL)
db = client["wallstreetlocal"]
main = db["filers"]
stocks = db["stocks"]
companies = db["companies"]
logs = db["logs"]
statistics = db["statistics"]


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


def find_document(cik, project={"_id": 0}):
    result = main.find_one({"cik": cik}, project)
    return result


def search_filers(pipeline):
    cursor = main.aggregate(pipeline)
    return cursor


def add_filer(company):
    main.insert_one(company)


def edit_filer(query, value):
    main.update_one(query, value)


def delete_filers(query):
    main.delete_many(query)


def create_log(value):
    logs.insert_one(value)


def find_log(cik, project={"_id": 0}):
    result = logs.find_one({"cik": cik}, project)
    return result


def add_log(cik, message, name="", identifier=""):
    if type(message) == dict:
        log_string = (
            f'{message["message"]}, ({message["name"]}) ({message["identifier"]})'
        )
        logs.update_one({"cik": cik}, {"$push": {"logs": log_string}})
    else:
        logs_string = [f"{log} ({name}) ({identifier})" for log in message.split("\n")]
        logs.update_one({"cik": cik}, {"$push": {"logs": {"$each": logs_string}}})


def add_logs(cik, formatted_logs):
    logs_split = []
    for formatted_log in formatted_logs:
        logs_split.extend(
            [
                f"{log_message} ({formatted_log['name']}) ({formatted_log['identifier']})"
                for log_message in formatted_log["message"].split("\n")
            ]
        )

    logs.update_one({"cik": cik}, {"$push": {"logs": {"$each": logs_split}}})


def edit_log(cik, stamp):
    logs.update_one({"cik": cik}, {"$set": stamp})


def delete_logs(query):
    logs.delete_many(query)


def edit_status(cik, status):
    logs.update_one({"cik": cik}, {"$set": {"status": status}})


def find_logs(project={"_id": 0}):
    result = logs.find(project)

    return result


def watch_logs(pipeline):
    cursor = main.watch(pipeline)
    return cursor


def aggregate_filers(pipeline):
    cursor = main.aggregate(pipeline)
    return cursor


def add_query_log(cik, query):
    try:
        filer_done = find_filer(cik, {"cik": 1, "name": 1, "_id": 0})
        filer_log = find_log(cik)
        if filer_done and filer_log:
            query_log = {
                **filer_done,
                "log": filer_log,
                "type": query,
                "timestamp": datetime.now().timestamp(),
            }
            statistics.insert_one(query_log)
    except Exception as e:
        print(e)


# def search_sec(pipeline):
#     cursor = companies.aggregate(pipeline)
#     return cursor


print("[ Database (MongoDB) Initialized ]")
