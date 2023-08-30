FROM certbot/certbot:latest

RUN if [ -d "/etc/letsencrypt/live" ]; then \
    echo "Certificates Found, Reloading NGINX with 443 config..." && \
    mv 443.conf ./proxyconf/nginx.conf;  \
    else \
    echo "Certificates Not Found, Obtaining Certificates..."; && \
    mv 80.conf ./proxyconf/nginx.conf && \
    certbot certonly --webroot --webroot-path /var/www/certbot/ -d content.wallstreetlocal.com -m zipped@wallstreetlocal.com --non-interactive --agree-tos; && \
    echo "Certificates Obtained, Reloading NGINX with 443 config..."; && \
    mv 443.conf ./proxyconf/nginx.conf; \
    fi

CMD ["certonly", "--webroot", "--webroot-path", "/var/www/certbot/", "-d", "content.wallstreetlocal.com", "-m", "zipped@wallstreetlocal.com", "--non-interactive", "--agree-tos"]
