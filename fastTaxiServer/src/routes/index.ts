import { Router } from "express";
import driverRoutes from "./driverRoutes";
import rideRoutes from "./rideRoutes";

const router = Router();

// Register driver-related routes
router.use("/drivers", driverRoutes);

// Register ride-related routes
router.use("/rides", rideRoutes);

export default router;