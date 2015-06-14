#!/bin/bash

cd be
echo "~re-start" | sbt; project io-web
