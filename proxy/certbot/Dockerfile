FROM certbot/certbot:latest

COPY nginx80.conf ./nginx80.conf
COPY nginx443.conf ./nginx443.conf
COPY ssl.sh ./ssl.sh

CMD ["certonly", "--webroot", "--webroot-path", "/var/www/certbot/", "-d", "content.wallstreetlocal.com", "-m", "zipped@wallstreetlocal.com", "--non-interactive", "--agree-tos", "&&", "sh", "ssl.sh"]
