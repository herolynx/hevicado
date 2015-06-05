#!/bin/bash

APP_NAME=fe
FE_DIR=../../fe
VER=`cat $FE_DIR/package.json | grep version | sed 's/.*".*".*:.*"\(.*\)".*,/\1/'`
PKG_DIR=pkgs
PKG_NAME=hevicado
PKG_ZIP='frontend.tar.gz'

if [ -z "$VER" ]; then
	echo "Error: couldn't read version"
	exit 1
fi

mkdir ../$PKG_DIR 2>/dev/null

echo "Building front-end in version $VER"
cd $FE_DIR
rm -rf release
gulp release

echo "Creating package: $PKG_ZIP"
mv release $PKG_NAME
tar -czf $PKG_ZIP $PKG_NAME
rm -rf $PKG_NAME
mv $PKG_ZIP ../ansible/$PKG_DIR
