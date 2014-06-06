#!/bin/bash

for DIR in EZY-*
do
    if [ -e ${DIR}/common/ipad.js ]
    then
	rm -f ${DIR}/common/ipad.js
	ln ipad.js  ${DIR}/common/
    fi
done
