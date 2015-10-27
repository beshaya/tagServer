# tagServer
A simple server-client pair for authenticating RFID tags

tagServer should be run on a server to manage authorized users and keep log files.
tagClient is designed to run on a Raspberry Pi with libnfc and a adafruit PN532 Breakout board.


## Setting up the Raspi

The executable bin/nfcpoll is compiled statically, so its only dependency should be libusb-dev. However, you'll need to do a bit of configuration for it to run.
 * Install dependecies:
   * sudo apt-get install libusb-dev
 * Configure the raspbery pi to free the serial port
   * sudo raspi-config
   * advanced
   * disable login over serial
 * Move lib-nfc config files
   * sudo mkdir /etc/nfc
   * sudo mkdir /etc/nfc/devices.d
   * cp contrib/pn532_uart_on_rpi.conf /etc/nfc/devices.c
 * Test by running bin/nfcpoll

## Authenticated Users

Put a list of authenticated users in JSON format in users.json:

```
{"name":"Carson","code":"11231223"}
{"name":"Ben","code":"789"}
```

RFID Tag is formatted %0x (i.e. deadbeef instead of DEADBEEF)

users.json is in .gitignore for obvious reasons :)

## Generating Keys

If you need to generate certificates, try following the directions [here](https://github.com/coolaj86/node-ssl-root-cas/wiki/Painless-Self-Signed-Certificates-in-node.js). Note that you may need to set up /etc/hosts on your client device(s) and give your server a host name, since ssl seems to have beef with IP addresses.  Store your root ca (private-root-ca.crt.pem), server key (server.key.pem) and server certificate (server.csr.pem) in the ./keys folder on your server. The client only needs the root ca (same folder).
