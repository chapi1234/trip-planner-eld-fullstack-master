const mongoose = require("mongoose");

const RoutePointSchema = new mongoose.Schema({
  point_type: String,
  latitude: Number,
  longitude: Number,
  address: String,
  sequence: Number,
  duration_minutes: Number,
  estimated_arrival: String,
});

const DutyStatusSchema = new mongoose.Schema({
  status: String,
  start_time: String,
  end_time: String,
  location: String,
  sequence: Number,
});

const ELDLogSchema = new mongoose.Schema({
  date: String,
  driver_name: String,
  carrier_name: String,
  vehicle_number: String,
  total_miles: Number,
  duty_statuses: [DutyStatusSchema],
});

const TripSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    current_location: String,
    pickup_location: String,
    dropoff_location: String,
    current_cycle_used: Number,
    total_distance: Number,
    estimated_drive_time: Number,
    total_trip_time: Number,
    fuel_stops: Number,
    rest_stops: Number,
    status: { type: String, default: "calculated" },
    route_points: [RoutePointSchema],
    eld_logs: [ELDLogSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", TripSchema);
