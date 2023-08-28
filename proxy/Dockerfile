FROM nginx:1.25.2-alpine

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080
EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
