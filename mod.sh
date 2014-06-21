#!/bin/bash

for DIR in EZY-*
do
    echo $DIR
    if [ -e ${DIR}/common/ipad.js ]
    then
	rm -f ${DIR}/common/ipad.js
    fi
    ln ipad.js  ${DIR}/common/
done
