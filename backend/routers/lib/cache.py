import redis

import json
import os
import logging

from functools import wraps
from time import time
from inspect import iscoroutinefunction
from dotenv import load_dotenv

load_dotenv()

ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")
production_environment = True if ENVIRONMENT == "production" else False

REDIS_SERVER_URL = os.environ["REDIS_SERVER_URL"]
REDIS_PORT = int(os.environ.get("REDIS_PORT", 14640))
REDIS_PASSWORD = os.environ["REDIS_PASSWORD"]

store = redis.Redis(
    host=REDIS_SERVER_URL,
    port=14300,
    password=REDIS_PASSWORD,
    decode_responses=True,
)


def timing(f):
    @wraps(f)
    def wrap(*args, **kw):
        ts = time()
        result = f(*args, **kw)
        te = time()
        logging.info(
            "func:%r args:[%r, %r] took: %2.4f sec" % (f.__name__, args, kw, te - ts)
        )
        return result

    return wrap


def get_key(key):
    result = store.get(key)
    return result


def set_key(key, value, expire_time):
    store.setex(key, expire_time, value)


def set_key_no_expiration(key, value):
    store.set(key, value)


# def cache_sync(func, hours=2):
#     @wraps(func)
#     def wrapper(*args, **kwargs):
#         key_parts = [func.__name__] + list(args)
#         key = "-".join(str(k) for k in key_parts)
#         result = store.get(key)

#         if result is None:
#             value = func(*args, **kwargs)
#             value_json = json.dumps(value)

#             expire_time = 60 * 60 * hours
#             store.setex(key, expire_time, value_json)
#         else:
#             value_json = result.decode("utf-8")
#             value = json.loads(value_json)

#         return value

#     return wrapper


# async def cache(func, hours=2):
#     @wraps(func)
#     async def wrapper(*args, **kwargs):
#         key_parts = [func.__name__] + list(args)
#         key = "-".join(str(k) for k in key_parts)
#         result = store.get(key)

#         if result is None:
#             value = await func(*args, **kwargs)
#             value_json = json.dumps(value)

#             expire_time = 60 * 60 * hours
#             store.setex(key, expire_time, value_json)
#         else:
#             value_json = result.decode("utf-8")
#             value = json.loads(value_json)

#         return value

#     return wrapper


def flush_all():
    store.flushall()


def cache(_, hours=2):
    def wrapper(func):
        @wraps(func)
        async def wrapped(*args, **kwargs):
            key_parts = [func.__name__] + list(args)
            key = "-".join(str(k) for k in key_parts)
            result = store.get(key)

            if result is None:
                is_coroutine = iscoroutinefunction(func)

                if is_coroutine:
                    value = await func(*args, **kwargs)
                else:
                    value = func(*args, **kwargs)
                value_json = json.dumps(value)

                expire_time = 60 * 60 * hours
                store.setex(key, expire_time, value_json)
            else:
                value_json = result.decode("utf-8")
                value = json.loads(value_json)

            return value

        return wrapped

    return wrapper
