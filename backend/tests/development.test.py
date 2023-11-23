import asyncio

from dotenv import load_dotenv
import requests
import bson
import json


load_dotenv()


def get_confirm_token(response):
    for key, value in response.cookies.items():
        if key.startswith("download_warning"):
            return value

    return None


def save_response_content(response, destination):
    chunk_size = 32 * 1024
    with open(destination, "wb") as f:
        for chunk in response.iter_content(chunk_size):
            if chunk:  # filter out keep-alive new chunks
                f.write(chunk)


def download_drive(file_id, destination):
    url = f"https://drive.google.com/uc?export=download&id={file_id}&confirm=t "
    session = requests.Session()

    response = session.get(url, params={"id": file_id}, stream=True)
    token = get_confirm_token(response)

    if token:
        params = {"id": file_id, "confirm": token}
        response = session.get(url, params=params, stream=True)

    save_response_content(response, destination)


async def main():
    file_path = "./backend/public/backup/companies.bson"
    download_drive("***REMOVED***", file_path)

    with open(file_path, "r") as f:
        for line in f:
            document = json.loads(line.rstrip())
            document.pop("_id", None)

            print(document)


if __name__ == "__main__":
    asyncio.run(main())
