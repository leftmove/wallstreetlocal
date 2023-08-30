FROM certbot/certbot:latest

COPY nginx80.conf ./nginx80.conf
COPY nginx443.conf ./nginx443.conf
ENTRYPOINT [ "docker-entrypoint.sh" ]

CMD ["certonly", "--webroot", "--webroot-path", "/var/www/certbot/", "-d", "content.wallstreetlocal.com", "-m", "zipped@wallstreetlocal.com", "--non-interactive", "--agree-tos", "&&", "if [ -d "/etc/letsencrypt/live" ]; then     echo "Certificates Found, Updating NGINX Configuration for Port 443..."     cp nginx443.conf /proxyconf     echo "NGINX Configuration Updated" else     echo "Certificates Found, Updating NGINX Configuration for Port 80..."     cp nginx80.conf /proxyconf     echo "NGINX Configuration Updated" fi"]
