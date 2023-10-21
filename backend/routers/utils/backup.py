from .mongo import *

import bson


def backup_collections():
    backup_client = MongoClient(MONGO_SERVER_URL)
    collections = ["companies", "filers"]

    for coll in collections:
        with open(f"./public/backup/{coll}.bson", "wb+") as f:
            cursor = backup_client["wallstreetlocal"][coll].find({})
            for document in cursor:
                f.write(bson.BSON.encode(document))
