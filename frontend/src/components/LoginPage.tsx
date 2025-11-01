import React, { useState } from "react";
import {
  Truck,
  MapPin,
  Clock,
  Navigation,
  Shield,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { apiService, User } from "../services/api";

interface LoginPageProps {
  onLogin: (user: User) => void;
  onSignup: (user: User) => void;
}

export function LoginPage({ onLogin, onSignup }: LoginPageProps) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupFirstName, setSignupFirstName] = useState("");
  const [signupLastName, setSignupLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await apiService.login({
        email: loginEmail,
        password: loginPassword,
      });

      onLogin(response.user);
    } catch (error: any) {
      console.error("Login failed:", error);
      setError(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await apiService.signup({
        email: signupEmail,
        password: signupPassword,
        first_name: signupFirstName,
        last_name: signupLastName,
      });

      onSignup(response.user);
    } catch (error: any) {
      console.error("Signup failed:", error);
      setError(error.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen highway-gradient relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 road-pattern opacity-10" />
      <div className="absolute top-20 left-10 opacity-20 animate-pulse">
        <Truck className="w-8 h-8 text-white transform rotate-12" />
      </div>
      <div className="absolute bottom-32 right-16 opacity-20 animate-pulse delay-1000">
        <Navigation className="w-6 h-6 text-white transform -rotate-12" />
      </div>
      <div className="absolute top-1/3 right-8 opacity-20 animate-pulse delay-500">
        <MapPin className="w-5 h-5 text-white" />
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left side - Branding */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center truck-shadow-lg">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Trip Planner ELD
                </h1>
                <p className="text-white/90 font-medium">
                  Professional HOS Compliance Solutions
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 truck-shadow">
              <h2 className="text-xl font-semibold text-white mb-3">
                Highway Horizon Technology
              </h2>
              <p className="text-white/90 leading-relaxed">
                Advanced trip planning with automated HOS calculations,
                real-time route optimization, and digital ELD logs designed
                specifically for interstate commercial drivers.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">
                  Smart Route Planning
                </h3>
                <p className="text-white/80 text-sm">
                  Automatically calculates compliant routes with required rest
                  stops and fuel breaks
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">
                  HOS Compliance
                </h3>
                <p className="text-white/80 text-sm">
                  Ensures 70-hour/8-day cycle compliance with automatic ELD log
                  generation
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">
                  FMCSA Compliant
                </h3>
                <p className="text-white/80 text-sm">
                  Built for property-carrying drivers with federal regulations
                  in mind
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-white/90 font-medium mb-1">
                  Standard Operating Conditions
                </p>
                <p className="text-xs text-white/70">
                  70hr/8day cycle • No adverse conditions • Fuel stops every
                  1,000 miles • 1hr pickup/dropoff
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="border-0 truck-shadow-lg bg-white/95 backdrop-blur-sm">
            <CardHeader className="space-y-4 text-center">
              <div className="flex items-center justify-center lg:hidden mb-4">
                <div className="w-16 h-16 highway-gradient rounded-2xl flex items-center justify-center truck-shadow">
                  <Truck className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl">Welcome Back, Driver</CardTitle>
                <CardDescription className="text-base mt-2">
                  Access your HOS compliance dashboard
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                      {error}
                    </div>
                  )}
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="driver@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full btn-highway h-12"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                  <div className="text-center">
                    <a
                      href="#"
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Forgot your password?
                    </a>
                  </div>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                      {error}
                    </div>
                  )}
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-first-name">First Name</Label>
                        <Input
                          id="signup-first-name"
                          type="text"
                          placeholder="John"
                          value={signupFirstName}
                          onChange={(e) => setSignupFirstName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-last-name">Last Name</Label>
                        <Input
                          id="signup-last-name"
                          type="text"
                          placeholder="Doe"
                          value={signupLastName}
                          onChange={(e) => setSignupLastName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="driver@example.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full btn-highway h-12"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
