#!/bin/bash

cd ../../docker

echo "Preparing docker image for hevicado-be"
cd be
docker build -t hevicado-be .
