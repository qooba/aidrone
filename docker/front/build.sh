#!/bin/bash

cp -r ../../src/front ./front
cp -r ../../src/nginx ./nginx
cp -r ../../src/ssl ./ssl
cp ../../src/ssl.sh .

docker build -t tello:front .

rm -rf ./front ./nginx ./ssl ssl.sh

