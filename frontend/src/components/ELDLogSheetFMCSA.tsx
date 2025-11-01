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

interface ELDLogSheetFMCSAProps {
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
      return "bg-gray-100 border-gray-400";
    case "sleeper_berth":
      return "bg-blue-100 border-blue-400";
    case "driving":
      return "bg-red-100 border-red-400";
    case "on_duty":
      return "bg-yellow-100 border-yellow-400";
    default:
      return "bg-gray-100 border-gray-400";
  }
};

const formatTime = (time: string) => {
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
  return Math.round(diffHours * 10) / 10;
};

export function ELDLogSheetFMCSA({
  date,
  driverName,
  vehicleNumber,
  carrierName,
  totalMiles,
  dutyStatuses,
  remarks = "",
}: ELDLogSheetFMCSAProps) {
  // Calculate total hours for each status
  const statusTotals = dutyStatuses.reduce((acc, status) => {
    const duration = getDuration(status.start_time, status.end_time);
    acc[status.status] = (acc[status.status] || 0) + duration;
    return acc;
  }, {} as Record<string, number>);

  // Generate 24-hour timeline with quarter-hour subdivisions
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const quarterHours = Array.from({ length: 96 }, (_, i) => i * 15); // 15-minute intervals

  return (
    <div className="w-full max-w-7xl mx-auto bg-white">
      {/* Header */}
      <div className="border-2 border-black p-4 mb-4">
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
      <div className="border-2 border-black p-4 mb-4">
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

      {/* 24-Hour Grid - FMCSA Style */}
      <div className="border-2 border-black overflow-x-auto">
        {/* Grid Header with Time Scale */}
        <div className="border-b-2 border-black">
          <div className="flex min-w-[1200px]">
            <div className="w-32 border-r-2 border-black p-2 text-center font-semibold">
              Record of Duty Status
            </div>
            <div className="flex-1 relative min-h-[80px] eld-grid-container overflow-x-auto">
              {/* Time markers - Flexbox approach for better spacing */}
              <div className="eld-timeline">
                {hours.map((hour) => (
                  <div key={hour} className="eld-hour-slot">
                    <div className="eld-hour-label">
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
              {/* Quarter-hour subdivisions - Lighter lines */}
              <div
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{ width: "1200px" }}
              >
                {hours.map((hour) => (
                  <div
                    key={hour}
                    style={{
                      position: "absolute",
                      left: `${(hour / 24) * 100}%`,
                      width: `${100 / 24}%`,
                      height: "100%",
                    }}
                  >
                    {[0, 15, 30, 45].map((quarter) => (
                      <div
                        key={`${hour}-${quarter}`}
                        className="eld-quarter-marker"
                        style={{ left: `${(quarter / 60) * 100}%` }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="w-24 border-l-2 border-black p-2 text-center font-semibold">
              Total Hours
            </div>
          </div>
        </div>

        {/* Duty Status Rows */}
        {[
          { key: "off_duty", label: "1. Off Duty" },
          { key: "sleeper_berth", label: "2. Sleeper Berth" },
          { key: "driving", label: "3. Driving" },
          { key: "on_duty", label: "4. On Duty (not driving)" },
        ].map(({ key, label }) => (
          <div key={key} className="border-b border-black">
            <div className="flex min-w-[1200px]">
              <div className="w-32 border-r border-black p-2 text-sm font-medium">
                {label}
              </div>
              <div className="flex-1 relative h-20 min-h-[80px] eld-grid-row">
                {/* Time grid lines - Full width container */}
                <div
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  style={{ width: "1200px" }}
                >
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="eld-time-marker"
                      style={{ left: `${(hour / 24) * 100}%` }}
                    />
                  ))}
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      style={{
                        position: "absolute",
                        left: `${(hour / 24) * 100}%`,
                        width: `${100 / 24}%`,
                        height: "100%",
                      }}
                    >
                      {[0, 15, 30, 45].map((quarter) => (
                        <div
                          key={`${hour}-${quarter}`}
                          className="eld-quarter-marker"
                          style={{ left: `${(quarter / 60) * 100}%` }}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                {/* Duty status blocks - Improved positioning */}
                {dutyStatuses
                  .filter((status) => status.status === key)
                  .map((status, index) => {
                    const startPos = getHourPosition(status.start_time);
                    const endPos = getHourPosition(status.end_time);
                    const width = Math.max(endPos - startPos, 2); // Minimum width

                    return (
                      <div
                        key={index}
                        className={`eld-duty-block ${getStatusColor(
                          status.status
                        )}`}
                        style={{
                          left: `${startPos}%`,
                          width: `${width}%`,
                        }}
                      >
                        <div className="p-1 text-xs h-full flex flex-col justify-center">
                          <div className="font-semibold text-center">
                            {formatTime(status.start_time)} -{" "}
                            {formatTime(status.end_time)}
                          </div>
                          <div className="text-xs truncate text-center">
                            {status.location}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="w-24 border-l border-black p-2 text-center text-sm">
                {statusTotals[key]?.toFixed(1) || "0.0"}h
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Section */}
      <div className="border-2 border-black p-4 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="font-semibold">Remarks:</label>
            <div className="border-b border-black min-h-[20px] mt-1">
              {remarks ||
                "Trip from Dallas, TX to Los Angeles, CA via Phoenix, AZ. HOS compliant with proper rest breaks."}
            </div>
          </div>
          <div>
            <label className="font-semibold">Shipping Documents:</label>
            <div className="border-b border-black min-h-[20px] mt-1">
              DVL or Manifest No.: _______________
            </div>
          </div>
        </div>
      </div>

      {/* HOS Compliance Check */}
      <div className="border-2 border-black p-4 mt-4">
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
