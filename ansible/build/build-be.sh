#!/bin/bash

BE_DIR=../../be
APP_NAME=hevicado
PKG_DIR=pkgs
PKG_NAME=$APP_NAME'.jar'
PKG_ZIP='backend.tar.gz'
DOCKER_DIR=docker/workdir

mkdir ../$PKG_DIR 2>/dev/null
mkdir ../../$DOCKER_DIR 2>/dev/null

echo "Building backend"
cd $BE_DIR
# build package in order to skip tests during ansible builds
sbt clean assembly

echo "Preparing package $PKG_ZIP"
cp io-web/target/scala*/io-web-assembly*.jar $PKG_NAME
tar -czf $PKG_ZIP $PKG_NAME
mv $PKG_ZIP ../ansible/$PKG_DIR

echo "Preparing package for docker"
mv $PKG_NAME ../$DOCKER_DIR/$PKG_NAME

