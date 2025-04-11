import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({
  driverId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  licensePlate: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  idPhotoUri: { type: String },
  isOnline: { type: Boolean, default: false },
  points: { type: Number, default: 100 },
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
  socketId: { type: String },
  cars: { type: Array, default: [] }, // Add cars property
});

export const Driver = mongoose.model("Driver", driverSchema);
