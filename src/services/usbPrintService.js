// services/usbPrintService.js

/**
 * Android Native USB Printer Service
 *
 * React
 *   ↓
 * window.AndroidPrinter
 *   ↓
 * Kotlin UsbPrinterBridge
 *   ↓
 * Android USB Host
 *   ↓
 * Printer
 */


// =====================================================
// CHECK ANDROID NATIVE BRIDGE
// =====================================================

const isAndroidPrinterAvailable = () => {

  return (
    typeof window !== "undefined" &&
    window.AndroidPrinter &&
    typeof window.AndroidPrinter.printKOT === "function"
  );
};


// =====================================================
// CHECK NATIVE APP
// =====================================================

export const isNativeUSBAvailable = () => {

  return isAndroidPrinterAvailable();
};


// =====================================================
// PRINT KOT VIA ANDROID
// =====================================================

export const printKOTViaUSB = (
  printData
) => {

  console.log(
    "🖨️ Android USB print request:",
    printData
  );


  // ---------------------------------------------------
  // Check Android bridge
  // ---------------------------------------------------

  if (!isAndroidPrinterAvailable()) {

    return Promise.reject(
      new Error(
        "Native Android USB printer is not available. " +
        "Open the KDS inside the KDS Printer Android app."
      )
    );
  }


  // ---------------------------------------------------
  // Wait for REAL Android print result
  // ---------------------------------------------------

  return new Promise(
    (resolve, reject) => {

      let completed = false;


      // =================================================
      // CLEANUP
      // =================================================

      const cleanup = () => {

        /*
         * Only remove our callback if it is
         * still the callback installed by us.
         */

        if (
          window.onAndroidPrintResult ===
          handlePrintResult
        ) {

          delete window.onAndroidPrintResult;
        }
      };


      // =================================================
      // SUCCESS / FAILURE FROM ANDROID
      // =================================================

      const handlePrintResult = (
        result
      ) => {

        if (completed) {
          return;
        }


        completed = true;


        console.log(
          "📥 Android printer result:",
          result
        );


        try {

          const response =
            typeof result === "string"
              ? JSON.parse(result)
              : result;


          cleanup();


          if (
            response &&
            response.success === true
          ) {

            console.log(
              "✅ Android USB KOT printed successfully"
            );


            resolve(
              response
            );

          } else {

            const message =
              response?.message ||
              "USB printing failed";


            console.error(
              "❌ Android USB print failed:",
              message
            );


            reject(
              new Error(
                message
              )
            );
          }

        } catch (error) {

          cleanup();


          console.error(
            "❌ Invalid Android printer response:",
            error
          );


          reject(
            error
          );
        }
      };


      // =================================================
      // REGISTER CALLBACK BEFORE CALLING ANDROID
      // =================================================

      window.onAndroidPrintResult =
        handlePrintResult;


      // =================================================
      // SEND PRINT REQUEST
      // =================================================

      try {

        const json =
          JSON.stringify(
            printData
          );


        console.log(
          "📤 Sending KOT to Android:",
          json
        );


        window.AndroidPrinter.printKOT(
          json
        );


        /*
         * IMPORTANT:
         *
         * DO NOT resolve here.
         *
         * Kotlin will call:
         *
         * window.onAndroidPrintResult(...)
         *
         * after permission + printing + cutting.
         */

      } catch (error) {

        if (!completed) {

          completed = true;

          cleanup();

          console.error(
            "❌ Android USB print request failed:",
            error
          );

          reject(
            error
          );
        }
      }
    }
  );
};


// =====================================================
// TEST PRINTER
// =====================================================

export const testUSBPrinter =
  async () => {

    if (
      typeof window !== "undefined" &&
      window.AndroidPrinter &&
      typeof window.AndroidPrinter.testPrinter ===
        "function"
    ) {

      return window.AndroidPrinter.testPrinter();
    }


    throw new Error(
      "Android native USB printer bridge not available."
    );
  };


// =====================================================
// LIST USB DEVICES
// =====================================================

export const listUSBDevices =
  async () => {

    if (
      typeof window !== "undefined" &&
      window.AndroidPrinter &&
      typeof window.AndroidPrinter.listUSBDevices ===
        "function"
    ) {

      return window.AndroidPrinter.listUSBDevices();
    }


    throw new Error(
      "Android native USB bridge not available."
    );
  };