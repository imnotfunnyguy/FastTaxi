const CONFIG: Record<"development" | "production", { BASE_URL: string }> = {
  development: {
    BASE_URL: "http://10.0.2.2:3000/api", // Use 10.0.2.2 for Android emulator
  },
  production: {
    BASE_URL: "https://your-production-server.com/api",
  },
};

export const API_BASE_URL = CONFIG[(process.env.NODE_ENV as "development" | "production") || "development"].BASE_URL;

export const API_ENDPOINTS = {
  DRIVER_REGISTER: `${API_BASE_URL}/driver-register`,
  DRIVER_INFO: `${API_BASE_URL}/driver-info`,
};