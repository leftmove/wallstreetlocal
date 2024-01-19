FROM redis:alpine

COPY redis.conf ./redis.conf
COPY cache_db ./cache_db

EXPOSE 6379

CMD [ "redis-server", "redis.conf" ]
