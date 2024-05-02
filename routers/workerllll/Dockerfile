# pull official base image
FROM python:3.9.5-slim-buster

# set work directory
WORKDIR /worker

COPY ./worker.py /worker/worker.py

RUN pip install "celery"
RUN pip install "celery[redis]"

CMD ["celery", "-A", "worker", "worker", "--loglevel=info"]
