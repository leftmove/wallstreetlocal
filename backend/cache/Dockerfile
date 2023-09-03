FROM redis:alpine

RUN sysctl vm.overcommit_memory=1
COPY redis.conf ./redis.conf

EXPOSE 6379

CMD [ "redis-server", "redis.conf" ]
