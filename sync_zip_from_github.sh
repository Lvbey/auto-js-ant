#!/bin/bash

file_dir=/usr/local/jpress/webapp/attachment/
file_name=auto-js-ant-release.zip

if [[ -e "${file_dir}${file_name}" ]]
then 
    mv -f "${file_dir}${file_name}" "${file_dir}${file_name}.bak"
fi

wget  https://github.com/Lvbey/auto-js-ant/archive/release.zip -O "${file_dir}${file_name}"
