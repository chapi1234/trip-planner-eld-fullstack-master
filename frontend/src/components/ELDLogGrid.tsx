import React, { useState } from 'react';
import { FileText, Download, Edit, Info, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface User {
  id: string;
  email: string;
  name: string;
  currentCycleUsed: number;
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

interface ELDLogGridProps {
  tripResult: TripResult;
  user: User;
}

interface LogEntry {
  time: string;
  status: 'off-duty' | 'sleeper' | 'driving' | 'on-duty';
  location: string;
  remarks?: string;
}

export function ELDLogGrid({ tripResult, user }: ELDLogGridProps) {
  const [selectedDay, setSelectedDay] = useState(1);

  // Generate mock ELD log data based on trip
  const generateLogEntries = (day: number): LogEntry[] => {
    const entries: LogEntry[] = [
      { time: '00:00', status: 'off-duty', location: 'Home Terminal', remarks: 'Off duty after 10-hour break' },
      { time: '06:00', status: 'on-duty', location: tripResult.inputData.currentLocation, remarks: 'Pre-trip inspection, dispatch' },
      { time: '07:30', status: 'driving', location: tripResult.inputData.currentLocation, remarks: 'Begin driving to pickup' },
      { time: '08:30', status: 'on-duty', location: tripResult.inputData.pickupLocation, remarks: 'Pickup - loading cargo' },
      { time: '09:30', status: 'driving', location: tripResult.inputData.pickupLocation, remarks: 'Driving to destination' },
      { time: '11:45', status: 'on-duty', location: 'I-40 Rest Area', remarks: 'Fuel stop' },
      { time: '12:15', status: 'driving', location: 'I-40 Rest Area', remarks: 'Continue driving' },
      { time: '14:30', status: 'off-duty', location: 'Truck Stop', remarks: '30-minute rest break' },
      { time: '15:00', status: 'driving', location: 'Truck Stop', remarks: 'Resume driving' },
    ];

    if (tripResult.inputData.useSleeperBerth) {
      entries.push(
        { time: '18:00', status: 'sleeper', location: 'Truck Stop', remarks: '8-hour sleeper berth rest' },
        { time: '02:00', status: 'driving', location: 'Truck Stop', remarks: 'Resume after sleeper' },
        { time: '05:00', status: 'on-duty', location: tripResult.inputData.dropoffLocation, remarks: 'Delivery - unloading' },
        { time: '06:00', status: 'off-duty', location: tripResult.inputData.dropoffLocation, remarks: 'End of shift' }
      );
    } else {
      entries.push(
        { time: '17:00', status: 'on-duty', location: tripResult.inputData.dropoffLocation, remarks: 'Delivery - unloading' },
        { time: '18:00', status: 'off-duty', location: tripResult.inputData.dropoffLocation, remarks: 'End of shift' }
      );
    }

    return entries;
  };

  const logEntries = generateLogEntries(selectedDay);

  // Calculate totals
  const calculateTotals = (entries: LogEntry[]) => {
    const totals = {
      'off-duty': 0,
      'sleeper': 0,
      'driving': 0,
      'on-duty': 0
    };

    for (let i = 0; i < entries.length - 1; i++) {
      const current = entries[i];
      const next = entries[i + 1];
      
      const currentTime = parseTime(current.time);
      const nextTime = parseTime(next.time);
      
      let duration = nextTime - currentTime;
      if (duration < 0) duration += 24; // Handle midnight crossing
      
      totals[current.status] += duration;
    }

    return totals;
  };

  const parseTime = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + minutes / 60;
  };

  const totals = calculateTotals(logEntries);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'off-duty':
        return 'bg-gray-200 dark:bg-gray-700';
      case 'sleeper':
        return 'bg-blue-200 dark:bg-blue-800';
      case 'driving':
        return 'bg-green-200 dark:bg-green-800';
      case 'on-duty':
        return 'bg-yellow-200 dark:bg-yellow-800';
      default:
        return 'bg-gray-200 dark:bg-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'off-duty':
        return 'Off Duty';
      case 'sleeper':
        return 'Sleeper Berth';
      case 'driving':
        return 'Driving';
      case 'on-duty':
        return 'On Duty (Not Driving)';
      default:
        return status;
    }
  };

  // Generate visual grid representation
  const generateVisualGrid = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const gridData = hours.map(hour => {
      const entry = logEntries.find(e => {
        const entryHour = parseInt(e.time.split(':')[0]);
        return entryHour === hour;
      });
      
      return {
        hour,
        status: entry?.status || (hour < 6 ? 'off-duty' : 'driving'),
        location: entry?.location || '',
        remarks: entry?.remarks || ''
      };
    });

    return gridData;
  };

  const gridData = generateVisualGrid();

  return (
    <div className="space-y-6">
      <Tabs value={`day-${selectedDay}`} onValueChange={(value) => setSelectedDay(parseInt(value.split('-')[1]))}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="day-1">Day 1</TabsTrigger>
            <TabsTrigger value="day-2" disabled>Day 2</TabsTrigger>
            <TabsTrigger value="day-3" disabled>Day 3</TabsTrigger>
          </TabsList>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" disabled>
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        <TabsContent value="day-1" className="space-y-6">
          {/* ELD Log Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Daily Log - {tripResult.date}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Driver:</strong> {user.name}</p>
                  <p><strong>Date:</strong> {tripResult.date}</p>
                  <p><strong>Vehicle:</strong> Truck #101, Trailer #201</p>
                  <p><strong>Carrier:</strong> Example Trucking LLC</p>
                </div>
                <div>
                  <p><strong>Miles:</strong> {tripResult.totalDistance}</p>
                  <p><strong>Shipping Doc:</strong> BOL-{tripResult.id}</p>
                  <p><strong>Commodity:</strong> General Freight</p>
                  <p><strong>24-Hr Period:</strong> Midnight (Terminal Time)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visual Grid */}
          <Card>
            <CardHeader>
              <CardTitle>24-Hour Status Grid</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <span>Off Duty</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-200 dark:bg-blue-800 rounded"></div>
                  <span>Sleeper Berth</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-200 dark:bg-green-800 rounded"></div>
                  <span>Driving</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-200 dark:bg-yellow-800 rounded"></div>
                  <span>On Duty (Not Driving)</span>
                </div>
              </div>

              {/* Time Grid */}
              <div className="grid grid-cols-24 gap-1 mb-4">
                {gridData.map((data, index) => (
                  <div
                    key={index}
                    className={`h-12 ${getStatusColor(data.status)} border border-slate-300 dark:border-slate-600 rounded text-xs flex items-center justify-center font-medium relative group cursor-pointer`}
                    title={`${data.hour}:00 - ${getStatusLabel(data.status)}${data.location ? ` at ${data.location}` : ''}`}
                  >
                    {data.hour}
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                      {data.hour}:00 - {getStatusLabel(data.status)}
                      {data.location && <br />}{data.location}
                    </div>
                  </div>
                ))}
              </div>

              {/* Hour labels */}
              <div className="grid grid-cols-24 gap-1 text-xs text-center text-muted-foreground">
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i}>
                    {i === 0 ? '12A' : i === 12 ? '12P' : i > 12 ? `${i - 12}P` : `${i}A`}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status Log */}
          <Card>
            <CardHeader>
              <CardTitle>Status Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {logEntries.map((entry, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center space-x-2 min-w-32">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono font-semibold">{entry.time}</span>
                    </div>
                    <Badge 
                      variant="secondary"
                      className={`${getStatusColor(entry.status)} text-slate-800 dark:text-slate-200 min-w-24 justify-center`}
                    >
                      {getStatusLabel(entry.status)}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-medium">{entry.location}</p>
                      {entry.remarks && (
                        <p className="text-sm text-muted-foreground">{entry.remarks}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Totals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold">{totals['off-duty'].toFixed(1)}h</div>
                  <div className="text-sm text-muted-foreground">Off Duty</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <div className="text-2xl font-bold">{totals['sleeper'].toFixed(1)}h</div>
                  <div className="text-sm text-muted-foreground">Sleeper Berth</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                  <div className="text-2xl font-bold">{totals['driving'].toFixed(1)}h</div>
                  <div className="text-sm text-muted-foreground">Driving</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                  <div className="text-2xl font-bold">{totals['on-duty'].toFixed(1)}h</div>
                  <div className="text-sm text-muted-foreground">On Duty</div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  <span className="font-semibold">Verification</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Total hours: {Object.values(totals).reduce((a, b) => a + b, 0).toFixed(1)} / 24.0 hours
                </p>
                <p className="text-sm">
                  I certify that the above entries are true and correct.
                </p>
                <div className="mt-2 text-sm text-muted-foreground">
                  Driver Signature: {user.name} (Electronic)
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}