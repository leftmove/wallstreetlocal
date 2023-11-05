import redis

from .mongo import *

from functools import wraps
import json

from time import time
from inspect import iscoroutinefunction
from dotenv import load_dotenv
from os import getenv

load_dotenv()
REDIS_SERVER_URL = getenv("REDIS_SERVER_URL")
# CELERY_SERVER_URL = f"redis://{REDIS_SERVER_URL}:6379/0"
print("[ Cache (Redis) Initializing ] ...")

# pyright: reportGeneralTypeIssues=false

r = redis.Redis(host=REDIS_SERVER_URL, port=6379)


# async def run_in_background(lambda_func):
#     loop = asyncio.get_running_loop()
#     result = await (await loop.run_in_executor(None, lambda_func))
#     return result


def timing(f):
    @wraps(f)
    def wrap(*args, **kw):
        ts = time()
        result = f(*args, **kw)
        te = time()
        print("func:%r args:[%r, %r] took: %2.4f sec" % (f.__name__, args, kw, te - ts))
        return result

    return wrap


# def cache_sync(func, hours=2):
#     @wraps(func)
#     def wrapper(*args, **kwargs):
#         key_parts = [func.__name__] + list(args)
#         key = "-".join(str(k) for k in key_parts)
#         result = r.get(key)

#         if result is None:
#             value = func(*args, **kwargs)
#             value_json = json.dumps(value)

#             expire_time = 60 * 60 * hours
#             r.setex(key, expire_time, value_json)
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
#         result = r.get(key)

#         if result is None:
#             value = await func(*args, **kwargs)
#             value_json = json.dumps(value)

#             expire_time = 60 * 60 * hours
#             r.setex(key, expire_time, value_json)
#         else:
#             value_json = result.decode("utf-8")
#             value = json.loads(value_json)

#         return value

#     return wrapper


def cache(_, hours=2):
    def wrapper(func):
        @wraps(func)
        async def wrapped(*args, **kwargs):
            key_parts = [func.__name__] + list(args)
            key = "-".join(str(k) for k in key_parts)
            result = r.get(key)

            if result is None:
                is_coroutine = iscoroutinefunction(func)

                if is_coroutine:
                    value = await func(*args, **kwargs)
                else:
                    value = func(*args, **kwargs)
                value_json = json.dumps(value)

                expire_time = 60 * 60 * hours
                r.setex(key, expire_time, value_json)
            else:
                value_json = result.decode("utf-8")
                value = json.loads(value_json)

            return value

        return wrapped

    return wrapper


print("[ Cache (Redis) Initialized ]")
