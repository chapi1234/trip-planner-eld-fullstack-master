import React, { useState } from "react";
import {
  Truck,
  Map,
  History,
  User,
  LogOut,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  Navigation,
  Fuel,
  Menu,
  X,
  FileText,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";

interface User {
  id: string;
  email: string;
  name: string;
  currentCycleUsed: number;
}

interface DashboardProps {
  user: User;
  onNavigate: (page: string) => void;
  pastTripsCount: number;
  hasRecentTrip?: boolean;
}

export function Dashboard({
  user,
  onNavigate,
  pastTripsCount,
  hasRecentTrip = false,
}: DashboardProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cyclePercentage = (user.currentCycleUsed / 70) * 100;
  const remainingHours = 70 - user.currentCycleUsed;
  const isNearLimit = cyclePercentage > 80;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="highway-gradient border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center truck-shadow">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Trip Planner ELD
                </h1>
                <p className="text-white/80 text-xs">Highway Horizon</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                  onClick={() => onNavigate("past-trips")}
                >
                  <History className="w-4 h-4 mr-2" />
                  Past Trips
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                  onClick={() => onNavigate("profile")}
                >
                  <User className="w-4 h-4 mr-2" />
                  {user.name}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                  onClick={() => onNavigate("login")}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </nav>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4">
          <nav className="grid gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => {
                onNavigate("past-trips");
                setIsMobileMenuOpen(false);
              }}
            >
              <History className="w-4 h-4 mr-2" />
              Past Trips
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => {
                onNavigate("profile");
                setIsMobileMenuOpen(false);
              }}
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => {
                onNavigate("login");
                setIsMobileMenuOpen(false);
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 text-center lg:text-left">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user.name}!
          </h2>
          <p className="text-muted-foreground text-lg">
            Plan your next compliant trip with confidence
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Current Cycle Usage */}
          <Card className="card-highway">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">
                Current Cycle Hours
              </CardTitle>
              <div className="w-8 h-8 rounded-lg highway-gradient flex items-center justify-center">
                <Clock className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {user.currentCycleUsed}
                <span className="text-lg text-muted-foreground">/70</span>
              </div>
              <Progress value={cyclePercentage} className="mb-3 h-2" />
              <div className="flex items-center space-x-2">
                {isNearLimit ? (
                  <AlertTriangle className="h-4 w-4 text-warning" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                <span className="text-sm font-medium">
                  {remainingHours} hours remaining
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Trip Count */}
          <Card className="card-highway">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">
                Completed Trips
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Navigation className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{pastTripsCount}</div>
              <p className="text-sm font-medium text-muted-foreground">
                All trips logged and compliant
              </p>
            </CardContent>
          </Card>

          {/* Compliance Status */}
          <Card className="card-highway">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">
                Compliance Status
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2 text-green-600">
                Compliant
              </div>
              <Badge className="status-compliant">Ready to Drive</Badge>
            </CardContent>
          </Card>

          {/* Next Action */}
          <Card className="card-highway">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">
                Fuel Planning
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                <Fuel className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">Auto</div>
              <p className="text-sm font-medium text-muted-foreground">
                Every 1,000 miles
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Hero Action Card */}
        <Card className="mb-8 border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 hover:border-primary/50 transition-all duration-200 truck-shadow">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 highway-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 truck-shadow-lg">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Plan Your Next Trip</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Input your route details and get comprehensive HOS-compliant trip
              planning with automated rest stops and ELD logs
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="btn-highway text-lg px-8 py-4 h-auto"
                onClick={() => onNavigate("trip-input")}
              >
                <Navigation className="w-5 h-5 mr-2" />
                Start Trip Planning
              </Button>
              {hasRecentTrip && (
                <Button
                  className="btn-secondary-highway text-lg px-8 py-4 h-auto"
                  onClick={() => onNavigate("eld-test")}
                >
                  <FileText className="w-5 h-5 mr-2" />
                  View ELD Logs
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* View Past Trips */}
          <Card
            className="card-highway group cursor-pointer"
            onClick={() => onNavigate("past-trips")}
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <History className="w-5 h-5 text-white" />
                </div>
                <span>Trip History</span>
              </CardTitle>
              <CardDescription>
                Review past trips and download ELD logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{pastTripsCount} trips</div>
                <Button
                  variant="outline"
                  className="btn-secondary-highway"
                  onClick={() => onNavigate("past-trips")}
                >
                  View All
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Access frequently used features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => onNavigate("past-trips")}
              >
                <History className="w-4 h-4 mr-2" />
                View Trip History
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => onNavigate("profile")}
              >
                <User className="w-4 h-4 mr-2" />
                Update Profile
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled
              >
                <Clock className="w-4 h-4 mr-2" />
                Export Logs (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* HOS Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Hours of Service Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                <h4 className="font-semibold mb-1">Daily Driving</h4>
                <p className="text-muted-foreground">
                  Maximum 11 hours per day
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                <h4 className="font-semibold mb-1">Driving Window</h4>
                <p className="text-muted-foreground">
                  14 hours maximum on-duty
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                <h4 className="font-semibold mb-1">Rest Break</h4>
                <p className="text-muted-foreground">
                  30 min after 8 hours driving
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                <h4 className="font-semibold mb-1">Off Duty</h4>
                <p className="text-muted-foreground">
                  10 consecutive hours to reset
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-4 gap-1 p-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center py-2"
              onClick={() => onNavigate("dashboard")}
            >
              <Truck className="w-4 h-4 mb-1" />
              <span className="text-xs">Home</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center py-2"
              onClick={() => onNavigate("trip-input")}
            >
              <Plus className="w-4 h-4 mb-1" />
              <span className="text-xs">New Trip</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center py-2"
              onClick={() => onNavigate("past-trips")}
            >
              <History className="w-4 h-4 mb-1" />
              <span className="text-xs">History</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center py-2"
              onClick={() => onNavigate("profile")}
            >
              <User className="w-4 h-4 mb-1" />
              <span className="text-xs">Profile</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
