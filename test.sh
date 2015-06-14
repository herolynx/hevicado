#!/bin/bash

cd fe 
npm test

cd ../be 
sbt test