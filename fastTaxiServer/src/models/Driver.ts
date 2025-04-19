import mongoose from "mongoose";

const CarSchema = new mongoose.Schema({
  licensePlate: { type: String, required: true }, // License plate for each car
  carType: { type: String }, // Optional: Add car type if needed
  color: { 
    type: String, 
    enum: ["red", "green", "blue"], // Limit color to red, green, and blue
    required: true, // Make color a required field
  }, // Add color field for the car
});

const driverSchema = new mongoose.Schema({
  driverId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  idPhotoUri: { type: String },
  isOnline: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["active", "pending", "suspended", "deleted"], // Predefined statuses
    default: "pending", // Default status is "pending"
  },
  points: { type: Number, default: 0 },
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
  socketId: { type: String },
  cars: { type: [CarSchema], default: [] }, // Array of car objects
});

export const Driver = mongoose.model("Driver", driverSchema);