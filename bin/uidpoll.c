// To compile this simple example:
// $ gcc -o quick_start_example1 quick_start_example1.c -lnfc

#include <stdlib.h>
#include <nfc/nfc.h>

#define INFO(...) if (!quiet) printf __VA_ARGS__
#define ERR(...) fprintf(stderr, __VA_ARGS__)

static void
print_hex(const uint8_t *pbtData, const size_t szBytes)
{
  size_t  szPos;

  for (szPos = 0; szPos < szBytes; szPos++) {
    printf("%02x", pbtData[szPos]);
  }
}

int my_nfc_init (nfc_device ** pnd, nfc_context** context, int quiet) {

  nfc_init(context);
  if (*context == NULL) {
    printf("Unable to init libnfc (malloc)\n");
    return (-1);
  }

  // Display libnfc version
  const char *acLibnfcVersion = nfc_version();
  //(void)argc;
  acLibnfcVersion = nfc_version();
  INFO(("using libnfc %s\n", acLibnfcVersion));


  
  // Initialize libnfc and set the nfc_context

  // Open, using the first available NFC device which can be in order of selection:
  //   - default device specified using environment variable or
  //   - first specified device in libnfc.conf (/etc/nfc) or
  //   - first specified device in device-configuration directory (/etc/nfc/devices.d) or
  //   - first auto-detected (if feature is not disabled in libnfc.conf) device
  *pnd = nfc_open(*context, NULL);

  if (*pnd == NULL) {
    printf( "ERROR: %s\n", "Unable to open NFC device.");
    return(-1);
  }
  // Set opened NFC device to initiator mode
  if (nfc_initiator_init(*pnd) < 0) {
    nfc_perror(*pnd, "nfc_initiator_init");
    return(-1);
  }

  INFO(("NFC reader: %s opened\n", nfc_device_get_name(*pnd)));
  return(0);
  
}

int my_nfc_poll(nfc_device *pnd, nfc_context *context, int quiet) {

  nfc_target nt;
  // Poll for a ISO14443A (MIFARE) tag
  const nfc_modulation nmMifare = {
    .nmt = NMT_ISO14443A,
    .nbr = NBR_106,
  };
  if (nfc_initiator_select_passive_target(pnd, nmMifare, NULL, 0, &nt) > 0) {
    INFO(("The following (NFC) ISO14443A tag was found:\n"));
    INFO(("   ATQA (SENS_RES): "));
    print_hex(nt.nti.nai.abtAtqa, 2);
    INFO(("\n      UID (NFCID%c): ", (nt.nti.nai.abtUid[0] == 0x08 ? '3' : '1')));
    print_hex(nt.nti.nai.abtUid, nt.nti.nai.szUidLen);
    INFO(("\n     SAK (SEL_RES): "));
    print_hex(&nt.nti.nai.btSak, 1);
    if (nt.nti.nai.szAtsLen) {
      INFO(("\n          ATS (ATR): "));
      print_hex(nt.nti.nai.abtAts, nt.nti.nai.szAtsLen);
    }
    printf("\n");
    fflush(stdout);
  }

  // wait for the tag to be removed
  while (0 == nfc_initiator_target_is_present(pnd, NULL)) {}
  return 0;
}

int main (int argc, const char *argv[]) {
  nfc_device *pnd;
  nfc_target nt;

  // Allocate only a pointer to nfc_context
  nfc_context *context;

  int quiet = 0;
  //check for -q flag for quiet
  if (argc > 1) {
    if (0 == strcmp("-q", argv[1])) {
      quiet = 1;
    }
  }

  if (my_nfc_init(&pnd, &context, quiet) != 0) {
    exit(-1);
  }

  fflush(stdout);
  while (1) {
    if ( my_nfc_poll(pnd, context, quiet) != 0) {
      exit(-1);
    }
  }

  // Close NFC device
  nfc_close(pnd);
  // Release the context
  nfc_exit(context);
  exit(EXIT_SUCCESS);
}
