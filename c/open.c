//Toggles LED specified by command line arg

#include <stdio.h>
#include <stdlib.h>
#include "blink.h"
#include "constants.h"

int main(int argc, char *argv[]) {

  if( argc != 2 ) {
    printf("Usage: open [PIN_NUMBER]");
    return -1;
  }
  int pin = atoi(argv[1]);
  blinkLED(pin, ALLOW_TIME);
  return 0;
}

