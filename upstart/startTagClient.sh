#!/bin/bash

#Script to start the RFID server
#Pass ADMIN_PASSWORD from the upstart script

cd "$(dirname "$0")"
cd "../client"
nodejs ./tagClient.js
