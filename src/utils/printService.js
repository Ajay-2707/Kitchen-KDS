// utils/printService.js

export const printKOT = (printData) => {

  const readyItems = printData.items;

  if (readyItems.length === 0) {
    console.log("No ready items");
    return;
  }

  const totalWidth = 32;

  const billType = printData.billType || "N/A";

  const stwd = printData.steward || "N/A";
  const customerName = printData.customerName || "N/A";
  const customerMobile = printData.customerMobile
  ? `${String(printData.customerMobile).slice(0, 1)}*******${String(printData.customerMobile).slice(-4)}`
  : "N/A";

  // 🔹 Center (for footer text)
  const center = (text, width = totalWidth) => {
    const spaces = Math.floor((width - text.length) / 2);
    return " ".repeat(Math.max(0, spaces)) + text;
  };

  // 🔹 Item formatter
  // const formatItem = (name, qty, index) => {
  //   const qtyWidth = 4;
  //   const itemWidth = totalWidth - qtyWidth;

  //   let itemText = `${index}. ${name}`;

  //   if (itemText.length > itemWidth) {
  //     itemText = itemText.slice(0, itemWidth - 3) + "...";
  //   }

  //   const paddedItem = itemText.padEnd(itemWidth, " ");
  //   const paddedQty = String(qty).padStart(qtyWidth, " ");

  //   return paddedItem + paddedQty;
  // };

  const formatItem = (name, qty, index) => {
  const qtyWidth = 4;
  const itemWidth = totalWidth - qtyWidth;

  const words = (`${index}. ${name}`).split(" ");
  const lines = [];
  let line = "";

  words.forEach(word => {
    if ((line + word).length <= itemWidth) {
      line += (line ? " " : "") + word;
    } else {
      lines.push(line);
      line = word;
    }
  });

  if (line) lines.push(line);

  return lines
    .map((l, i) =>
      i === 0
        ? l.padEnd(itemWidth, " ") + String(qty).padStart(qtyWidth, " ")
        : l
    )
    .join("\n");
};

  // 🔹 Footer/Header formatter
  const formatFooter = (left, right, width = totalWidth) => {
    const space = width - (left.length + right.length);
    return left + " ".repeat(Math.max(1, space)) + right;
  };

  const itemsText = readyItems
    .map((i, idx) => formatItem(i.name, i.qty, idx + 1))
    .join("\n");

  const header = formatFooter("ITEM", "QTY");

  const footerLine = formatFooter(
    `Steward: ${stwd}`,
    `Items: ${readyItems.length}`
  );

  const divider = "-".repeat(totalWidth);

  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const time = now.toTimeString().split(" ")[0];
  const isTableBilling = billType.toLowerCase() === "table billing";
  // 🔥 HEADER (HTML styled)
  const headerHTML = `
    <div class="title">${billType.toUpperCase()}</div>
    <div class="token">
    ${isTableBilling
      ? `Table No: ${printData.tableName || "-"}`
      : `Token No: ${printData.tokenNo || "-"}`
    }
  </div>
  `;

  // 🔹 BODY (pre formatted)
  const bodyContent = `
${divider}
${
  isTableBilling
    ? `Guest name: ${customerName}
Guest mob.: ${customerMobile}
Bill: ${printData.billNo || "-"} | KOT: ${printData.kotNo}`: `Bill: ${printData.billNo || "-"} | KOT: ${printData.kotNo}`
}
${divider}
Date: ${date}   Time: ${time}

${header}
${divider}
${itemsText}
${divider}
${footerLine}

${center("KDS PRINT (ver 10.0.2)")}
`;

  openPrintWindow(headerHTML, bodyContent);
};

const openPrintWindow = (headerHTML, bodyContent) => {
  const win = window.open("", "_blank");

  if (!win) {
    alert("Popup blocked!");
    return;
  }

  win.document.write(`
<html>
  <head>
    <style>
      body {
        font-family: monospace;
        margin: 0;
        padding: 0;
      }

      /* 🔥 BIG ORDER TYPE */
      .title {
        text-align: center;
        font-size: 20px;
        font-weight: bold;
        width: 100%;
      }

      /* 🔥 TOKEN */
      .token {
        text-align: center;
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 4px;
      }

      pre {
        font-family: monospace;
        font-size: 12px;
        line-height: 1.2;
        width: 32ch;
        padding-left: 20px;
        padding-right: 20px;
        margin: auto;
      }

      @media print {
        body { margin: 0; }
        @page { margin: 0; }
      }
    </style>
  </head>
  <body>
    ${headerHTML}
    <pre>${bodyContent}</pre>

    <script>
      setTimeout(() => {
        window.print();
        window.close();
      }, 300);
    </script>
  </body>
</html>
`);

  win.document.close();
};