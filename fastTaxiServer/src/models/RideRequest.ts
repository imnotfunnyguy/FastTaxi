import mongoose from "mongoose";

const RideRequestSchema = new mongoose.Schema({
  requestId: { type: String, required: true },
  clientSocketId: { type: String, required: true },
  clientName: { type: String, required: true },
  clientPhone: { type: String, required: true },
  driverId: { type: String }, // Added driverId field
  status: {
    type: String,
    enum: ["requested", "accepted", "completed", "canceled"],
    required: true,
  },
  pickupLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
  destinationLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
});

export const RideRequest = mongoose.model("RideRequest", RideRequestSchema);

