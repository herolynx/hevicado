#!/bin/bash

alive=`docker ps | grep {{ item }} | wc -l`

if [ $alive -eq 1 ]; then
   exit 0
else
   exit 1
fi
