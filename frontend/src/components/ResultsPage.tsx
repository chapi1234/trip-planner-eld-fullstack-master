import React, { useState } from "react";
import {
  ArrowLeft,
  Map,
  FileText,
  Download,
  Save,
  Edit,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Clock,
  Fuel,
  Bed,
  Truck,
  Navigation,
  Route,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { LeafletMap } from "./LeafletMap";
import { ELDLogSheetFMCSA } from "./ELDLogSheetFMCSA";

interface User {
  id: string;
  email: string;
  name: string;
  currentCycleUsed: number;
}

interface TripInputData {
  currentLocation: string;
  pickupLocation: string;
  dropoffLocation: string;
  currentCycleUsed: number;
  useSleeperBerth: boolean;
  includeFuelStops: boolean;
}

interface TripResult {
  id: string;
  date: string;
  route: string;
  totalDistance: number;
  totalDrivingHours: number;
  totalOnDutyHours: number;
  isCompliant: boolean;
  remainingCycle: number;
  inputData: TripInputData;
  stops: any[];
  dailyLogs: any[];
  complianceIssues: string[];
}

interface ResultsPageProps {
  user: User;
  tripResult: TripResult;
  onNavigate: (page: string) => void;
  onSaveTrip: () => void;
}

export function ResultsPage({
  user,
  tripResult,
  onNavigate,
  onSaveTrip,
}: ResultsPageProps) {
  const [activeTab, setActiveTab] = useState<"map" | "logs">("map");

  // Use calculated stops from trip result, fallback to mock data if not available
  const routeStops =
    tripResult.stops && tripResult.stops.length > 0
      ? tripResult.stops
      : [
          {
            id: "1",
            type: "start" as const,
            location:
              tripResult.inputData?.currentLocation || "Current Location",
            time: "06:00",
            duration: 0,
            description: "Trip Start",
            mileage: 0,
          },
          {
            id: "2",
            type: "pickup" as const,
            location: tripResult.inputData?.pickupLocation || "Pickup Location",
            time: "08:30",
            duration: 60,
            description: "Pickup - 1 hour",
            mileage: 150,
          },
          {
            id: "3",
            type: "fuel" as const,
            location: "I-40 Rest Area, Mile 250",
            time: "11:45",
            duration: 30,
            description: "Fuel Stop",
            mileage: 250,
          },
          {
            id: "4",
            type: "dropoff" as const,
            location:
              tripResult.inputData?.dropoffLocation || "Dropoff Location",
            time: "15:00",
            duration: 60,
            description: "Delivery - 1 hour",
            mileage: tripResult.totalDistance,
          },
        ];

  const handleSaveTrip = () => {
    onSaveTrip();
    // Show success message or navigate
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="highway-gradient border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate("dashboard")}
                className="mr-4 text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Route className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold text-white">Trip Results</h1>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="btn-secondary-highway"
                disabled
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button
                size="sm"
                onClick={handleSaveTrip}
                className="btn-highway"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Trip
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Summary Stats */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 highway-gradient rounded-lg flex items-center justify-center mx-auto mb-2">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold">
                {tripResult.totalDrivingHours || 0}h
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                Total Driving
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {tripResult.totalDistance || 0} mi
              </div>
              <div className="text-sm text-muted-foreground">
                Total Distance
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {tripResult.totalOnDutyHours ||
                  (tripResult.totalDrivingHours || 0) + 2}
                h
              </div>
              <div className="text-sm text-muted-foreground">Total On-Duty</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {tripResult.remainingCycle?.toFixed(1) || "0.0"}h
              </div>
              <div className="text-sm text-muted-foreground">
                Remaining Cycle
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2">
                {tripResult.isCompliant !== false ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                )}
                <Badge
                  variant={
                    tripResult.isCompliant !== false ? "default" : "destructive"
                  }
                  className={
                    tripResult.isCompliant !== false
                      ? "bg-green-100 text-green-800"
                      : ""
                  }
                >
                  {tripResult.isCompliant !== false
                    ? "Compliant"
                    : "Non-Compliant"}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">HOS Status</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "map"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("map")}
            >
              <Map className="w-4 h-4 inline mr-2" />
              Route Map
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "logs"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("logs")}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              ELD Logs
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Route Info Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Route Information</CardTitle>
                <CardDescription>
                  {tripResult.route || "Route information not available"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {routeStops.map((stop, index) => (
                    <div key={stop.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {stop.type === "start" && (
                          <MapPin className="w-4 h-4 text-blue-500" />
                        )}
                        {stop.type === "pickup" && (
                          <MapPin className="w-4 h-4 text-green-500" />
                        )}
                        {stop.type === "dropoff" && (
                          <MapPin className="w-4 h-4 text-red-500" />
                        )}
                        {stop.type === "fuel" && (
                          <Fuel className="w-4 h-4 text-orange-500" />
                        )}
                        {stop.type === "rest" && (
                          <Clock className="w-4 h-4 text-purple-500" />
                        )}
                        {stop.type === "sleeper" && (
                          <Bed className="w-4 h-4 text-indigo-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {stop.time}
                          </p>
                          {stop.duration > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {stop.duration >= 60
                                ? `${Math.floor(stop.duration / 60)}h`
                                : `${stop.duration}m`}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {stop.location}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {stop.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {activeTab === "map" && (
              <LeafletMap
                stops={routeStops}
                totalDistance={tripResult.totalDistance}
              />
            )}

            {activeTab === "logs" && (
              <ELDLogSheetFMCSA
                date={new Date().toLocaleDateString()}
                driverName={user.name}
                vehicleNumber="Truck #101"
                carrierName="Example Trucking LLC"
                totalMiles={tripResult.totalDistance || 0}
                dutyStatuses={tripResult.dailyLogs || []}
                remarks="Trip from Dallas, TX to Los Angeles, CA via Phoenix, AZ"
              />
            )}
          </div>
        </div>

        {/* Actions */}
        {/* Compliance Issues */}
        {tripResult.complianceIssues &&
          tripResult.complianceIssues.length > 0 && (
            <Card className="mt-6 border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Compliance Issues</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {tripResult.complianceIssues.map((issue, index) => (
                    <li
                      key={index}
                      className="flex items-center space-x-2 text-red-600"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

        <div className="mt-6 flex justify-center space-x-4">
          <Button variant="outline" onClick={() => onNavigate("trip-input")}>
            Plan Another Trip
          </Button>
          <Button
            onClick={() => onNavigate("dashboard")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Return to Dashboard
          </Button>
        </div>

        {/* Mobile spacing */}
        <div className="h-20 md:hidden"></div>
      </main>
    </div>
  );
}
