#!/bin/bash

if [ $# -eq 0 ]
  then
    echo "No actionID supplied"
fi

echo "Triggering Action:"$1
curl -d '{"actionID":"$1"}' -H "Content-Type: application/json" http://localhost:3001/actions

