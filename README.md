# tagServer
A simple server-client pair for authenticating RFID tags

tagServer should be run on a server to manage authorized users and keep log files.
tagClient is designed to run on a Raspberry Pi with libnfc and a adafruit PN532 Breakout board.


## Authenticated Users

Put a list of authenticated users in JSON format in users.json:
```
users = { 
  "RFID TAG": {"name": "USERNAME", "access": {
    "group1": true,
    "group2": true
  },
  "RFID TAG": {"name": "USERNAME", "access": {
    "group1": true,
    "group2": true
  } 
}
```

RFID Tag is formatted %0x (i.e. deadbeef instead of DEADBEEF)

users.json is in .gitignore for obvious reasons :)
