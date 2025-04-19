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
  BASE: `${API_BASE_URL}`, //base api url
  DRIVER_REGISTER: `${API_BASE_URL}/api/driver/register`, // Driver registration
  RIDE_REQUESTS: `${API_BASE_URL}/api/rideRequests`, // Fetch ride requests
  COMPLETE_RIDE: `${API_BASE_URL}/api/rideRequests/complete`, // Complete a ride
  DRIVER_CARS: `${API_BASE_URL}/api/driver/cars`, // Fetch or update driver cars
  DRIVER_GO_ONLINE: `${API_BASE_URL}/api/driver/goOnline`, // Mark driver as online
  DRIVER_DETAILS: `${API_BASE_URL}/api/driver/details`, // Added DRIVER_DETAILS endpoint
  RIDE_REQUESTS_COMPLETE: `${API_BASE_URL}/rideRequests/complete`,
  DRIVER_POINTS: `${API_BASE_URL}/driver/points`,
  RIDE_REQUESTS_ACCEPT:`${API_BASE_URL}/rideRequests/accept`
};