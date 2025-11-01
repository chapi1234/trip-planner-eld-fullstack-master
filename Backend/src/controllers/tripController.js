const asyncHandler = require("express-async-handler");
const Trip = require("../models/Trip");

// Very small mock calculation for demo purposes
function mockCalculate(data) {
  // Compute a fake distance based on string lengths (placeholder)
  const base =
    (data.current_location?.length || 10) +
    (data.pickup_location?.length || 10) +
    (data.dropoff_location?.length || 10);
  const total_distance = Math.min(2000, Math.max(50, Math.round(base * 2)));
  const estimated_drive_time = Math.round(total_distance / 50); // hours
  const total_trip_time = estimated_drive_time + 2; // +2 hours for pickup/dropoff
  const fuel_stops = Math.max(0, Math.floor(total_distance / 1000));
  const rest_stops = Math.max(0, Math.floor(estimated_drive_time / 8));

  // generate a few route points
  const route_points = [
    {
      id: 1,
      point_type: "start",
      latitude: 0,
      longitude: 0,
      address: data.current_location || "",
      sequence: 1,
      duration_minutes: 0,
      estimated_arrival: new Date().toISOString(),
    },
    {
      id: 2,
      point_type: "pickup",
      latitude: 0,
      longitude: 0,
      address: data.pickup_location || "",
      sequence: 2,
      duration_minutes: 60,
    },
    {
      id: 3,
      point_type: "dropoff",
      latitude: 0,
      longitude: 0,
      address: data.dropoff_location || "",
      sequence: 3,
      duration_minutes: 60,
    },
  ];

  return {
    total_distance,
    estimated_drive_time,
    total_trip_time,
    fuel_stops,
    rest_stops,
    route_points,
    eld_logs_needed: Math.max(0, Math.ceil(total_trip_time / 24)),
    message: "Calculation complete",
  };
}

exports.calculateTrip = asyncHandler(async (req, res) => {
  const data = req.body;
  if (!data) return res.status(400).json({ message: "Invalid data" });

  const result = mockCalculate(data);

  // If user is authenticated, create a Trip record; otherwise return calculation result only
  if (req.user) {
    // sanitize route_points: remove any provided `id` property so Mongoose doesn't try to set subdocument _id
    const sanitizedRoutePoints = (result.route_points || []).map((p) => {
      const rp = { ...p };
      if (Object.prototype.hasOwnProperty.call(rp, 'id')) delete rp.id;
      if (Object.prototype.hasOwnProperty.call(rp, '_id')) delete rp._id;
      return rp;
    });

    const trip = await Trip.create({
      user: req.user._id,
      current_location: data.current_location,
      pickup_location: data.pickup_location,
      dropoff_location: data.dropoff_location,
      current_cycle_used: data.current_cycle_used,
      total_distance: result.total_distance,
      estimated_drive_time: result.estimated_drive_time,
      total_trip_time: result.total_trip_time,
      fuel_stops: result.fuel_stops,
      rest_stops: result.rest_stops,
      route_points: sanitizedRoutePoints,
      eld_logs: [],
    });

    return res.json({ trip_id: trip._id, ...result });
  }

  res.json({ trip_id: null, ...result });
});

exports.listTrips = asyncHandler(async (req, res) => {
  const trips = await Trip.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(trips);
});

// Create a trip explicitly (used when frontend calculated locally and wants to save)
exports.createTrip = asyncHandler(async (req, res) => {
  const data = req.body;
  if (!data) return res.status(400).json({ message: 'No trip data provided' });

  const trip = await Trip.create({
    user: req.user._id,
    current_location: data.current_location || data.inputData?.currentLocation,
    pickup_location: data.pickup_location || data.inputData?.pickupLocation,
    dropoff_location: data.dropoff_location || data.inputData?.dropoffLocation,
    current_cycle_used: data.current_cycle_used || data.inputData?.currentCycleUsed || 0,
    total_distance: data.total_distance || data.totalDistance || 0,
    estimated_drive_time: data.estimated_drive_time || data.totalDrivingHours || 0,
    total_trip_time: data.total_trip_time || data.totalOnDutyHours || 0,
    fuel_stops: data.fuel_stops || 0,
    rest_stops: data.rest_stops || 0,
    status: data.status || 'saved',
    route_points: (data.route_points || []).map((p) => {
      const copy = { ...p };
      if (copy.id !== undefined) delete copy.id;
      return copy;
    }),
    eld_logs: data.eld_logs || [],
  });

  res.status(201).json(trip);
});

exports.getTrip = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const trip = await Trip.findOne({ _id: id, user: req.user._id });
  if (!trip) return res.status(404).json({ message: "Trip not found" });
  res.json(trip);
});

exports.getTripRoute = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const trip = await Trip.findOne({ _id: id, user: req.user._id }).select("total_distance route_points");
  if (!trip) return res.status(404).json({ message: "Trip not found" });
  res.json({ trip_id: trip._id, total_distance: trip.total_distance, route_points: trip.route_points });
});

exports.getTripLogs = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const trip = await Trip.findOne({ _id: id, user: req.user._id }).select("eld_logs");
  if (!trip) return res.status(404).json({ message: "Trip not found" });
  res.json(trip.eld_logs || []);
});
