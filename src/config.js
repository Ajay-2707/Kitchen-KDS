const defaultConfig = {
  apiBaseUrl: "http://192.168.11.1:70",
  kdsName: "Beverages",
  kdsType: "",
  DeliveredItemTime: "",
  printMode: "USB",
  version: "10.0.2"
};

// 🔥 Global override (applies everywhere)
const savedConfig = localStorage.getItem("appConfig");

const config = savedConfig
  ? { ...defaultConfig, ...JSON.parse(savedConfig) }
  : defaultConfig;

export default config;