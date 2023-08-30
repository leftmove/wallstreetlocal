#!/bin/bash

if [ -d "/etc/letsencrypt/live" ]; then
    echo "Certificates Found, Updating NGINX Configuration for Port 443..."
    cp nginx443.conf /proxyconf
    echo "NGINX Configuration Updated"
else
    echo "Certificates Found, Updating NGINX Configuration for Port 80..."
    cp nginx80.conf /proxyconf
    echo "NGINX Configuration Updated"
fi
