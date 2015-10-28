# tagServer
A simple server-client pair for authenticating RFID tags

tagServer should be run on a server to manage authorized users and keep log files.
tagClient is designed to run on a Raspberry Pi with libnfc and a adafruit PN532 Breakout board.


## Setting up the Raspi client (tag reader)

The executable bin/nfcpoll is compiled statically, so its only dependency should be libusb-dev. However, you'll need to do a bit of configuration for it to run.
 * Install dependecies:
   * `sudo apt-get install libusb-dev npm nodejs`
   * `npm install`
 * Configure the raspbery pi to free the serial port
   * sudo raspi-config
   * advanced
   * disable login over serial
 * Move lib-nfc config files
   * sudo mkdir /etc/nfc
   * sudo mkdir /etc/nfc/devices.d
   * cp contrib/pn532_uart_on_rpi.conf /etc/nfc/devices.c
 * Wire up your breakout board
 * Test by running bin/nfcpoll (placing a MiFare card in front of it should result in the card's ID being printed to terminal
 * If you wish to have the client activate the door lock, you can modify "allow" and "deny" in the c folder to trigger your relay/mosfet
 * Install your certificates (see below) or set config.json to not use https (not recommended).
 * Install upstart
 * cp ./upstart/tagClient.conf /etc/init/
 * You should now be able to start the server with 
 * Reboot and the tag client should start

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
