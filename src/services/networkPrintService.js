// services/networkPrintService.js

import config from "../config.js";

export const printKOTViaServer = async (printData) => {
  if (!printData?.items || printData.items.length === 0) {
    console.log("No items to print");
    return;
  }

  try {
    console.log("🖨️ Sending KOT to print server:", printData);

    const response = await fetch(
      `${config.apiBaseUrl}/api/print/kot`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(printData),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Print server failed"
      );
    }

    console.log("✅ KOT printed successfully");

    return result;

  } catch (error) {
    console.error(
      "❌ Network printing failed:",
      error
    );

    throw error;
  }
};