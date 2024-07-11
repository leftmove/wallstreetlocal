import bson
import requests
import os

from pymongo import MongoClient

MONGO_SERVER_URL = os.environ["MONGO_SERVER_URL"]

cwd = os.getcwd()


def save_collections():
    backup_client = MongoClient(MONGO_SERVER_URL)
    collections = ["companies", "filers", "stocks", "statistics"]

    for coll in collections:
        with open(f"{cwd}/static/backup/{coll}.bson", "wb+") as f:
            cursor = backup_client["wallstreetlocal"][coll].find({})
            for document in cursor:
                f.write(bson.BSON.encode(document))


def get_confirm_token(response):
    for key, value in response.cookies.items():
        if key.startswith("download_warning"):
            return value

    return None


def save_response_content(response, destination):
    CHUNK_SIZE = 32768

    with open(destination, "wb") as f:
        for chunk in response.iter_content(CHUNK_SIZE):
            if chunk:
                f.write(chunk)


def download_drive(file_id, destination):
    url = "https://docs.google.com/uc?export=download"
    session = requests.Session()

    response = session.get(url, params={"id": file_id}, stream=True)
    token = get_confirm_token(response)

    if token:
        params = {"id": file_id, "confirm": token}
        response = session.get(url, params=params, stream=True)

    save_response_content(response, destination)
