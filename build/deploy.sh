#!/bin/bash

PKG_DIR=pkgs
APP_NAME=kunishu-fe
ENV=$1
VER=$2
PKG_NAME=kunishu-fe-$VER'.tar.gz'
NGINX_HTML=/usr/share/nginx/html
USR_DIR=/home/kunishu

if [ -z "$ENV" -o -z "$VER" ]; then
	echo "Usage: release <ENV> <VER>"
	exit 1
fi
if [ ! -f "$PKG_DIR/$PKG_NAME" ]; then
    echo "Release package not found: $PKG_DIR/$PKG_NAME"
	exit 1
fi

echo "Target platform: $ENV"

echo "Uploading package $PKG_DIR/$PKG_NAME"
scp $PKG_DIR/$PKG_NAME $ENV:$USR_DIR

echo "Deploying package to NGINX"
ssh $ENV "sudo -u kunishu tar -xzf $USR_DIR/$PKG_NAME -C $USR_DIR"
ssh $ENV "sudo rm -rf $NGINX_HTML/kunishu"
ssh $ENV "sudo mv $USR_DIR/$APP_NAME-$VER $NGINX_HTML/kunishu"
