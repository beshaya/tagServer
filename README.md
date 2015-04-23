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

## Generating Keys

If you have a properly signed SSL certificate for your server, great, otherwise, you'll probably want to put together a self signed certificate chain.

I suggest following the directions [here](https://github.com/coolaj86/node-ssl-root-cas/wiki/Painless-Self-Signed-Certificates-in-node.js). Note that you may need to set up /etc/hosts on your client device(s) and give your server a host name, since ssl seems to have beef with IP addresses.  Store your root ca (private-root-ca.crt.pem), server key (server.key.pem) and server certificate (server.csr.pem) in the ./keys folder on your server. The client only needs the root ca (same folder).