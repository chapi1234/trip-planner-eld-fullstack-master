import React, { useState } from 'react';
import { 
  ArrowLeft, 
  User, 
  Settings, 
  Clock, 
  BarChart3,
  Save,
  Edit,
  Download,
  Truck,
  Navigation,
  Shield,
  Phone,
  Mail,
  Building
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface User {
  id: string;
  email: string;
  name: string;
  currentCycleUsed: number;
}

interface ProfilePageProps {
  user: User;
  onNavigate: (page: string) => void;
  onUpdateUser: (user: User) => void;
}

export function ProfilePage({ user, onNavigate, onUpdateUser }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    currentCycleUsed: user.currentCycleUsed,
    phone: '(555) 123-4567',
    cdlNumber: 'CDL123456789',
    company: 'Example Trucking LLC',
    homeTerminal: 'Dallas, TX'
  });

  const [preferences, setPreferences] = useState({
    cycle: '70-hour-8-day',
    useSleeperBerth: true,
    autoFuelStops: true,
    notifications: true,
    darkMode: false
  });

  const handleSave = () => {
    onUpdateUser({
      ...user,
      name: formData.name,
      email: formData.email,
      currentCycleUsed: formData.currentCycleUsed
    });
    setIsEditing(false);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updatePreferences = (field: string, value: any) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  // Mock HOS history data
  const weeklyHours = [
    { week: 'Week 1', hours: 65.5 },
    { week: 'Week 2', hours: 68.0 },
    { week: 'Week 3', hours: 62.5 },
    { week: 'Week 4', hours: 70.0 },
    { week: 'This Week', hours: user.currentCycleUsed }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="highway-gradient border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
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
                  <User className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold text-white">
                  Profile & Settings
                </h1>
              </div>
            </div>
            
            {isEditing && (
              <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  size="sm"
                  className="btn-secondary-highway"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handleSave}
                  className="btn-highway"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="card-highway">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg highway-gradient flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <span>Driver Information</span>
                    </CardTitle>
                    <CardDescription>
                      Manage your personal and professional details
                    </CardDescription>
                  </div>
                  {!isEditing && (
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cdl">CDL Number</Label>
                    <Input
                      id="cdl"
                      value={formData.cdlNumber}
                      onChange={(e) => updateFormData('cdlNumber', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => updateFormData('company', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="terminal">Home Terminal</Label>
                    <Input
                      id="terminal"
                      value={formData.homeTerminal}
                      onChange={(e) => updateFormData('homeTerminal', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="cycle-used">Current Cycle Hours Used</Label>
                  <div className="flex items-center space-x-4">
                    <Input
                      id="cycle-used"
                      type="number"
                      min="0"
                      max="70"
                      step="0.5"
                      value={formData.currentCycleUsed}
                      onChange={(e) => updateFormData('currentCycleUsed', parseFloat(e.target.value) || 0)}
                      disabled={!isEditing}
                      className="w-32"
                    />
                    <span className="text-sm text-muted-foreground">
                      / 70 hours ({(70 - formData.currentCycleUsed).toFixed(1)} remaining)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  <span>Application Preferences</span>
                </CardTitle>
                <CardDescription>
                  Configure default settings for trip planning
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Hours of Service Cycle</Label>
                  <Select 
                    value={preferences.cycle} 
                    onValueChange={(value) => updatePreferences('cycle', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="70-hour-8-day">70-Hour / 8-Day Cycle</SelectItem>
                      <SelectItem value="60-hour-7-day">60-Hour / 7-Day Cycle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Use Sleeper Berth by Default</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable sleeper berth provisions for flexible rest periods
                      </p>
                    </div>
                    <Switch
                      checked={preferences.useSleeperBerth}
                      onCheckedChange={(checked) => updatePreferences('useSleeperBerth', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Auto-Include Fuel Stops</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically add fuel stops every 1,000 miles
                      </p>
                    </div>
                    <Switch
                      checked={preferences.autoFuelStops}
                      onCheckedChange={(checked) => updatePreferences('autoFuelStops', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Enable Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive alerts for HOS compliance and breaks
                      </p>
                    </div>
                    <Switch
                      checked={preferences.notifications}
                      onCheckedChange={(checked) => updatePreferences('notifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Use dark theme for better nighttime viewing
                      </p>
                    </div>
                    <Switch
                      checked={preferences.darkMode}
                      onCheckedChange={(checked) => updatePreferences('darkMode', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <span>HOS Statistics</span>
                </CardTitle>
                <CardDescription>
                  View your hours of service trends and compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Current Status */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {user.currentCycleUsed}h
                      </div>
                      <div className="text-sm text-muted-foreground">Current Cycle</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {(70 - user.currentCycleUsed).toFixed(1)}h
                      </div>
                      <div className="text-sm text-muted-foreground">Hours Remaining</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {((user.currentCycleUsed / 70) * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Cycle Used</div>
                    </div>
                  </div>

                  <Separator />

                  {/* Weekly Trend */}
                  <div>
                    <h4 className="font-semibold mb-4">Weekly Hours Trend</h4>
                    <div className="space-y-3">
                      {weeklyHours.map((week, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <div className="w-20 text-sm text-muted-foreground">
                            {week.week}
                          </div>
                          <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                week.hours > 65 ? 'bg-red-500' : 
                                week.hours > 55 ? 'bg-orange-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${(week.hours / 70) * 100}%` }}
                            />
                          </div>
                          <div className="w-16 text-sm font-medium text-right">
                            {week.hours}h
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Export Options */}
                  <div>
                    <h4 className="font-semibold mb-4">Export Data</h4>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" size="sm" disabled>
                        <Download className="w-4 h-4 mr-2" />
                        Export All Logs (PDF)
                      </Button>
                      <Button variant="outline" size="sm" disabled>
                        <Download className="w-4 h-4 mr-2" />
                        Export Hours Summary (CSV)
                      </Button>
                      <Button variant="outline" size="sm" disabled>
                        <Download className="w-4 h-4 mr-2" />
                        Export Trip History (PDF)
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Mobile spacing */}
        <div className="h-20 md:hidden"></div>
      </main>
    </div>
  );
}