import React, { useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Settings,
  AlertCircle,
  Truck,
  Navigation,
  Fuel,
  CheckCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { Alert, AlertDescription } from "./ui/alert";
import { calculateTrip } from "./TripCalculator";

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

interface TripInputFormProps {
  user: User;
  onSubmit: (data: TripInputData) => void;
  onNavigate: (page: string) => void;
}

export function TripInputForm({
  user,
  onSubmit,
  onNavigate,
}: TripInputFormProps) {
  const [formData, setFormData] = useState<TripInputData>({
    currentLocation: "",
    pickupLocation: "",
    dropoffLocation: "",
    currentCycleUsed: user.currentCycleUsed,
    useSleeperBerth: false,
    includeFuelStops: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentLocation.trim()) {
      newErrors.currentLocation = "Current location is required";
    }
    if (!formData.pickupLocation.trim()) {
      newErrors.pickupLocation = "Pickup location is required";
    }
    if (!formData.dropoffLocation.trim()) {
      newErrors.dropoffLocation = "Drop-off location is required";
    }
    if (formData.currentCycleUsed < 0 || formData.currentCycleUsed > 70) {
      newErrors.currentCycleUsed = "Cycle hours must be between 0 and 70";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Pass data to parent component to handle API call
      onSubmit(formData);
    } catch (error) {
      console.error("Trip calculation failed:", error);
      alert("Failed to calculate trip. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: keyof TripInputData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const remainingCycleHours = 70 - formData.currentCycleUsed;
  const isNearLimit = formData.currentCycleUsed > 60;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="highway-gradient border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("dashboard")}
              className="mr-4 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Navigation className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Plan New Trip</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Trip Locations */}
          <Card className="card-highway">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg highway-gradient flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span>Trip Locations</span>
              </CardTitle>
              <CardDescription>
                Enter your current location, pickup point, and destination
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-location">Current Location</Label>
                <Input
                  id="current-location"
                  placeholder="e.g., Dallas, TX or 123 Main St, Dallas, TX"
                  value={formData.currentLocation}
                  onChange={(e) =>
                    updateFormData("currentLocation", e.target.value)
                  }
                  className={errors.currentLocation ? "border-red-500" : ""}
                />
                {errors.currentLocation && (
                  <p className="text-sm text-red-500">
                    {errors.currentLocation}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickup-location">Pickup Location</Label>
                <Input
                  id="pickup-location"
                  placeholder="e.g., Phoenix, AZ or Warehouse, 456 Industrial Blvd"
                  value={formData.pickupLocation}
                  onChange={(e) =>
                    updateFormData("pickupLocation", e.target.value)
                  }
                  className={errors.pickupLocation ? "border-red-500" : ""}
                />
                {errors.pickupLocation && (
                  <p className="text-sm text-red-500">
                    {errors.pickupLocation}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dropoff-location">Drop-off Location</Label>
                <Input
                  id="dropoff-location"
                  placeholder="e.g., Los Angeles, CA or Customer Site, 789 Commerce St"
                  value={formData.dropoffLocation}
                  onChange={(e) =>
                    updateFormData("dropoffLocation", e.target.value)
                  }
                  className={errors.dropoffLocation ? "border-red-500" : ""}
                />
                {errors.dropoffLocation && (
                  <p className="text-sm text-red-500">
                    {errors.dropoffLocation}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Current Cycle Hours */}
          <Card className="card-highway">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg highway-gradient flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <span>Current Cycle Hours</span>
              </CardTitle>
              <CardDescription>
                How many hours have you used in your current 8-day cycle?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Hours Used: {formData.currentCycleUsed} / 70</Label>
                  <span className="text-sm text-muted-foreground">
                    {remainingCycleHours} hours remaining
                  </span>
                </div>
                <Slider
                  value={[formData.currentCycleUsed]}
                  onValueChange={(value) =>
                    updateFormData("currentCycleUsed", value[0])
                  }
                  max={70}
                  min={0}
                  step={0.5}
                  className="w-full"
                />
                {errors.currentCycleUsed && (
                  <p className="text-sm text-red-500">
                    {errors.currentCycleUsed}
                  </p>
                )}
              </div>

              {isNearLimit && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You're approaching your 70-hour limit. Consider a 34-hour
                    restart if needed.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Trip Options */}
          <Card className="card-highway">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg highway-gradient flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <span>Trip Options</span>
              </CardTitle>
              <CardDescription>
                Configure additional options for your trip planning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Use Sleeper Berth Provisions</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable split sleeper berth for flexible rest periods (7+3 or
                    8+2 hours)
                  </p>
                </div>
                <Switch
                  checked={formData.useSleeperBerth}
                  onCheckedChange={(checked) =>
                    updateFormData("useSleeperBerth", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Include Fuel Stops</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically add fuel stops every 1,000 miles (recommended)
                  </p>
                </div>
                <Switch
                  checked={formData.includeFuelStops}
                  onCheckedChange={(checked) =>
                    updateFormData("includeFuelStops", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Assumptions */}
          <Card className="card-highway border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span>Planning Assumptions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <h4 className="font-medium mb-3 flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-primary" />
                  <span>This trip planner assumes:</span>
                </h4>
                <ul className="text-sm space-y-2 grid gap-1">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Property-carrying driver under 70-hour/8-day cycle
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>No adverse driving conditions</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>1 hour each for pickup and drop-off activities</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      30-minute rest break required after 8 cumulative driving
                      hours
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      10 consecutive hours off-duty required for daily reset
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      11-hour daily driving limit and 14-hour driving window
                    </span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              type="button"
              className="btn-secondary-highway w-full sm:w-auto"
              onClick={() => onNavigate("dashboard")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-highway w-full sm:w-auto text-lg px-8 py-3 h-auto"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Generating Route...
                </>
              ) : (
                <>
                  <Navigation className="w-5 h-5 mr-2" />
                  Generate Route & Logs
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Mobile spacing */}
        <div className="h-20 md:hidden"></div>
      </main>
    </div>
  );
}
