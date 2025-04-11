import { Router } from "express";
import { Driver } from "../models/Driver";

const router = Router();

// Get all drivers
router.get("/", async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (error) {
    console.error("Error fetching drivers:", error);
    res.status(500).json({ message: "Failed to fetch drivers." });
  }
});

// Get a specific driver by ID
router.get("/:id", async (req, res) => {
  try {
    const driver = await Driver.findOne({ id: req.params.id });
    if (!driver) {
      return res.status(404).json({ message: "Driver not found." });
    }
    res.json(driver);
  } catch (error) {
    console.error("Error fetching driver:", error);
    res.status(500).json({ message: "Failed to fetch driver." });
  }
});

export default router;