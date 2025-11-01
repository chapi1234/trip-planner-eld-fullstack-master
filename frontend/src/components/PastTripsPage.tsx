import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Filter,
  Calendar,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Eye,
  Download,
  Truck,
  Navigation,
  History,
  Clock
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

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

interface PastTripsPageProps {
  user: User;
  trips: TripResult[];
  onNavigate: (page: string) => void;
  onViewTrip: (trip: TripResult) => void;
}

export function PastTripsPage({ user, trips, onNavigate, onViewTrip }: PastTripsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompliance, setFilterCompliance] = useState<'all' | 'compliant' | 'non-compliant'>('all');

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.date.includes(searchTerm);
    
    const matchesFilter = filterCompliance === 'all' ||
                         (filterCompliance === 'compliant' && trip.isCompliant) ||
                         (filterCompliance === 'non-compliant' && !trip.isCompliant);

    return matchesSearch && matchesFilter;
  });

  const totalTrips = trips.length;
  const compliantTrips = trips.filter(t => t.isCompliant).length;
  const totalMiles = trips.reduce((sum, trip) => sum + trip.totalDistance, 0);
  const totalHours = trips.reduce((sum, trip) => sum + trip.totalDrivingHours, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="highway-gradient border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate('dashboard')}
              className="mr-4 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <History className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">
                Trip History
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-highway">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
              <div className="w-8 h-8 rounded-lg highway-gradient flex items-center justify-center">
                <Navigation className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalTrips}</div>
              <p className="text-xs text-muted-foreground">
                All recorded trips
              </p>
            </CardContent>
          </Card>

          <Card className="card-highway">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">Compliant Trips</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{compliantTrips}</div>
              <p className="text-xs font-medium text-muted-foreground">
                {totalTrips > 0 ? Math.round((compliantTrips / totalTrips) * 100) : 0}% compliance rate
              </p>
            </CardContent>
          </Card>

          <Card className="card-highway">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">Total Miles</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalMiles.toLocaleString()}</div>
              <p className="text-xs font-medium text-muted-foreground">
                Across all trips
              </p>
            </CardContent>
          </Card>

          <Card className="card-highway">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Clock className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalHours.toFixed(1)}h</div>
              <p className="text-xs font-medium text-muted-foreground">
                Driving time logged
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6 card-highway">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg highway-gradient flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <span>Search & Filter</span>
            </CardTitle>
            <CardDescription>
              Find specific trips by route, date, or compliance status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by route or date..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant={filterCompliance === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterCompliance('all')}
                >
                  All Trips
                </Button>
                <Button
                  variant={filterCompliance === 'compliant' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterCompliance('compliant')}
                  className={filterCompliance === 'compliant' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Compliant
                </Button>
                <Button
                  variant={filterCompliance === 'non-compliant' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterCompliance('non-compliant')}
                  className={filterCompliance === 'non-compliant' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Issues
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trips Table */}
        <Card>
          <CardHeader>
            <CardTitle>Trip Records</CardTitle>
            <CardDescription>
              {filteredTrips.length} trip{filteredTrips.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTrips.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No trips found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterCompliance !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Start planning your first trip to see it here'
                  }
                </p>
                <Button 
                  onClick={() => onNavigate('trip-input')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Plan New Trip
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Distance</TableHead>
                      <TableHead>Driving Hours</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTrips.map((trip) => (
                      <TableRow key={trip.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{new Date(trip.date).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={trip.route}>
                            {trip.route}
                          </div>
                        </TableCell>
                        <TableCell>{trip.totalDistance.toLocaleString()} mi</TableCell>
                        <TableCell>{trip.totalDrivingHours}h</TableCell>
                        <TableCell>
                          <Badge 
                            variant={trip.isCompliant ? "default" : "destructive"}
                            className={trip.isCompliant ? "bg-green-100 text-green-800" : ""}
                          >
                            {trip.isCompliant ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Compliant
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Issues
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onViewTrip(trip)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Export
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mobile spacing */}
        <div className="h-20 md:hidden"></div>
      </main>
    </div>
  );
}