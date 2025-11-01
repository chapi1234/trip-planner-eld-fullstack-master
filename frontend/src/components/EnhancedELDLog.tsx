import React, { useState, useRef, useEffect } from 'react';
import { FileText, Download, Edit, Info, Clock, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface DailyLog {
  date: string;
  entries: LogEntry[];
  totals: {
    offDuty: number;
    sleeperBerth: number;
    driving: number;
    onDuty: number;
  };
}

interface LogEntry {
  time: string;
  status: 'off-duty' | 'sleeper' | 'driving' | 'on-duty';
  location: string;
  remarks?: string;
  mileage?: number;
}

interface EnhancedELDLogProps {
  dailyLogs: DailyLog[];
  driverName: string;
  totalMiles: number;
  vehicleNumber?: string;
  carrierName?: string;
}

export function EnhancedELDLog({ 
  dailyLogs, 
  driverName, 
  totalMiles, 
  vehicleNumber = "Truck #101",
  carrierName = "Example Trucking LLC"
}: EnhancedELDLogProps) {
  const [selectedDay, setSelectedDay] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentLog = dailyLogs[selectedDay] || {
    date: new Date().toISOString().split('T')[0],
    entries: [],
    totals: { offDuty: 10, sleeperBerth: 0, driving: 0, onDuty: 0 }
  };

  // Draw the ELD grid on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw ELD grid
    drawELDGrid(ctx, rect.width, rect.height, currentLog);
  }, [currentLog, selectedDay]);

  const drawELDGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, log: DailyLog) => {
    const margin = 40;
    const gridWidth = width - 2 * margin;
    const gridHeight = height - 2 * margin;
    const rowHeight = gridHeight / 4;
    const hourWidth = gridWidth / 24;

    // Grid colors
    const colors = {
      'off-duty': '#6b7280',
      'sleeper': '#3b82f6',
      'driving': '#22c55e',
      'on-duty': '#f59e0b'
    };

    // Draw grid lines
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;

    // Vertical lines (hours)
    for (let i = 0; i <= 24; i++) {
      const x = margin + i * hourWidth;
      ctx.beginPath();
      ctx.moveTo(x, margin);
      ctx.lineTo(x, margin + gridHeight);
      ctx.stroke();

      // Hour labels
      ctx.fillStyle = '#374151';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      const hour = i === 0 ? '12A' : i === 12 ? '12P' : i > 12 ? `${i - 12}P` : `${i}A`;
      ctx.fillText(hour, x, margin + gridHeight + 15);
    }

    // Horizontal lines (status rows)
    const statusLabels = ['Off Duty', 'Sleeper Berth', 'Driving', 'On Duty (Not Driving)'];
    for (let i = 0; i <= 4; i++) {
      const y = margin + i * rowHeight;
      ctx.beginPath();
      ctx.moveTo(margin, y);
      ctx.lineTo(margin + gridWidth, y);
      ctx.stroke();

      // Status labels
      if (i < 4) {
        ctx.fillStyle = '#374151';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(statusLabels[i], margin - 10, y + rowHeight / 2 + 4);
      }
    }

    // Draw status periods
    if (log.entries.length > 0) {
      for (let i = 0; i < log.entries.length - 1; i++) {
        const entry = log.entries[i];
        const nextEntry = log.entries[i + 1];

        const startHour = parseTimeToHour(entry.time);
        const endHour = parseTimeToHour(nextEntry.time);
        
        const x = margin + startHour * hourWidth;
        const width = (endHour - startHour) * hourWidth;
        
        let rowIndex;
        switch (entry.status) {
          case 'off-duty': rowIndex = 0; break;
          case 'sleeper': rowIndex = 1; break;
          case 'driving': rowIndex = 2; break;
          case 'on-duty': rowIndex = 3; break;
          default: rowIndex = 0;
        }

        const y = margin + rowIndex * rowHeight + 2;
        const rectHeight = rowHeight - 4;

        // Fill the time period
        ctx.fillStyle = colors[entry.status];
        ctx.fillRect(x, y, width, rectHeight);

        // Add border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, rectHeight);

        // Add status change markers
        ctx.fillStyle = '#1f2937';
        ctx.beginPath();
        ctx.arc(x, y + rectHeight / 2, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    // Add title
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DRIVER\'S DAILY LOG', width / 2, 25);
  };

  const parseTimeToHour = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + minutes / 60;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'off-duty': return 'bg-gray-500 text-white';
      case 'sleeper': return 'bg-blue-500 text-white';
      case 'driving': return 'bg-green-500 text-white';
      case 'on-duty': return 'bg-yellow-500 text-black';
      default: return 'bg-gray-500 text-white';
    }
  };

  const handlePrintLog = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // In real app, would generate PDF
    alert('PDF download would be implemented with jsPDF library');
  };

  return (
    <div className="space-y-6">
      {/* Day Selector */}
      <div className="flex items-center justify-between">
        <Tabs value={`day-${selectedDay}`} onValueChange={(value) => setSelectedDay(parseInt(value.split('-')[1]))}>
          <TabsList>
            {dailyLogs.map((_, index) => (
              <TabsTrigger key={index} value={`day-${index}`}>
                Day {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrintLog}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* ELD Log Header */}
      <Card className="print:shadow-none">
        <CardHeader>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold">U.S. DEPARTMENT OF TRANSPORTATION</h2>
            <h3 className="text-lg font-semibold">DRIVER'S DAILY LOG</h3>
            <p className="text-sm text-muted-foreground">(One Calendar Day — 24 Hours)</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Date:</span>
                <span>{new Date(currentLog.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Name of Driver:</span>
                <span>{driverName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Vehicle Number:</span>
                <span>{vehicleNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Name of Carrier:</span>
                <span>{carrierName}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Total Miles:</span>
                <span>{totalMiles}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Shipping Document:</span>
                <span>BOL-{Math.floor(Math.random() * 10000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">24-Hr Period Starting:</span>
                <span>Midnight (Terminal Time)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Main Office Address:</span>
                <span>Dallas, TX</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual ELD Grid */}
      <Card className="print:shadow-none">
        <CardHeader>
          <CardTitle>Daily Status Grid</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="w-full border rounded-lg"
              style={{ height: '300px' }}
            />
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-500 rounded"></div>
              <span>Off Duty</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Sleeper Berth</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Driving</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>On Duty (Not Driving)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Change Log */}
      <Card className="print:shadow-none">
        <CardHeader>
          <CardTitle>Status Changes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {currentLog.entries.map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-mono font-semibold">{entry.time}</span>
                  </div>
                  <Badge className={getStatusColor(entry.status)}>
                    {entry.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div className="flex-1 ml-4">
                  <p className="font-medium">{entry.location}</p>
                  {entry.remarks && (
                    <p className="text-sm text-muted-foreground">{entry.remarks}</p>
                  )}
                  {entry.mileage && (
                    <p className="text-xs text-muted-foreground">Mileage: {entry.mileage}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Totals */}
      <Card className="print:shadow-none">
        <CardHeader>
          <CardTitle>Daily Totals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold">{currentLog.totals.offDuty.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Off Duty</div>
            </div>
            <div className="text-center p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <div className="text-2xl font-bold">{currentLog.totals.sleeperBerth.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Sleeper Berth</div>
            </div>
            <div className="text-center p-4 bg-green-100 dark:bg-green-900 rounded-lg">
              <div className="text-2xl font-bold">{currentLog.totals.driving.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Driving</div>
            </div>
            <div className="text-center p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <div className="text-2xl font-bold">{currentLog.totals.onDuty.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">On Duty</div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">Total Hours:</span>
              <span>
                {(
                  currentLog.totals.offDuty + 
                  currentLog.totals.sleeperBerth + 
                  currentLog.totals.driving + 
                  currentLog.totals.onDuty
                ).toFixed(1)} / 24.0 hours
              </span>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="w-4 h-4 text-blue-500" />
                <span className="font-semibold">Driver Certification</span>
              </div>
              <p className="text-sm mb-2">
                I certify that the above entries are true and correct.
              </p>
              <div className="border-t border-slate-300 dark:border-slate-600 pt-2 mt-4">
                <div className="flex justify-between">
                  <span className="text-sm">Driver Signature:</span>
                  <span className="text-sm italic">{driverName} (Electronic Signature)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remarks Section */}
      <Card className="print:shadow-none">
        <CardHeader>
          <CardTitle>Remarks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-sm">
            {currentLog.entries
              .filter(entry => entry.remarks)
              .map((entry, index) => (
                <p key={index}>
                  <span className="font-medium">{entry.time} - {entry.location}:</span> {entry.remarks}
                </p>
              ))}
          </div>
          {currentLog.entries.filter(entry => entry.remarks).length === 0 && (
            <p className="text-muted-foreground text-sm italic">No additional remarks for this day.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}