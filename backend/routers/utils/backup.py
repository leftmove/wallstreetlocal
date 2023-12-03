import bson

from .mongo import *
from .search import *
from .api import *


def backup_collections():
    backup_client = MongoClient(MONGO_SERVER_URL)
    collections = ["companies", "filers"]

    for coll in collections:
        with open(f"./public/backup/{coll}.bson", "wb+") as f:
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


def get_confirm_token(response):
    for key, value in response.cookies.items():
        if key.startswith("download_warning"):
            return value

    return None


def save_response_content(response, destination):
    chunk_size = 32768
    with open(destination, "wb") as f:
        for chunk in response.iter_content(chunk_size):
            if chunk:  # filter out keep-alive new chunks
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
