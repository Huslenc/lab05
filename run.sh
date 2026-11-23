#!/bin/bash
mkdir -p results
case $1 in
 pass) newman run lab05-collection.json 2>&1 | tee results/newman-pass.txt; echo "exit=${PIPESTATUS[0]}";;
 fail) newman run lab05-collection-fail.json 2>&1 | tee results/newman-fail.txt; echo "exit=${PIPESTATUS[0]}";;
 down) newman run lab05-collection.json 2>&1 | tee results/newman-down.txt; echo "exit=${PIPESTATUS[0]}";;
esac
