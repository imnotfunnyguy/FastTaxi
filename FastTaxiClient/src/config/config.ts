const ENV = process.env.NODE_ENV || "development"; // Default to "development" if not set

const CONFIG = {
  development: {
    BASE_URL: "http://10.0.2.2:3000/api", // Local development server
  },
  production: {
    BASE_URL: "https://your-production-server.com/api", // Production server
  },
};

export const API_BASE_URL = CONFIG[ENV as keyof typeof CONFIG].BASE_URL;

// Define API endpoints
export const API_ENDPOINTS = {
  REQUEST_RIDE: `${API_BASE_URL}/request-ride`,
  CANCEL_RIDE: `${API_BASE_URL}/cancel-ride`,
};