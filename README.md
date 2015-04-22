# tagServer
A simple server-client pair for authenticating RFID tags

tagServer should be run on a server to manage authorized users and keep log files.
tagClient is designed to run on a Raspberry Pi with libnfc and a adafruit PN532 Breakout board.


## Authenticated Users

Put a list of authenticated users in JSON format in users.json:
users = { 
  'USERNAME': 'RFID TAG',
  'USERNAME': 'RFID TAG'
}

This file is in .gitignore for obvious reasons :)
