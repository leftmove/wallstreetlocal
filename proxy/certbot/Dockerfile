FROM certbot/certbot:latest

WORKDIR /cert

COPY nginx80.conf ./nginx80.conf
COPY nginx443.conf ./nginx443.conf
COPY run.sh .

CMD ["bash", "run.sh"]
