#!/bin/bash

git fetch --all
git reset --hard origin/release
git pull origin/release
echo "git update successfully"


file_dir=/usr/local/jpress/webapp/attachment/
file_name=auto-js-ant-release.zip

if [[ -e "${file_dir}${file_name}" ]]
then 
    echo "backup file successfully"
    mv -f "${file_dir}${file_name}" "${file_dir}${file_name}.bak"
fi


git archive --format=zip --output="${file_dir}${file_name}" --prefix="auto-js-ant/" release


if [[ -s "${file_dir}${file_name}" ]]
then
    echo "synchronized successfully"
else
    echo "synchronized failed:the file ${file_name}'s " size is 0
fi


#wget --timeout=30 --waitretry=2 --tries=3  https://github.com/Lvbey/auto-js-ant/archive/release.zip --no-check-certificate -O "${file_dir}${file_name}.tmp"

# if [[ -s "${file_dir}${file_name}.tmp" ]]
# then
    # mv "${file_dir}${file_name}.tmp" "${file_dir}${file_name}"
# else
    # echo "${file_dir}${file_name}.tmp" size is 0
# fi






