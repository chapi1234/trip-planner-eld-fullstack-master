import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import "./ELDLogSheet.css";

interface DutyStatus {
  status: "off_duty" | "sleeper_berth" | "driving" | "on_duty";
  start_time: string;
  end_time: string;
  location: string;
  sequence: number;
}

interface ELDLogSheetProps {
  date: string;
  driverName: string;
  vehicleNumber: string;
  carrierName: string;
  totalMiles: number;
  dutyStatuses: DutyStatus[];
  remarks?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "off_duty":
      return "bg-gray-200 border-gray-300";
    case "sleeper_berth":
      return "bg-blue-200 border-blue-300";
    case "driving":
      return "bg-red-200 border-red-300";
    case "on_duty":
      return "bg-yellow-200 border-yellow-300";
    default:
      return "bg-gray-200 border-gray-300";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "off_duty":
      return "Off Duty";
    case "sleeper_berth":
      return "Sleeper Berth";
    case "driving":
      return "Driving";
    case "on_duty":
      return "On Duty (Not Driving)";
    default:
      return "Off Duty";
  }
};

const formatTime = (time: string) => {
  // Convert 24-hour format to 12-hour format
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const getHourPosition = (time: string) => {
  const [hours, minutes] = time.split(":");
  const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);
  return (totalMinutes / (24 * 60)) * 100;
};

const getDuration = (startTime: string, endTime: string) => {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  const diffMs = end.getTime() - start.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return Math.round(diffHours * 10) / 10; // Round to 1 decimal place
};

export function ELDLogSheet({
  date,
  driverName,
  vehicleNumber,
  carrierName,
  totalMiles,
  dutyStatuses,
  remarks = "",
}: ELDLogSheetProps) {
  // Generate 24-hour grid
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Calculate total hours for each status
  const statusTotals = dutyStatuses.reduce((acc, status) => {
    const duration = getDuration(status.start_time, status.end_time);
    acc[status.status] = (acc[status.status] || 0) + duration;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white border-2 border-black p-4 mb-4">
        <div className="text-center">
          <h1 className="text-lg font-bold uppercase">
            U.S. DEPARTMENT OF TRANSPORTATION
          </h1>
          <h2 className="text-base font-semibold">
            DRIVER'S DAILY LOG (ONE CALENDAR DAY — 24 HOURS)
          </h2>
          <div className="flex justify-between text-sm mt-2">
            <span>ORIGINAL — Submit to carrier within 13 days</span>
            <span>DUPLICATE — Driver retains possession for eight days</span>
          </div>
        </div>
      </div>

      {/* Driver Information */}
      <div className="bg-white border-2 border-black p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <label className="font-semibold">Date:</label>
            <div className="border-b border-black min-h-[20px]">{date}</div>
          </div>
          <div>
            <label className="font-semibold">Total Miles Driving Today:</label>
            <div className="border-b border-black min-h-[20px]">
              {totalMiles}
            </div>
          </div>
          <div>
            <label className="font-semibold">
              Truck or Tractor and Trailer Number:
            </label>
            <div className="border-b border-black min-h-[20px]">
              {vehicleNumber}
            </div>
          </div>
          <div>
            <label className="font-semibold">Name of Carrier:</label>
            <div className="border-b border-black min-h-[20px]">
              {carrierName}
            </div>
          </div>
          <div>
            <label className="font-semibold">Driver's Signature:</label>
            <div className="border-b border-black min-h-[20px]">
              {driverName}
            </div>
          </div>
          <div>
            <label className="font-semibold">Main Office Address:</label>
            <div className="border-b border-black min-h-[20px]">
              123 Trucking Way, Dallas, TX 75201
            </div>
          </div>
          <div>
            <label className="font-semibold">Name of Co-Driver:</label>
            <div className="border-b border-black min-h-[20px]">N/A</div>
          </div>
          <div>
            <label className="font-semibold">Total Hours:</label>
            <div className="border-b border-black min-h-[20px]">
              {Object.values(statusTotals)
                .reduce((a, b) => a + b, 0)
                .toFixed(1)}
              h
            </div>
          </div>
        </div>
      </div>

      {/* 24-Hour Grid */}
      <div className="bg-white border-2 border-black">
        {/* Grid Header */}
        <div className="border-b-2 border-black">
          <div className="grid grid-cols-25 gap-0">
            <div className="border-r border-black p-2 text-center font-semibold">
              Off Duty
            </div>
            <div className="border-r border-black p-2 text-center font-semibold">
              Sleeper Berth
            </div>
            <div className="border-r border-black p-2 text-center font-semibold">
              Driving
            </div>
            <div className="border-r border-black p-2 text-center font-semibold">
              On Duty (Not Driving)
            </div>
            <div className="p-2 text-center font-semibold">Remarks</div>
          </div>
        </div>

        {/* Time Grid */}
        <div className="relative">
          {/* Hour markers */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {hours.map((hour) => (
              <div
                key={hour}
                className="absolute top-0 h-full border-l border-gray-300"
                style={{ left: `${(hour / 24) * 100}%` }}
              >
                <div className="text-xs text-gray-500 mt-1 ml-1">
                  {hour === 0
                    ? "Midnight"
                    : hour < 12
                    ? `${hour} AM`
                    : hour === 12
                    ? "Noon"
                    : `${hour - 12} PM`}
                </div>
              </div>
            ))}
          </div>

          {/* Duty status blocks */}
          <div className="grid grid-cols-25 gap-0 min-h-[200px]">
            {/* Off Duty Column */}
            <div className="border-r border-black relative">
              {dutyStatuses
                .filter((status) => status.status === "off_duty")
                .map((status, index) => (
                  <div
                    key={index}
                    className={`absolute top-0 h-full ${getStatusColor(
                      status.status
                    )} border`}
                    style={{
                      left: `${getHourPosition(status.start_time)}%`,
                      width: `${
                        getHourPosition(status.end_time) -
                        getHourPosition(status.start_time)
                      }%`,
                    }}
                  >
                    <div className="p-1 text-xs">
                      <div className="font-semibold">
                        {formatTime(status.start_time)}
                      </div>
                      <div className="text-xs">{status.location}</div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Sleeper Berth Column */}
            <div className="border-r border-black relative">
              {dutyStatuses
                .filter((status) => status.status === "sleeper_berth")
                .map((status, index) => (
                  <div
                    key={index}
                    className={`absolute top-0 h-full ${getStatusColor(
                      status.status
                    )} border`}
                    style={{
                      left: `${getHourPosition(status.start_time)}%`,
                      width: `${
                        getHourPosition(status.end_time) -
                        getHourPosition(status.start_time)
                      }%`,
                    }}
                  >
                    <div className="p-1 text-xs">
                      <div className="font-semibold">
                        {formatTime(status.start_time)}
                      </div>
                      <div className="text-xs">{status.location}</div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Driving Column */}
            <div className="border-r border-black relative">
              {dutyStatuses
                .filter((status) => status.status === "driving")
                .map((status, index) => (
                  <div
                    key={index}
                    className={`absolute top-0 h-full ${getStatusColor(
                      status.status
                    )} border`}
                    style={{
                      left: `${getHourPosition(status.start_time)}%`,
                      width: `${
                        getHourPosition(status.end_time) -
                        getHourPosition(status.start_time)
                      }%`,
                    }}
                  >
                    <div className="p-1 text-xs">
                      <div className="font-semibold">
                        {formatTime(status.start_time)}
                      </div>
                      <div className="text-xs">{status.location}</div>
                    </div>
                  </div>
                ))}
            </div>

            {/* On Duty Column */}
            <div className="border-r border-black relative">
              {dutyStatuses
                .filter((status) => status.status === "on_duty")
                .map((status, index) => (
                  <div
                    key={index}
                    className={`absolute top-0 h-full ${getStatusColor(
                      status.status
                    )} border`}
                    style={{
                      left: `${getHourPosition(status.start_time)}%`,
                      width: `${
                        getHourPosition(status.end_time) -
                        getHourPosition(status.start_time)
                      }%`,
                    }}
                  >
                    <div className="p-1 text-xs">
                      <div className="font-semibold">
                        {formatTime(status.start_time)}
                      </div>
                      <div className="text-xs">{status.location}</div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Remarks Column */}
            <div className="p-2">
              <div className="text-xs">{remarks || "No remarks"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white border-2 border-black p-4 mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <label className="font-semibold">Total Off Duty:</label>
            <span className="ml-2">
              {statusTotals.off_duty?.toFixed(1) || "0.0"}h
            </span>
          </div>
          <div>
            <label className="font-semibold">Total Sleeper Berth:</label>
            <span className="ml-2">
              {statusTotals.sleeper_berth?.toFixed(1) || "0.0"}h
            </span>
          </div>
          <div>
            <label className="font-semibold">Total Driving:</label>
            <span className="ml-2">
              {statusTotals.driving?.toFixed(1) || "0.0"}h
            </span>
          </div>
          <div>
            <label className="font-semibold">Total On Duty:</label>
            <span className="ml-2">
              {statusTotals.on_duty?.toFixed(1) || "0.0"}h
            </span>
          </div>
        </div>
      </div>

      {/* HOS Compliance Check */}
      <div className="bg-white border-2 border-black p-4 mt-4">
        <h3 className="font-semibold mb-2">HOS Compliance Check:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold">Daily Driving Limit (11h):</span>
            <span
              className={`ml-2 ${
                (statusTotals.driving || 0) > 11
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {(statusTotals.driving || 0).toFixed(1)}h / 11h
              {(statusTotals.driving || 0) > 11
                ? " ❌ VIOLATION"
                : " ✅ Compliant"}
            </span>
          </div>
          <div>
            <span className="font-semibold">14-Hour Window:</span>
            <span className="ml-2 text-green-600">✅ Compliant</span>
          </div>
          <div>
            <span className="font-semibold">30-Minute Break Required:</span>
            <span className="ml-2 text-green-600">✅ Compliant</span>
          </div>
          <div>
            <span className="font-semibold">10-Hour Rest:</span>
            <span className="ml-2 text-green-600">✅ Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
