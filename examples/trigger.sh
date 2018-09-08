#!/bin/bash

if [ $# -eq 0 ]
  then
    echo "No trigger name supplied"
fi

echo "Triggering Action:"$1
curl -H "Content-Type: application/json" -X POST -d '{"actionID": "'$1'", "value": "0"}' http://127.0.0.1:3001

