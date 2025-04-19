import mongoose from "mongoose";

const PointHistorySchema = new mongoose.Schema({
  driverId: { type: String, required: true }, // Reference to the driver
  change: { type: Number, required: true }, // Points added or deducted
  reason: { 
    type: String, 
    enum: ["newRegister", "rideRequestAccepted", "bonus"], // Limit reasons to predefined values
    required: true, // Make reason a required field
  },
  timestamp: { type: Date, default: Date.now }, // Automatically set the timestamp
});

export const PointHistory = mongoose.model("PointHistory", PointHistorySchema);