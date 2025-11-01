import React from 'react';
import { MapPin, Navigation, Fuel, Clock, Bed, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface RouteStop {
  id: string;
  type: 'start' | 'pickup' | 'dropoff' | 'fuel' | 'rest' | 'sleeper';
  location: string;
  time: string;
  duration: number;
  description: string;
}

interface TripResult {
  id: string;
  date: string;
  route: string;
  totalDistance: number;
  totalDrivingHours: number;
  isCompliant: boolean;
  remainingCycle: number;
  inputData: any;
}

interface MapViewProps {
  routeStops: RouteStop[];
  tripResult: TripResult;
}

export function MapView({ routeStops, tripResult }: MapViewProps) {
  // Mock map placeholder - in real app would use Leaflet, Google Maps, etc.
  const mapStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23cbd5e0' fill-opacity='0.1' fill-rule='nonzero'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  };

  const getStopIcon = (type: string) => {
    switch (type) {
      case 'start':
        return <Navigation className="w-5 h-5 text-blue-500" />;
      case 'pickup':
        return <Package className="w-5 h-5 text-green-500" />;
      case 'dropoff':
        return <MapPin className="w-5 h-5 text-red-500" />;
      case 'fuel':
        return <Fuel className="w-5 h-5 text-orange-500" />;
      case 'rest':
        return <Clock className="w-5 h-5 text-purple-500" />;
      case 'sleeper':
        return <Bed className="w-5 h-5 text-indigo-500" />;
      default:
        return <MapPin className="w-5 h-5 text-gray-500" />;
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

  return (
    <div className="space-y-6">
      {/* Interactive Map Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span>Route Map</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="relative w-full h-96 bg-slate-100 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center"
            style={mapStyle}
          >
            {/* Route visualization */}
            <div className="absolute inset-4 flex flex-col justify-between">
              {/* Route line representation */}
              <div className="absolute left-8 top-0 bottom-0 w-1 bg-blue-400 opacity-50 rounded-full"></div>
              
              {/* Route stops positioned along the line */}
              {routeStops.map((stop, index) => (
                <div 
                  key={stop.id}
                  className="flex items-center space-x-3 relative z-10"
                  style={{ 
                    marginTop: index === 0 ? 0 : '20px',
                    marginLeft: '20px'
                  }}
                >
                  <div className={`w-8 h-8 ${getStopColor(stop.type)} rounded-full flex items-center justify-center shadow-lg`}>
                    <div className="text-white text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-700 rounded-lg px-3 py-2 shadow-md border min-w-48">
                    <div className="flex items-center space-x-2 mb-1">
                      {getStopIcon(stop.type)}
                      <span className="font-medium text-sm">{stop.time}</span>
                      {stop.duration > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {stop.duration >= 60 ? `${Math.floor(stop.duration / 60)}h` : `${stop.duration}m`}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {stop.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Map placeholder text */}
            <div className="text-center z-0">
              <div className="text-slate-400 dark:text-slate-500">
                <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Interactive Map</p>
                <p className="text-sm">Route visualization with real-time navigation</p>
                <p className="text-xs mt-2 opacity-75">
                  In production: Google Maps / OpenStreetMap integration
                </p>
              </div>
            </div>
          </div>

          {/* Map controls placeholder */}
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-1 hover:text-blue-600">
                <span>📍</span>
                <span>Recenter</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-blue-600">
                <span>🔍</span>
                <span>Zoom</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-blue-600">
                <span>🗺️</span>
                <span>Satellite</span>
              </button>
            </div>
            <div className="text-xs">
              Total Distance: {tripResult.totalDistance} miles
            </div>
          </div>
        </CardContent>
      </Card>

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
                <span>Total Driving</span>
              </h4>
              <p className="text-2xl font-bold">{tripResult.totalDrivingHours} hours</p>
              <p className="text-sm text-muted-foreground">
                Within 11-hour daily limit
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-purple-500" />
                <span>Rest Breaks</span>
              </h4>
              <p className="text-2xl font-bold">
                {routeStops.filter(s => s.type === 'rest' || s.type === 'sleeper').length}
              </p>
              <p className="text-sm text-muted-foreground">
                Scheduled stops
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center space-x-2">
                <Fuel className="w-4 h-4 text-orange-500" />
                <span>Fuel Stops</span>
              </h4>
              <p className="text-2xl font-bold">
                {routeStops.filter(s => s.type === 'fuel').length}
              </p>
              <p className="text-sm text-muted-foreground">
                Every ~1000 miles
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}