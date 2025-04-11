import { Router } from "express";
import { RideRequest } from "../models/RideRequest";

const router = Router();

// Get all ride requests
router.get("/", async (req, res) => {
  try {
    const rideRequests = await RideRequest.find();
    res.json(rideRequests);
  } catch (error) {
    console.error("Error fetching ride requests:", error);
    res.status(500).json({ message: "Failed to fetch ride requests." });
  }
});

// Update the status of a ride request
router.put("/:requestId", async (req, res) => {
  try {
    const { status } = req.body;
    const rideRequest = await RideRequest.findOneAndUpdate(
      { requestId: req.params.requestId },
      { status },
      { new: true }
    );

    if (!rideRequest) {
      return res.status(404).json({ message: "Ride request not found." });
    }

    res.json(rideRequest);
  } catch (error) {
    console.error("Error updating ride request:", error);
    res.status(500).json({ message: "Failed to update ride request." });
  }
});

export default router;