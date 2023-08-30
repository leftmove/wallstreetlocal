FROM certbot/certbot:latest

WORKDIR /workdir

COPY nginx80.conf ./nginx80.conf
COPY nginx443.conf ./nginx443.conf
COPY run.sh ./runsh

CMD ["./workdir/run.sh"]
