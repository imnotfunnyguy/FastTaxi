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
import { PointHistory } from "./models/PointHistory"; // Import PointHistory model

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

  // Event: driverOnline
  socket.on("driverOnline", async (data) => {
    const { driverId, name, phoneNumber, cars } = data;

    try {
      let driver = await Driver.findOne({ driverId });

      if (driver) {
        // Update existing driver
        driver.name = name;
        driver.phoneNumber = phoneNumber;
        driver.cars = cars;
        driver.isOnline = true; // Mark driver as online
        driver.socketId = socket.id; // Save the socket ID
        await driver.save();
        console.log(`Driver ${driverId} is now online.`);
      } else {
        // Register new driver
        driver = new Driver({
          driverId,
          name,
          phoneNumber,
          cars,
          isOnline: true, // Mark driver as online
          socketId: socket.id,
          points: 100, // Default points
        });
        await driver.save();
        console.log(`Driver ${driverId} registered and is now online.`);
      }

      socket.emit("onlineSuccess", { message: "Driver is now online." });
    } catch (error) {
      console.error("Error setting driver online:", error);
      socket.emit("onlineError", { message: "Failed to set driver online." });
    }
  });

  // Event: driverSync
  socket.on("driverSync", async (data) => {
    const { driverId, location } = data;

    try {
      const driver = await Driver.findOne({ driverId });

      if (driver) {
        driver.location = location; // Update driver's location
        await driver.save();
        console.log(`Driver ${driverId} location updated.`);
      } else {
        console.warn(`Driver ${driverId} not found for location update.`);
      }
    } catch (error) {
      console.error("Error syncing driver location:", error);
    }
  });

  // Event: disconnect
  socket.on("disconnect", async () => {
    console.log("A driver disconnected:", socket.id);

    try {
      const driver = await Driver.findOne({ socketId: socket.id });

      if (driver) {
        driver.isOnline = false; // Mark driver as offline
        driver.socketId = undefined; // Clear the socket ID
        await driver.save();
        console.log(`Driver ${driver.driverId} is now offline.`);
      }
    } catch (error) {
      console.error("Error handling driver disconnect:", error);
    }
  });
});

// API Endpoints
app.get("/api/driver/details", async (req, res) => {
  const { driverId } = req.query;

  if (!driverId) {
    return res.status(400).json({ message: "Driver ID is required." });
  }

  try {
    // Validate if the driver exists
    const driver = await Driver.findOne({ driverId });
    if (!driver) {
      return res.status(404).json({ message: "Driver not found." });
    }

    // Retrieve the driver's points
    const points = driver.points;

    // Retrieve the last updated point activity
    const lastPointActivity = await PointHistory.findOne({ driverId })
      .sort({ timestamp: -1 }) // Sort by the most recent activity
      .select("timestamp reason change"); // Select only relevant fields

    res.status(200).json({
      driverId: driver.driverId,
      name: driver.name,
      phoneNumber: driver.phoneNumber,
      points,
      status: driver.status, // Include the driver's status
      lastPointActivity: lastPointActivity
        ? {
            timestamp: lastPointActivity.timestamp,
            reason: lastPointActivity.reason,
            change: lastPointActivity.change,
          }
        : null, // If no point history exists, return null
    });
  } catch (error) {
    console.error("Error fetching driver details:", error);
    res.status(500).json({ message: "Failed to fetch driver details." });
  }
});

// Driver Registration API
app.post("/api/driver-register", upload.single("driverIdPhoto"), async (req, res) => {
  const { driverId, name, phoneNumber, cars } = req.body;
  const driverIdPhoto = req.file; // Access the uploaded photo

  console.log("Request Body:", req.body);
  console.log("Uploaded File:", driverIdPhoto);

  try {
    // Parse car details from the request
    const carDetails = cars ? JSON.parse(cars) : [];

    // Validate car details
    const validColors = ["red", "green", "blue"];
    for (const car of carDetails) {
      if (!car.licensePlate || !car.color || !validColors.includes(car.color)) {
        return res.status(400).json({
          message: `Invalid car details. Each car must have a license plate and a valid color (red, green, or blue).`,
        });
      }
    }

    let driver = await Driver.findOne({ driverId });

    if (driver) {
      // Update existing driver
      driver.name = name;
      driver.phoneNumber = phoneNumber;
      driver.idPhotoUri = driverIdPhoto ? driverIdPhoto.originalname : driver.idPhotoUri; // Update photo if provided
      driver.cars = carDetails; // Update car details
      await driver.save();
      console.log(`Driver ${driverId} updated.`);
    } else {
      // Register new driver
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
        status: "requested",
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
    const onlineDrivers = await Driver.find({ isOnline: true }); // Fetch drivers marked as online
    const onlineDriverCount = await Driver.countDocuments({ isOnline: true });
    // Get the IDs of drivers currently in a ride
    const driversInRide = await RideRequest.find({ status: "in_ride" }).distinct("driverId");

    // Filter out drivers who are in a ride
    const availableDrivers = onlineDrivers.filter(
      (driver) => !driversInRide.includes(driver.driverId)
    );
    const availableDriverCount = availableDrivers.length;

    const messages = [
      "Special deal: 20% off rides today!",
      "Attention: Peak hours may cause delays.",
      "New feature: Book rides in advance!",
    ]; // Example messages
    const carTypes = ["Sedan", "SUV", "Luxury", "Van"]; // Example car types

    res.status(200).json({
      onlineDriverCount,
      availableDriverCount,
      messages,
      carTypes,
    });
  } catch (error) {
    console.error("Error fetching available drivers:", error);
    res.status(500).json({ message: "Failed to fetch data from the server." });
  }
});

app.post("/api/rideRequests/accept", async (req, res) => {
  const { rideRequestId, driverId } = req.body;

  if (!rideRequestId || !driverId) {
    return res.status(400).json({ message: "Ride request ID and driver ID are required." });
  }

  try {
    const rideRequest = await RideRequest.findOne({ _id: rideRequestId });

    if (!rideRequest) {
      return res.status(404).json({ message: "Ride request not found." });
    }

    if (rideRequest.status !== "requested") {
      return res.status(400).json({ message: "Ride request has already been taken." });
    }

    // Reserve the ride for the driver
    rideRequest.status = "accepted";
    rideRequest.driverId = driverId;
    await rideRequest.save();

    res.status(200).json({ message: "Ride request reserved successfully." });
  } catch (error) {
    console.error("Error reserving ride request:", error);
    res.status(500).json({ message: "Failed to reserve ride request." });
  }
});

app.post("/api/rideRequests/complete", async (req, res) => {
  const { rideRequestId, driverId } = req.body;

  if (!rideRequestId || !driverId) {
    return res.status(400).json({ message: "Ride request ID and driver ID are required." });
  }

  try {
    const rideRequest = await RideRequest.findOne({ _id: rideRequestId, driverId });

    if (!rideRequest) {
      return res.status(404).json({ message: "Ride request not found or not assigned to this driver." });
    }

    if (rideRequest.status !== "accepted") {
      return res.status(400).json({ message: "Ride request is not in a valid state to complete." });
    }

    // Mark the ride as completed
    rideRequest.status = "completed";
    await rideRequest.save();

    res.status(200).json({ message: "Ride completed successfully." });
  } catch (error) {
    console.error("Error completing ride request:", error);
    res.status(500).json({ message: "Failed to complete ride request." });
  }
});

app.get("/api/rideRequests", async (req, res) => {
  const { driverId } = req.query;

  if (!driverId) {
    return res.status(400).json({ message: "Driver ID is required." });
  }

  try {
    // Fetch ride requests that are not yet reserved or completed
    const rideRequests = await RideRequest.find({ status: "requested" });

    res.status(200).json(rideRequests);
  } catch (error) {
    console.error("Error fetching ride requests:", error);
    res.status(500).json({ message: "Failed to fetch ride requests." });
  }
});

app.post("/api/driver/status", async (req, res) => {
  const { driverId, isOnline } = req.body;

  if (!driverId || typeof isOnline !== "boolean") {
    return res.status(400).json({ message: "Driver ID and online status are required." });
  }

  try {
    const driver = await Driver.findOne({ driverId });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found." });
    }

    driver.isOnline = isOnline;
    await driver.save();

    res.status(200).json({ message: `Driver status updated to ${isOnline ? "online" : "offline"}.` });
  } catch (error) {
    console.error("Error updating driver status:", error);
    res.status(500).json({ message: "Failed to update driver status." });
  }
});

app.get("/api/driver/points", async (req, res) => {
  const { driverId } = req.query;

  if (!driverId) {
    return res.status(400).json({ message: "Driver ID is required." });
  }

  try {
    const driver = await Driver.findOne({ driverId });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found." });
    }

    res.status(200).json({ points: driver.points });
  } catch (error) {
    console.error("Error fetching driver points:", error);
    res.status(500).json({ message: "Failed to fetch driver points." });
  }
});

// Start the server
const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});