const express = require("express");
const router = express.Router();
const tripController = require("../controllers/tripController");
const authMiddleware = require("../middleware/auth");

// Calculation endpoint (mounted at /api/calculate when router is mounted at /api)
router.post("/calculate", authMiddleware, tripController.calculateTrip);

// Trip list and detail endpoints under /api/trips
router.get("/trips", authMiddleware, tripController.listTrips);
router.get("/trips/:id", authMiddleware, tripController.getTrip);
router.get("/trips/:id/route", authMiddleware, tripController.getTripRoute);
router.get("/trips/:id/logs", authMiddleware, tripController.getTripLogs);
router.post("/trips", authMiddleware, tripController.createTrip);

module.exports = router;
