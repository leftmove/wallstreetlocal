FROM redis:alpine

WORKDIR /cache
COPY ./redis.conf /cache/redis.conf

EXPOSE 6379

CMD [ "redis-server", "redis.conf" ]
