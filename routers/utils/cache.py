import redis

from functools import wraps
import json

from time import time
from inspect import iscoroutinefunction
import os

REDIS_SERVER_URL = os.environ["REDIS_SERVER_URL"]
print("[ Cache (Redis) Initializing ] ...")

r = redis.Redis(host=REDIS_SERVER_URL, port=6379)


def timing(f):
    @wraps(f)
    def wrap(*args, **kw):
        ts = time()
        result = f(*args, **kw)
        te = time()
        print("func:%r args:[%r, %r] took: %2.4f sec" % (f.__name__, args, kw, te - ts))
        return result

    return wrap


def get_key(key):
    result = r.get(key)
    return result


def set_key(key, value, expire_time):
    r.setex(key, expire_time, value)


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
