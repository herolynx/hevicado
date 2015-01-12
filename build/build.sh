#!/bin/bash

APP_NAME=kunishu-fe
VER=`cat ../package.json | grep version | sed 's/.*".*".*:.*"\(.*\)".*,/\1/'`
PKG_DIR=pkgs
PKG_NAME=$APP_NAME-$VER

if [ -z "$VER" ]; then
	echo "Error: couldn't read version"
	exit 1
fi

mkdir $PKG_DIR 2>/dev/null

echo "Building $VER..."
cd ..
rm -rf release
gulp release

#copy built package
mv release $PKG_NAME
tar -czf $PKG_NAME'.tar.gz' $PKG_NAME
rm -rf $PKG_NAME
mv $PKG_NAME'.tar.gz' build/$PKG_DIR
cd build
echo "Package ready: $PKG_DIR/$PKG_NAME.tar.gz"