// API service for communicating with backend
// Prefer Vite env var VITE_API_BASE_URL, fall back to local backend for dev
const API_BASE_URL = (import.meta as any)?.env?.VITE_API_BASE_URL || "http://localhost:4000/api";

export interface TripCalculationRequest {
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  current_cycle_used: number;
}

export interface RoutePoint {
  id: number;
  point_type: string;
  latitude: number;
  longitude: number;
  address: string;
  sequence: number;
  duration_minutes: number;
  estimated_arrival?: string;
}

export interface DutyStatus {
  id: number;
  status: string;
  start_time: string;
  end_time: string;
  location: string;
  sequence: number;
}

export interface ELDLog {
  id: number;
  date: string;
  driver_name: string;
  carrier_name: string;
  vehicle_number: string;
  total_miles: number;
  duty_statuses: DutyStatus[];
}

export interface TripCalculationResponse {
  trip_id: number;
  total_distance: number;
  estimated_drive_time: number;
  total_trip_time: number;
  fuel_stops: number;
  rest_stops: number;
  route_points: RoutePoint[];
  eld_logs_needed: number;
  message: string;
}

export interface Trip {
  id: number;
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  current_cycle_used: number;
  total_distance: number;
  estimated_drive_time: number;
  total_trip_time: number;
  fuel_stops: number;
  rest_stops: number;
  status: string;
  created_at: string;
  updated_at: string;
  route_points: RoutePoint[];
  eld_logs: ELDLog[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  current_cycle_used: number;
}

export interface AuthResponse {
  message: string;
  user: User;
  session_id?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    // Get CSRF token from cookie if available
    const csrfToken = this.getCookieValue("csrftoken");

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken && { "X-CSRFToken": csrfToken }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  private getCookieValue(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift() || null;
    }
    return null;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.request("/health/");
  }

  // Calculate trip
  async calculateTrip(
    data: TripCalculationRequest
  ): Promise<TripCalculationResponse> {
    return this.request("/calculate/", {
      method: "POST",
      body: JSON.stringify(data),
      credentials: "include",
    });
  }

  // Get all trips
  async getTrips(): Promise<Trip[]> {
    return this.request("/trips/", { credentials: "include" });
  }

  // Get trip details
  async getTrip(tripId: number): Promise<Trip> {
    return this.request(`/trips/${tripId}/`, { credentials: "include" });
  }

  // Get trip route
  async getTripRoute(tripId: number): Promise<{
    trip_id: number;
    total_distance: number;
    route_points: RoutePoint[];
  }> {
    return this.request(`/trips/${tripId}/route/`, { credentials: "include" });
  }

  // Get ELD logs for trip
  async getTripEldLogs(tripId: number): Promise<ELDLog[]> {
    return this.request(`/trips/${tripId}/logs/`, { credentials: "include" });
  }

  // Save a trip (created client-side) to the server
  async saveTrip(data: any): Promise<any> {
    return this.request(`/trips/`, {
      method: "POST",
      body: JSON.stringify(data),
      credentials: "include",
    });
  }

  // Authentication methods
  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request("/auth/login/", {
      method: "POST",
      body: JSON.stringify(data),
      credentials: "include", // Include cookies for session
    });
  }

  async signup(data: SignupRequest): Promise<AuthResponse> {
    return this.request("/auth/signup/", {
      method: "POST",
      body: JSON.stringify(data),
      credentials: "include", // Include cookies for session
    });
  }

  async logout(): Promise<{ message: string }> {
    return this.request("/auth/logout/", {
      method: "POST",
      credentials: "include",
    });
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request("/auth/me/", {
      credentials: "include",
    });
  }

  async getCsrfToken(): Promise<{ csrf_token: string }> {
    return this.request("/auth/csrf/", {
      credentials: "include",
    });
  }

  async updateProfile(data: Partial<User>): Promise<{ user: User }> {
    return this.request("/auth/me/", {
      method: "PATCH",
      body: JSON.stringify(data),
      credentials: "include",
    });
  }
}

export const apiService = new ApiService();
export default apiService;
