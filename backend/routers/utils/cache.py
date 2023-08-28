import redis
from functools import wraps
import json
from time import time
from inspect import iscoroutinefunction
from dotenv import load_dotenv
from os import getenv

REDIS_SERVER_URL = getenv("REDIS_SERVER_URL")
load_dotenv()
print("[ Cache (Redis) Initializing ] ...")

# pyright: reportGeneralTypeIssues=false

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


def cache(func, hours=2):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        key_parts = [func.__name__] + list(args)
        key = "-".join(str(k) for k in key_parts)
        result = r.get(key)

        if result is None:
            coroutine = iscoroutinefunction(func)
            if coroutine:
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

    return wrapper


print("[ Cache (Redis) Initialized ]")
