#!/bin/bash

DIR=$(dirname $0)

TARGET=/home3/meigyale/livedata

python $DIR/get_vessels10.py $TARGET/lauttalive.db True #update history
mv livedata.json1 $TARGET/livedata.json
mv livehistory.json1 $TARGET/livehistory.json

sleep 27

python $DIR/get_vessels10.py $TARGET/lauttalive.db False #do not update history
mv livedata.json1 $TARGET/livedata.json

