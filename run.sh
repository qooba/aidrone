#!/bin/bash


docker run --name tello --network app_default --gpus all -d --rm -p 8890:8890 -p 8080:8080 -p 8888:8888 -p 11111:11111/udp  tello /bin/bash -c "python3 drone.py"
docker run -d --rm --network app_default --name nginx -p 80:80 -p 443:443 tello:front
