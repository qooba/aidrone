#!/bin/bash

cp -r ../../src/app ./app
docker build -t tello .
docker build -t tello:dev -f Dockerfile.dev .
rm -rf ./app
