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
  RIDE_REQUESTS_REQUEST: `${API_BASE_URL}/rideRequests/request`,
  RIDE_REQUESTS_CANCEL: `${API_BASE_URL}/rideRequests/cancel`,
  AVAILABLE_DRIVERS: `${API_BASE_URL}/drivers/available`, // Added endpoint for available drivers
};

export const URL_ENDPOINTS = {
  PLACEHOLDER: "https://placehold.co/150x50?text=FAST+TAXI"
}