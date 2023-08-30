FROM certbot/certbot:latest

COPY nginx80.conf ./nginx80.conf
COPY nginx443.conf ./nginx443.conf
COPY run.sh ./runsh

CMD ["/run.sh"]
