#!/bin/bash

echo "Cleaning pkg directory"
rm -rf pkgs
cd build
./build-fe.sh
./build-be.sh
./docker-be.sh
