import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, Fuel, Clock, Bed, Package } from "lucide-react";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface RouteStop {
  id: string;
  type: "start" | "pickup" | "dropoff" | "fuel" | "rest" | "sleeper";
  location: string;
  time: string;
  duration: number;
  description: string;
  mileage: number;
  coordinates?: [number, number]; // [lat, lng]
}

interface LeafletMapProps {
  stops: RouteStop[];
  totalDistance: number;
}

// Custom icons for different stop types
const createCustomIcon = (type: string, color: string) => {
  return L.divIcon({
    className: "custom-div-icon",
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        font-weight: bold;
        color: white;
        font-size: 12px;
      ">
        ${getStopSymbol(type)}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const getStopSymbol = (type: string): string => {
  switch (type) {
    case "start":
      return "🚛";
    case "pickup":
      return "📦";
    case "dropoff":
      return "🏁";
    case "fuel":
      return "⛽";
    case "rest":
      return "😴";
    case "sleeper":
      return "🛏️";
    default:
      return "📍";
  }
};

const getStopColor = (type: string): string => {
  switch (type) {
    case "start":
      return "#3b82f6"; // blue
    case "pickup":
      return "#10b981"; // green
    case "dropoff":
      return "#ef4444"; // red
    case "fuel":
      return "#f59e0b"; // orange
    case "rest":
      return "#8b5cf6"; // purple
    case "sleeper":
      return "#6366f1"; // indigo
    default:
      return "#6b7280"; // gray
  }
};

// Component to fit map bounds to show all markers
const MapBounds = ({ stops }: { stops: RouteStop[] }) => {
  const map = useMap();

  useEffect(() => {
    if (stops.length > 0) {
      const coordinates = stops
        .filter((stop) => stop.coordinates)
        .map((stop) => stop.coordinates!);

      if (coordinates.length > 0) {
        const bounds = L.latLngBounds(coordinates);
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [stops, map]);

  return null;
};

// Component to draw route polyline
const RoutePolyline = ({ stops }: { stops: RouteStop[] }) => {
  const coordinates = stops
    .filter((stop) => stop.coordinates)
    .map((stop) => stop.coordinates!);

  if (coordinates.length < 2) return null;

  return (
    <Polyline
      positions={coordinates}
      color="#3b82f6"
      weight={4}
      opacity={0.8}
      dashArray="5, 5"
    />
  );
};

export function LeafletMap({ stops, totalDistance }: LeafletMapProps) {
  const [selectedStop, setSelectedStop] = useState<RouteStop | null>(null);
  const [mapMode, setMapMode] = useState<"road" | "satellite">("road");

  // Add coordinates to stops (mock coordinates for demo)
  const getCoordinates = (location: string): [number, number] => {
    console.log("DEBUG: Getting coordinates for location:", location);

    const coords: { [key: string]: [number, number] } = {
      "dallas, tx": [32.7767, -96.797],
      "phoenix, az": [33.4484, -112.074],
      "phoenix, az dropoff": [33.4484, -112.074], // Added variant
      "atlanta, ga": [33.749, -84.388],
      "miami, fl": [25.7617, -80.1918],
      "chicago, il": [41.8781, -87.6298],
      "detroit, mi": [42.3314, -83.0458],
      "los angeles, ca": [34.0522, -118.2437],
      "los angeles": [34.0522, -118.2437], // Added variant
      "las vegas, nv": [36.1699, -115.1398],
      "new york, ny": [40.7128, -74.006],
      "philadelphia, pa": [39.9526, -75.1652],
      "houston, tx": [29.7604, -95.3698],
    };

    const key = location
      .toLowerCase()
      .replace(/[^a-z,\s]/g, "")
      .trim();

    console.log("DEBUG: Processed key:", key);
    console.log("DEBUG: Found coordinates:", coords[key] || "NOT FOUND");

    return coords[key] || [39.8283, -98.5795]; // Default to center of US
  };

  console.log("DEBUG: All stops received:", stops);

  const stopsWithCoords = stops.map((stop) => ({
    ...stop,
    coordinates: getCoordinates(stop.location),
  }));

  console.log("DEBUG: Stops with coordinates:", stopsWithCoords);

  const getStopIcon = (type: string) => {
    switch (type) {
      case "start":
        return <Navigation className="w-4 h-4 text-blue-500" />;
      case "pickup":
        return <Package className="w-4 h-4 text-green-500" />;
      case "dropoff":
        return <MapPin className="w-4 h-4 text-red-500" />;
      case "fuel":
        return <Fuel className="w-4 h-4 text-orange-500" />;
      case "rest":
        return <Clock className="w-4 h-4 text-purple-500" />;
      case "sleeper":
        return <Bed className="w-4 h-4 text-indigo-500" />;
      default:
        return <MapPin className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <div className="relative w-full h-96 bg-slate-100 dark:bg-slate-800 rounded-lg border overflow-hidden">
        <MapContainer
          center={[39.8283, -98.5795]}
          zoom={4}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            url={
              mapMode === "satellite"
                ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            }
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <MapBounds stops={stopsWithCoords} />
          <RoutePolyline stops={stopsWithCoords} />

          {stopsWithCoords.map((stop, index) => (
            <Marker
              key={stop.id}
              position={stop.coordinates!}
              icon={createCustomIcon(stop.type, getStopColor(stop.type))}
              eventHandlers={{
                click: () => setSelectedStop(stop),
              }}
            >
              <Popup>
                <div className="p-2">
                  <div className="flex items-center space-x-2 mb-2">
                    {getStopIcon(stop.type)}
                    <span className="font-semibold">{stop.time}</span>
                  </div>
                  <p className="text-sm font-medium">{stop.location}</p>
                  <p className="text-xs text-gray-600">{stop.description}</p>
                  {stop.duration > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Duration:{" "}
                      {stop.duration >= 60
                        ? `${Math.floor(stop.duration / 60)}h ${
                            stop.duration % 60
                          }m`
                        : `${stop.duration}m`}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Mileage: {stop.mileage} miles
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
          <button
            onClick={() =>
              setMapMode(mapMode === "road" ? "satellite" : "road")
            }
            className="bg-white dark:bg-slate-700 px-3 py-2 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
          >
            {mapMode === "road" ? "🗺️ Satellite" : "🛣️ Road"}
          </button>
        </div>

        {/* Map Attribution */}
        <div className="absolute bottom-2 right-2 z-10 text-xs text-gray-600 bg-white bg-opacity-90 px-2 py-1 rounded">
          © OpenStreetMap contributors
        </div>
      </div>

      {/* Selected Stop Details */}
      {selectedStop && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {getStopIcon(selectedStop.type)}
              <h3 className="font-semibold">Stop Details</h3>
            </div>
            <button
              onClick={() => setSelectedStop(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p>
                <strong>Location:</strong> {selectedStop.location}
              </p>
              <p>
                <strong>Time:</strong> {selectedStop.time}
              </p>
              <p>
                <strong>Type:</strong>{" "}
                {selectedStop.type.replace("-", " ").toUpperCase()}
              </p>
            </div>
            <div>
              <p>
                <strong>Duration:</strong>{" "}
                {selectedStop.duration >= 60
                  ? `${Math.floor(selectedStop.duration / 60)}h ${
                      selectedStop.duration % 60
                    }m`
                  : `${selectedStop.duration}m`}
              </p>
              <p>
                <strong>Mileage:</strong> {selectedStop.mileage} miles
              </p>
              <p>
                <strong>Description:</strong> {selectedStop.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Route Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center space-x-2">
            <Navigation className="w-4 h-4 text-blue-500" />
            <span>Total Stops</span>
          </h4>
          <p className="text-2xl font-bold">{stops.length}</p>
          <p className="text-sm text-muted-foreground">
            Including rests and fuel
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-purple-500" />
            <span>Rest Breaks</span>
          </h4>
          <p className="text-2xl font-bold">
            {
              stops.filter((s) => s.type === "rest" || s.type === "sleeper")
                .length
            }
          </p>
          <p className="text-sm text-muted-foreground">HOS compliance stops</p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center space-x-2">
            <Fuel className="w-4 h-4 text-orange-500" />
            <span>Fuel Stops</span>
          </h4>
          <p className="text-2xl font-bold">
            {stops.filter((s) => s.type === "fuel").length}
          </p>
          <p className="text-sm text-muted-foreground">Every ~1000 miles</p>
        </div>
      </div>
    </div>
  );
}
