FROM nginx:1.23.1-alpine

COPY docker/nginx.conf /etc/nginx/nginx.conf

WORKDIR /www

COPY build /www
