#!/bin/bash
openssl req -x509 -nodes -days 365 -subj "/C=CA/ST=QC/O=Company, Inc./CN=*.qba" -newkey rsa:2048 -keyout ./ssl/private/nginx-selfsigned.key -out ./ssl/certs/nginx-selfsigned.crt

#openssl req -x509 -nodes -days 365 -subj "/C=CA/ST=QC/O=Company, Inc./CN=192.168.0.101" -addext "subjectAltName=DNS:192.168.0.101" -newkey rsa:2048 -keyout ./app/ssl/private/app-selfsigned.key -out ./app/ssl/certs/app-selfsigned.crt
#openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./nginx/ssl/private/nginx-selfsigned.key -out ./nginx/ssl/certs/nginx-selfsigned.crt
#openssl dhparam -out ./nginx/ssl/certs/dhparam.pem 2048
