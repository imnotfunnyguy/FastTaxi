import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import multer from "multer"; // Import multer for handling form-data
import { connectDatabase } from "./config/database";
import { Driver } from "./models/Driver";
import { RideRequest } from "./models/RideRequest";
import { calculateDistance } from "./utils/calculateDistance";
import { calculateRidePoints } from "./utils/calculatePoints";

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for handling file uploads
const upload = multer({ storage: multer.memoryStorage() });

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

connectDatabase();

// WebSocket connection
io.on("connection", (socket) => {
  console.log("A driver connected:", socket.id);

  socket.on("driverRegister", async (data) => {
    const { driverId, name, licensePlate, phoneNumber, idPhotoUri } = data;

    try {
      console.log(driverId, name, licensePlate, phoneNumber, idPhotoUri);
      let driver = await Driver.findOne({ driverId });

      if (driver) {
        driver.name = name;
        driver.licensePlate = licensePlate;
        driver.phoneNumber = phoneNumber;
        driver.idPhotoUri = idPhotoUri;
        driver.socketId = socket.id;
        await driver.save();
        console.log(`Driver ${driverId} updated.`);
      } else {
        driver = new Driver({
          driverId,
          name,
          licensePlate,
          phoneNumber,
          idPhotoUri,
          socketId: socket.id,
          points: 100, // Default points
        });
        await driver.save();
        console.log(`Driver ${driverId} registered.`);
      }

      socket.emit("registrationSuccess", { message: "Driver registered successfully!" });
    } catch (error) {
      console.error("Error registering driver:", error);
      socket.emit("registrationError", { message: "Failed to register driver." });
    }
  });

  socket.on("disconnect", () => {
    console.log("A driver disconnected:", socket.id);
  });
});

// API Endpoints

// Driver Registration API
app.post("/api/driver-register", upload.single("driverIdPhoto"), async (req, res) => {
  const { driverId, name, phoneNumber, cars } = req.body;
  const driverIdPhoto = req.file; // Access the uploaded photo

  console.log("Request Body:", req.body);
  console.log("Uploaded File:", driverIdPhoto);

  try {
    // Parse car details from the request
    const carDetails = cars ? JSON.parse(cars) : [];

    let driver = await Driver.findOne({ driverId });

    if (driver) {
      driver.name = name;
      driver.phoneNumber = phoneNumber;
      driver.idPhotoUri = driverIdPhoto ? driverIdPhoto.originalname : driver.idPhotoUri; // Update photo if provided
      driver.cars = carDetails; // Update car details
      await driver.save();
      console.log(`Driver ${driverId} updated.`);
    } else {
      driver = new Driver({
        driverId,
        name,
        phoneNumber,
        idPhotoUri: driverIdPhoto ? driverIdPhoto.originalname : null, // Save the photo name
        cars: carDetails, // Save car details
        socketId: null, // No socket ID for HTTP API
        points: 100, // Default points
      });
      await driver.save();
      console.log(`Driver ${driverId} registered.`);
    }

    res.status(200).json({ message: "Driver registered successfully!" });
  } catch (error) {
    console.error("Error registering driver:", error);
    res.status(500).json({ message: "Failed to register driver." });
  }
});

// Request Ride API
app.post("/api/request-ride", async (req, res) => {
  const { name, phoneNumber, pickupLocation, destination, additionalDetails } = req.body;

  if (!name || !phoneNumber || !pickupLocation || !destination) {
    return res.status(400).json({ message: "All mandatory fields are required." });
  }

  // Log the received data
  console.log("Ride Request Data:", {
    name,
    phoneNumber,
    pickupLocation,
    destination,
    additionalDetails,
  });

  try {
    const drivers = await Driver.find({ isOnline: true });
    const nearbyDrivers = drivers.filter((driver) => {
      if (
        pickupLocation?.latitude != null &&
        pickupLocation?.longitude != null &&
        driver.location?.latitude != null &&
        driver.location?.longitude != null
      ) {
        const distance = calculateDistance(
          { latitude: pickupLocation.latitude, longitude: pickupLocation.longitude },
          { latitude: driver.location.latitude, longitude: driver.location.longitude }
        );
        return distance <= 5;
      }
      return false;
    });

    if (nearbyDrivers.length > 0) {
      const ridePoints = calculateRidePoints(pickupLocation, destination);
      const selectedDriver = nearbyDrivers[0];

      const rideRequest = new RideRequest({
        name,
        phoneNumber,
        pickupLocation,
        destination,
        driverId: selectedDriver.driverId,
        ridePoints,
        status: "requesting",
      });
      await rideRequest.save();

      console.log(`Ride request sent to driver ${selectedDriver.driverId}. Points required: ${ridePoints}`);
      res.status(200).json({ message: "Ride request sent successfully." });
    } else {
      res.status(200).json({ message: "No drivers available nearby." });
    }
  } catch (error) {
    console.error("Error handling ride request:", error);
    res.status(500).json({ message: "Failed to process ride request." });
  }
});

app.get("/api/available-drivers", async (req, res) => {
  try {
    const availableDrivers = await Driver.find({ isOnline: true }); // Fetch drivers marked as online
    const messages = [
      "Special deal: 20% off rides today!",
      "Attention: Peak hours may cause delays.",
      "New feature: Book rides in advance!",
    ]; // Example messages

    res.status(200).json({
      availableDrivers,
      messages,
    });
  } catch (error) {
    console.error("Error fetching available drivers:", error);
    res.status(500).json({ message: "Failed to fetch data from the server." });
  }
});

// Start the server
const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});