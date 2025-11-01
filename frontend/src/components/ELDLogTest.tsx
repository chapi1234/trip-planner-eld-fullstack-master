import React from "react";
import { ELDLogSheetFMCSA } from "./ELDLogSheetFMCSA";

interface ELDLogTestProps {
  tripResult?: any;
  onNavigate: (page: string) => void;
}

// Sample duty status data for testing (fallback when no trip data)
const sampleDutyStatuses = [
  {
    status: "off_duty" as const,
    start_time: "00:00",
    end_time: "06:00",
    location: "Home terminal",
    sequence: 1,
  },
  {
    status: "on_duty" as const,
    start_time: "06:00",
    end_time: "07:00",
    location: "Pre-trip inspection",
    sequence: 2,
  },
  {
    status: "driving" as const,
    start_time: "07:00",
    end_time: "11:00",
    location: "Dallas to Phoenix",
    sequence: 3,
  },
  {
    status: "on_duty" as const,
    start_time: "11:00",
    end_time: "12:00",
    location: "Pickup - Loading cargo",
    sequence: 4,
  },
  {
    status: "driving" as const,
    start_time: "12:00",
    end_time: "16:00",
    location: "Phoenix to Los Angeles",
    sequence: 5,
  },
  {
    status: "on_duty" as const,
    start_time: "16:00",
    end_time: "17:00",
    location: "Delivery - Unloading cargo",
    sequence: 6,
  },
  {
    status: "off_duty" as const,
    start_time: "17:00",
    end_time: "24:00",
    location: "Rest period",
    sequence: 7,
  },
];

export function ELDLogTest({ tripResult, onNavigate }: ELDLogTestProps) {
  // Use real trip data if available, otherwise show sample data
  const isRealTrip =
    tripResult && tripResult.dailyLogs && tripResult.dailyLogs.length > 0;

  if (!isRealTrip) {
    return (
      <div className="p-4">
        <div className="mb-6">
          <button
            onClick={() => onNavigate("dashboard")}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Dashboard
          </button>
          <h2 className="text-2xl font-bold mb-2">ELD Log Sheet Preview</h2>
          <p className="text-muted-foreground">
            This is a sample ELD log. Plan a trip to see your actual generated
            logs.
          </p>
        </div>
        <ELDLogSheetFMCSA
          date="12/06/2024"
          driverName="John Doe"
          vehicleNumber="Truck #101"
          carrierName="Example Trucking LLC"
          totalMiles={850}
          dutyStatuses={sampleDutyStatuses}
          remarks="Sample trip from Dallas, TX to Los Angeles, CA via Phoenix, AZ. HOS compliant with proper rest breaks."
        />
      </div>
    );
  }

  // Show real trip ELD logs
  return (
    <div className="p-4">
      <div className="mb-6">
        <button
          onClick={() => onNavigate("dashboard")}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Dashboard
        </button>
        <h2 className="text-2xl font-bold mb-2">Your Trip ELD Logs</h2>
        <p className="text-muted-foreground">
          Generated ELD logs for your planned trip from{" "}
          {tripResult.inputData?.currentLocation} to{" "}
          {tripResult.inputData?.dropoffLocation}
        </p>
      </div>

      {tripResult.dailyLogs.map((log: any, index: number) => (
        <div key={index} className="mb-8">
          <h3 className="text-lg font-semibold mb-4">
            Day {index + 1} - {log.date}
          </h3>
          <ELDLogSheetFMCSA
            date={log.date}
            driverName={log.driverName || "Driver"}
            vehicleNumber={log.vehicleNumber || "Truck #001"}
            carrierName={log.carrierName || "Your Company"}
            totalMiles={log.totalMiles || 0}
            dutyStatuses={log.dutyStatuses || []}
            remarks={
              log.remarks ||
              `Day ${index + 1} of trip from ${
                tripResult.inputData?.currentLocation
              } to ${tripResult.inputData?.dropoffLocation}`
            }
          />
        </div>
      ))}
    </div>
  );
}
