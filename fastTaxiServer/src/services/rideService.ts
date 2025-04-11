import { RideRequest } from "../models/RideRequest";

export const createRideRequest = async (rideData: any) => {
  const rideRequest = new RideRequest(rideData);
  await rideRequest.save();
  return rideRequest;
};

export const expirePendingRequests = async () => {
  const expiredRequests = await RideRequest.updateMany(
    { status: "pending" },
    { status: "expired" }
  );
  return expiredRequests;
};