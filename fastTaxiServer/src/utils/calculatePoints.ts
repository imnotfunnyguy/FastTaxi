import { calculateDistance } from "./calculateDistance";

export const calculateRidePoints = (
  pickupLocation: { latitude: number; longitude: number },
  destinationLocation: { latitude: number; longitude: number }
): number => {
  const distance = calculateDistance(pickupLocation, destinationLocation);
  const points = Math.ceil(distance * 10); // Example: 10 points per km
  return points;
};