import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Fuel, Clock, Bed, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface RouteStop {
  id: string;
  type: 'start' | 'pickup' | 'dropoff' | 'fuel' | 'rest' | 'sleeper';
  location: string;
  time: string;
  duration: number;
  description: string;
  mileage: number;
  coordinates?: [number, number]; // [lat, lng]
}

interface InteractiveMapProps {
  stops: RouteStop[];
  totalDistance: number;
}

// Mock coordinates for demonstration - in real app would use geocoding API
const getCoordinates = (location: string): [number, number] => {
  const coords: { [key: string]: [number, number] } = {
    'dallas, tx': [32.7767, -96.7970],
    'phoenix, az': [33.4484, -112.0740],
    'atlanta, ga': [33.7490, -84.3880],
    'miami, fl': [25.7617, -80.1918],
    'chicago, il': [41.8781, -87.6298],
    'detroit, mi': [42.3314, -83.0458],
    'los angeles, ca': [34.0522, -118.2437],
    'las vegas, nv': [36.1699, -115.1398],
    'new york, ny': [40.7128, -74.0060],
    'philadelphia, pa': [39.9526, -75.1652],
    'houston, tx': [29.7604, -95.3698],
  };
  
  const key = location.toLowerCase().replace(/[^a-z,\s]/g, '').trim();
  return coords[key] || [39.8283, -98.5795]; // Default to center of US
};

export function InteractiveMap({ stops, totalDistance }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedStop, setSelectedStop] = useState<RouteStop | null>(null);
  const [mapMode, setMapMode] = useState<'route' | 'satellite'>('route');

  // Add coordinates to stops
  const stopsWithCoords = stops.map(stop => ({
    ...stop,
    coordinates: getCoordinates(stop.location)
  }));

  const getStopIcon = (type: string) => {
    switch (type) {
      case 'start':
        return <Navigation className="w-4 h-4 text-blue-500" />;
      case 'pickup':
        return <Package className="w-4 h-4 text-green-500" />;
      case 'dropoff':
        return <MapPin className="w-4 h-4 text-red-500" />;
      case 'fuel':
        return <Fuel className="w-4 h-4 text-orange-500" />;
      case 'rest':
        return <Clock className="w-4 h-4 text-purple-500" />;
      case 'sleeper':
        return <Bed className="w-4 h-4 text-indigo-500" />;
      default:
        return <MapPin className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStopColor = (type: string) => {
    switch (type) {
      case 'start':
        return 'bg-blue-500';
      case 'pickup':
        return 'bg-green-500';
      case 'dropoff':
        return 'bg-red-500';
      case 'fuel':
        return 'bg-orange-500';
      case 'rest':
        return 'bg-purple-500';
      case 'sleeper':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Calculate map bounds
  const calculateBounds = () => {
    if (stopsWithCoords.length === 0) return { center: [39.8283, -98.5795], zoom: 4 };
    
    const lats = stopsWithCoords.map(stop => stop.coordinates![0]);
    const lngs = stopsWithCoords.map(stop => stop.coordinates![1]);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    
    // Calculate zoom level based on bounds
    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);
    
    let zoom = 4;
    if (maxDiff < 1) zoom = 8;
    else if (maxDiff < 3) zoom = 7;
    else if (maxDiff < 5) zoom = 6;
    else if (maxDiff < 10) zoom = 5;
    
    return { center: [centerLat, centerLng], zoom };
  };

  const { center, zoom } = calculateBounds();

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span>Route Map</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant={mapMode === 'route' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMapMode('route')}
              >
                Route
              </Button>
              <Button
                variant={mapMode === 'satellite' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMapMode('satellite')}
              >
                Satellite
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div 
            ref={mapRef}
            className="relative w-full h-96 bg-slate-100 dark:bg-slate-800 rounded-lg border overflow-hidden"
          >
            {/* Static map representation using OpenStreetMap tile pattern */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23cbd5e0' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
            
            {/* Route line */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path
                d={`M 10 20 Q 30 10 50 30 Q 70 50 90 40`}
                stroke="#3b82f6"
                strokeWidth="0.5"
                fill="none"
                strokeDasharray="2 1"
                opacity="0.8"
              />
            </svg>
            
            {/* Map stops */}
            <div className="absolute inset-4">
              {stopsWithCoords.map((stop, index) => {
                // Calculate position as percentage of map area
                const leftPercent = 10 + (index / Math.max(stopsWithCoords.length - 1, 1)) * 80;
                const topPercent = 20 + Math.sin(index * 0.5) * 20 + Math.random() * 10;
                
                return (
                  <div
                    key={stop.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    style={{
                      left: `${leftPercent}%`,
                      top: `${topPercent}%`,
                    }}
                    onClick={() => setSelectedStop(stop)}
                  >
                    <div className={`w-8 h-8 ${getStopColor(stop.type)} rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform`}>
                      <span className="text-white text-xs font-bold">
                        {index + 1}
                      </span>
                    </div>
                    
                    {/* Stop label */}
                    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-700 rounded px-2 py-1 shadow-md text-xs whitespace-nowrap z-10">
                      <div className="flex items-center space-x-1">
                        {getStopIcon(stop.type)}
                        <span>{stop.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Map attribution */}
            <div className="absolute bottom-2 right-2 text-xs text-slate-500 bg-white bg-opacity-75 px-2 py-1 rounded">
              © OpenStreetMap contributors
            </div>
          </div>

          {/* Map controls */}
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-1 hover:text-blue-600">
                <span>📍</span>
                <span>Recenter</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-blue-600">
                <span>🔍</span>
                <span>Zoom In</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-blue-600">
                <span>🔍</span>
                <span>Zoom Out</span>
              </button>
            </div>
            <div className="text-xs">
              Total Distance: {totalDistance} miles
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Stop Details */}
      {selectedStop && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStopIcon(selectedStop.type)}
              <span>Stop Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Location:</strong> {selectedStop.location}</p>
                <p><strong>Time:</strong> {selectedStop.time}</p>
                <p><strong>Type:</strong> {selectedStop.type.replace('-', ' ').toUpperCase()}</p>
              </div>
              <div>
                <p><strong>Duration:</strong> {
                  selectedStop.duration >= 60 
                    ? `${Math.floor(selectedStop.duration / 60)}h ${selectedStop.duration % 60}m`
                    : `${selectedStop.duration}m`
                }</p>
                <p><strong>Mileage:</strong> {selectedStop.mileage} miles</p>
                <p><strong>Description:</strong> {selectedStop.description}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => setSelectedStop(null)}
            >
              Close
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Route Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Route Summary</CardTitle>
        </CardHeader>
        <CardContent>
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
                {stops.filter(s => s.type === 'rest' || s.type === 'sleeper').length}
              </p>
              <p className="text-sm text-muted-foreground">
                HOS compliance stops
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center space-x-2">
                <Fuel className="w-4 h-4 text-orange-500" />
                <span>Fuel Stops</span>
              </h4>
              <p className="text-2xl font-bold">
                {stops.filter(s => s.type === 'fuel').length}
              </p>
              <p className="text-sm text-muted-foreground">
                Every ~1000 miles
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Note */}
      <Card className="border-dashed border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p><strong>Production Integration:</strong></p>
            <p>This uses a static map representation. In the full application, this would integrate with:</p>
            <ul className="mt-2 space-y-1">
              <li>• OpenStreetMap + Leaflet.js for interactive mapping</li>
              <li>• MapBox or Google Maps API for real-time routing</li>
              <li>• Geocoding service for address-to-coordinates conversion</li>
              <li>• Traffic data for accurate drive time calculations</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}