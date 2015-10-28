#!/bin/bash

#Script to start the RFID server
#Pass ADMIN_PASSWORD from the upstart script

cd "$(dirname "$0")"
cd "../"
echo "Starting tag server with password $ADMIN_PASSWORD"
nodejs ./tagServer.js
