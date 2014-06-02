#!/bin/bash

for DIR in EZY-A3N*
do
    rm -f ${DIR}/common/main.js
    ln -s ~/proj/vistair_mod/main.js  ${DIR}/common/
    rm ${DIR}/common/ipad.css
    ln -s ~/proj/vistair_mod/ipad.css  ${DIR}/common/
    rm ${DIR}/common/ipad.js
    ln -s ~/proj/vistair_mod/ipad.js  ${DIR}/common/
done

for DIR in EZY-ALL* EZY-A3XX*
do
    rm -f ${DIR}/common/main.js
    ln -s ~/proj/vistair_mod/main-ezy.js  ${DIR}/common/main.js
    rm ${DIR}/common/ipad.css
    ln -s ~/proj/vistair_mod/ipad-ezy.css  ${DIR}/common/ipad.css
    rm ${DIR}/common/ipad.js
    ln -s ~/proj/vistair_mod/ipad.js  ${DIR}/common/
done