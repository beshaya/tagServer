//Toggles an LED
//uses sysfs

#include <sys/stat.h>
#include <sys/types.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include "blink.h"

#define LOW 0
#define HIGH 1

#define IN 0
#define OUT 1

//enable pin for sysfs
static int GPIOExport(int pin) {
  #define BUFFER_MAX 35
  char buffer[BUFFER_MAX];
  ssize_t buffer_len;
  int fd;

  fd = open("/sys/class/gpio/export", O_WRONLY);
  if (-1 == fd) {
    fprintf(stderr, "Failed to open export for writing!\n");
    return (-1);
  }
  buffer_len = snprintf(buffer, BUFFER_MAX, "%d", pin);
  write(fd, buffer, buffer_len);
  close(fd);
  return(0);
}

//disable pin for sysfs
static int GPIOUnexport(int pin) {
  #define BUFFER_MAX 35
  char buffer[BUFFER_MAX];
  ssize_t buffer_len;
  int fd;

  fd = open("/sys/class/gpio/unexport", O_WRONLY);
  if (-1 == fd) {
    fprintf(stderr, "Failed to close export for writing!\n");
    return (-1);
  }
  buffer_len = snprintf(buffer, BUFFER_MAX, "%d", pin);
  write(fd, buffer, buffer_len);
  close(fd);
  return(0);
}

static int GPIODirection(int pin, int dir) {
  
  #define DIRECTION_MAX 35
  char path[DIRECTION_MAX];
  int fd;

  snprintf(path, DIRECTION_MAX, "/sys/class/gpio/gpio%d/direction", pin);
  fd = open(path, O_WRONLY);
  if (-1 == fd) {
    fprintf(stderr, "Failed to open gpio direction for writing!\n");
    return (-1);
  }

  int result;

  if (dir == IN) {
    result = write(fd, "in", strlen("in"));
  } else {
    result = write(fd, "out", strlen("out"));
  }

  if (result == -1) {
    fprintf(stderr, "Failed to set Direction");
    return(-1);
  }
  close(fd);
  return(0);
}

static int GPIOWrite(int pin, int value) {
  
  #define VALUE_MAX 35
  char path[VALUE_MAX];
  int fd;

  snprintf(path, VALUE_MAX, "/sys/class/gpio/gpio%d/value", pin);
  fd = open(path, O_WRONLY);
  if (-1 == fd) {
    fprintf(stderr, "Failed to open gpio value for writing!\n");
    return (-1);
  }

  int result;

  if (value == HIGH) {
    result = write(fd, "1", strlen("1"));
  } else {
    result = write(fd, "0", strlen("0"));
  }

  if (result == -1) {
    fprintf(stderr, "Failed to set value");
    return(-1);
  }
  close(fd);
  return(0);
}

/**
 * Turn a pin on and off
 * @param pout the pin to toggle
 * @param time how long to hold the pin in milliseconds
 */
int blinkLED(int pout, int time) {

  //export pin and set as output
  if (-1 == GPIOExport(pout)) {
    printf("can't export");
    return (1);
  }

  //delay to allow sysfs to open up gpio files
  usleep(200 * 1000);

  if (-1 == GPIODirection(pout, OUT)) {
    return (2);
  }

  if (-1 == GPIOWrite(pout, HIGH)) {
    return (3);
  }
  usleep(1000 * time);
  if (-1 == GPIOWrite(pout, LOW)) {
    return (3);
  }

  //if (-1 == GPIOUnexport(pout)) {
  //  return (4);
  //}
  return (0);
}

