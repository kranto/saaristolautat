#!/bin/sh

set -eu

data_was_moved=false
restore_data() {
  if [ "$data_was_moved" = true ] && [ -e .data.save -o -L .data.save ]; then
    mv .data.save public/data
  fi
}
trap restore_data EXIT HUP INT TERM

if [ -e public/data ] || [ -L public/data ]; then
  mv public/data .data.save
  data_was_moved=true
fi

VITE_APP_VERSION=$(date +'%Y%m%d%H%M%S')
export VITE_APP_VERSION
vite build
