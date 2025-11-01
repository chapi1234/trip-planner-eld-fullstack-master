import React, { useState } from "react";
import { LoginPage } from "./components/LoginPage";
import { Dashboard } from "./components/Dashboard";
import { TripInputForm } from "./components/TripInputForm";
import { ResultsPage } from "./components/ResultsPage";
import { PastTripsPage } from "./components/PastTripsPage";
import { ProfilePage } from "./components/ProfilePage";
import { calculateTrip, calculateTripLocal } from "./components/TripCalculator";
import { ELDLogTest } from "./components/ELDLogTest";
import { User as ApiUser } from "./services/api";

type Page =
  | "login"
  | "dashboard"
  | "trip-input"
  | "results"
  | "past-trips"
  | "profile"
  | "eld-test";

// Local user shape used by UI components (derived from API user)
interface User {
  id: string;
  email: string;
  name: string;
  currentCycleUsed: number;
}

function mapApiUserToLocal(u: ApiUser | null): User | null {
  if (!u) return null;
  const name = `${u.first_name || ""} ${u.last_name || ""}`.trim();
  return {
    id: String(u.id || u.username || u.email),
    email: u.email,
    name: name || (u.username as any) || u.email,
    currentCycleUsed: Number((u as any).current_cycle_used || 0),
  };
}

function mapServerTripToTripResult(s: any): TripResult {
  const totalDistance = s.total_distance || s.totalDistance || 0;
  const totalDrivingHours = s.estimated_drive_time || s.estimated_drive_time || s.totalDrivingHours || 0;
  const totalOnDutyHours = s.total_trip_time || s.total_trip_time || s.totalOnDutyHours || totalDrivingHours + 2;

  const inputData: TripInputData = {
    currentLocation: s.current_location || (s.inputData && s.inputData.currentLocation) || '',
    pickupLocation: s.pickup_location || (s.inputData && s.inputData.pickupLocation) || '',
    dropoffLocation: s.dropoff_location || (s.inputData && s.inputData.dropoffLocation) || '',
    currentCycleUsed: s.current_cycle_used || (s.inputData && s.inputData.currentCycleUsed) || 0,
    useSleeperBerth: (s.inputData && s.inputData.useSleeperBerth) || false,
    includeFuelStops: (s.inputData && s.inputData.includeFuelStops) || false,
  };

  const stops = (s.route_points || []).map((rp: any, idx: number) => ({
    id: String(rp._id || rp.id || idx + 1),
    type: rp.point_type || 'start',
    location: rp.address || rp.location || '',
    time: rp.estimated_arrival || rp.time || '06:00',
    duration: rp.duration_minutes || rp.duration || 0,
    description: rp.description || '',
    mileage: Math.floor((totalDistance / Math.max(1, (s.route_points || []).length)) * idx),
  }));

  return {
    id: String(s._id || s.id || Date.now()),
    date: new Date(s.created_at || s.createdAt || Date.now()).toISOString().split('T')[0],
    route: `${inputData.currentLocation} → ${inputData.pickupLocation} → ${inputData.dropoffLocation}`,
    totalDistance,
    totalDrivingHours,
    totalOnDutyHours,
    isCompliant: true,
    remainingCycle: Math.max(0, 70 - ((s.current_cycle_used || 0) + totalOnDutyHours)),
    inputData,
    stops,
    dailyLogs: s.eld_logs || [],
    complianceIssues: s.complianceIssues || [],
  };
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

export default function App() {
  const [currentPage, setCurrentPage] = useState("login" as Page);
  const [apiUser, setApiUser] = useState(null as ApiUser | null);
  const [currentTripData, setCurrentTripData] = useState(null as TripInputData | null);
  const [currentTripResult, setCurrentTripResult] = useState(null as TripResult | null);
  const [pastTrips, setPastTrips] = useState([
    {
      id: "1",
      date: "2024-12-15",
      route: "Dallas, TX → Phoenix, AZ",
      totalDistance: 887,
      totalDrivingHours: 10.5,
      totalOnDutyHours: 13.5,
      isCompliant: true,
      remainingCycle: 59.5,
      stops: [],
      dailyLogs: [],
      complianceIssues: [],
      inputData: {
        currentLocation: "Dallas, TX",
        pickupLocation: "Dallas, TX",
        dropoffLocation: "Phoenix, AZ",
        currentCycleUsed: 10.5,
        useSleeperBerth: true,
        includeFuelStops: true,
      },
    },
    {
      id: "2",
      date: "2024-12-10",
      route: "Atlanta, GA → Miami, FL",
      totalDistance: 662,
      totalDrivingHours: 8.5,
      totalOnDutyHours: 11.0,
      isCompliant: true,
      remainingCycle: 61.5,
      stops: [],
      dailyLogs: [],
      complianceIssues: [],
      inputData: {
        currentLocation: "Atlanta, GA",
        pickupLocation: "Atlanta, GA",
        dropoffLocation: "Miami, FL",
        currentCycleUsed: 8.5,
        useSleeperBerth: false,
        includeFuelStops: true,
      },
    },
  ]);

  const handleLogin = (user: ApiUser) => {
    setApiUser(user);
    // fetch user's saved trips
    (async () => {
      try {
        const trips = await (await import("./services/api")).apiService.getTrips();
        setPastTrips((trips as any[]).map(mapServerTripToTripResult));
      } catch (err) {
        console.warn('Failed to load saved trips', err);
      }
    })();
    setCurrentPage("dashboard");
  };

  const handleSignup = (user: ApiUser) => {
    setApiUser(user);
    // after signup, fetch trips (likely empty) and go to dashboard
    (async () => {
      try {
        const trips = await (await import("./services/api")).apiService.getTrips();
        setPastTrips((trips as any[]).map(mapServerTripToTripResult));
      } catch (err) {
        console.warn('Failed to load saved trips', err);
      }
    })();
    setCurrentPage("dashboard");
  };

  // On mount, try to restore session and load user + trips
  React.useEffect(() => {
    (async () => {
      try {
        const meResp = await (await import("./services/api")).apiService.getCurrentUser();
        if (meResp?.user) {
          setApiUser(meResp.user);
          try {
            const trips = await (await import("./services/api")).apiService.getTrips();
            setPastTrips((trips as any[]).map(mapServerTripToTripResult));
          } catch (err) {
            console.warn('Failed to load saved trips on startup', err);
          }
          setCurrentPage('dashboard');
        }
      } catch (e) {
        // no session
      }
    })();
  }, []);

  const handleLogout = () => {
    setApiUser(null);
    setCurrentPage("login");
    setCurrentTripData(null);
    setCurrentTripResult(null);
  };

  const handleTripSubmit = async (tripData: TripInputData) => {
    setCurrentTripData(tripData);

    try {
      // Use the API calculation function
      const result = await calculateTrip(tripData);
      setCurrentTripResult(result);
      setCurrentPage("results");
      // Auto-save generated trip when user is authenticated
      if (apiUser) {
        (async () => {
          try {
            // If the calculation endpoint already created a trip, response id will be a server id.
            // In that case fetch the saved trip instead of creating a duplicate.
            const oidRegex = /^[0-9a-fA-F]{24}$/;
            if (result.id && oidRegex.test(result.id)) {
                try {
                const serverTrip = await (await import("./services/api")).apiService.getTrip(Number(result.id) as any);
                setPastTrips((prev: TripResult[]) => [mapServerTripToTripResult(serverTrip), ...prev]);
                return;
              } catch (e) {
                // if fetching fails, fall back to attempting to save below
                console.warn('Failed to fetch server trip after calculate, will try to create one', e);
              }
            }

            // Otherwise create (save) the trip on the server
            const payload = {
              current_location: result.inputData.currentLocation,
              pickup_location: result.inputData.pickupLocation,
              dropoff_location: result.inputData.dropoffLocation,
              current_cycle_used: result.inputData.currentCycleUsed,
              total_distance: result.totalDistance,
              estimated_drive_time: result.totalDrivingHours,
              total_trip_time: result.totalOnDutyHours,
              route_points: result.stops.map((s: any, idx: number) => ({
                id: idx + 1,
                point_type: s.type,
                address: s.location,
                sequence: idx + 1,
                duration_minutes: s.duration || 0,
              })),
            };

            const saved = await (await import("./services/api")).apiService.saveTrip(payload);
            // normalize and add saved trip
            setPastTrips((prev: TripResult[]) => [mapServerTripToTripResult(saved), ...prev]);
          } catch (err) {
            console.warn('Auto-save of generated trip failed', err);
          }
        })();
      }
    } catch (error) {
      console.error("Trip calculation failed:", error);
      // Fallback to local calculation if API fails
      const result = calculateTripLocal(tripData);
      setCurrentTripResult(result);
      setCurrentPage("results");
    }
  };

  const handleSaveTrip = () => {
    if (!currentTripResult) return;

    // Try to persist the trip to backend when user is authenticated
    (async () => {
      try {
        const payload = {
          current_location: currentTripResult.inputData.currentLocation,
          pickup_location: currentTripResult.inputData.pickupLocation,
          dropoff_location: currentTripResult.inputData.dropoffLocation,
          current_cycle_used: currentTripResult.inputData.currentCycleUsed,
          total_distance: currentTripResult.totalDistance,
          estimated_drive_time: currentTripResult.totalDrivingHours,
          total_trip_time: currentTripResult.totalOnDutyHours,
          route_points: currentTripResult.stops.map((s: any) => ({
            point_type: s.type,
            address: s.location,
            duration_minutes: s.duration,
          })),
        };

  const saved = await (await import("./services/api")).apiService.saveTrip(payload);
  // normalize saved trip and update local list
  setPastTrips((prev: TripResult[]) => [mapServerTripToTripResult(saved), ...prev]);
      } catch (err) {
        // If saving fails (not authenticated or server error), fall back to local save
        console.warn("Saving trip to server failed, falling back to local list", err);
        setPastTrips((prev: TripResult[]) => [currentTripResult, ...prev]);
      }
    })();
  };

  const navigateTo = (page: string) => {
    // accept plain strings from child components
    setCurrentPage(page as Page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "login":
        return <LoginPage onLogin={handleLogin} onSignup={handleSignup} />;
      case "dashboard":
        return (
          <Dashboard
            user={mapApiUserToLocal(apiUser)!}
            onNavigate={navigateTo}
            pastTripsCount={pastTrips.length}
            hasRecentTrip={currentTripResult !== null}
          />
        );
      case "trip-input":
        return (
          <TripInputForm
            user={mapApiUserToLocal(apiUser)!}
            onSubmit={handleTripSubmit}
            onNavigate={navigateTo}
          />
        );
      case "results":
        return (
          <ResultsPage
            user={mapApiUserToLocal(apiUser)!}
            tripResult={currentTripResult!}
            onNavigate={navigateTo}
            onSaveTrip={handleSaveTrip}
          />
        );
      case "past-trips":
        return (
          <PastTripsPage
            user={mapApiUserToLocal(apiUser)!}
            trips={pastTrips}
            onNavigate={navigateTo}
            onViewTrip={(trip) => {
              setCurrentTripResult(trip);
              setCurrentPage("results");
            }}
          />
        );
      case "profile":
        return (
          <ProfilePage
            user={mapApiUserToLocal(apiUser)!}
            onNavigate={navigateTo}
            onUpdateUser={(u: User | null) => {
              // when profile updates, reflect into apiUser minimally
              if (!u) {
                setApiUser(null);
                return;
              }
                      setApiUser((prev: ApiUser | null) => {
                        if (!prev) return {
                          id: Number(u.id || 0),
                          username: u.email,
                          email: u.email,
                          first_name: u.name.split(" ")[0] || "",
                          last_name: u.name.split(" ").slice(1).join(" ") || "",
                          current_cycle_used: u.currentCycleUsed,
                        } as ApiUser;
                        return {
                          ...prev,
                          email: u.email,
                          first_name: u.name.split(" ")[0] || prev.first_name,
                          last_name: u.name.split(" ").slice(1).join(" ") || prev.last_name,
                          current_cycle_used: u.currentCycleUsed,
                        } as ApiUser;
                      });
            }}
          />
        );
      case "eld-test":
        return (
          <ELDLogTest tripResult={currentTripResult} onNavigate={navigateTo} />
        );
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="size-full min-h-screen bg-background">
      {renderCurrentPage()}
    </div>
  );
}
