"""
Distance calculation service using OpenRouteService API
Provides real distance and duration calculations between locations
"""

import requests
import json
from typing import Dict, Tuple, Optional
from django.conf import settings

class DistanceService:
    """Service for calculating real distances and travel times between locations"""
    
    # OpenRouteService API endpoint
    ORS_API_URL = "https://api.openrouteservice.org/v2/directions/driving-hgv"
    
    @staticmethod
    def geocode_location(location: str) -> Optional[Tuple[float, float]]:
        """
        Geocode a location string to coordinates using OpenRouteService
        
        Args:
            location: Location string (e.g., "New York, NY")
            
        Returns:
            Tuple of (longitude, latitude) or None if not found
        """
        try:
            # Use OpenRouteService geocoding
            geocode_url = "https://api.openrouteservice.org/geocode/search"
            params = {
                'api_key': getattr(settings, 'ORS_API_KEY', ''),
                'text': location,
                'size': 1
            }
            
            response = requests.get(geocode_url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            if data.get('features'):
                coords = data['features'][0]['geometry']['coordinates']
                return (coords[0], coords[1])  # (longitude, latitude)
                
        except Exception as e:
            print(f"Geocoding error for '{location}': {e}")
            
        return None
    
    @staticmethod
    def calculate_distance_and_duration(start_location: str, end_location: str) -> Dict:
        """
        Calculate real distance and duration between two locations
        
        Args:
            start_location: Starting location string
            end_location: Destination location string
            
        Returns:
            Dictionary with distance_miles, duration_hours, and route_info
        """
        try:
            # Geocode both locations
            start_coords = DistanceService.geocode_location(start_location)
            end_coords = DistanceService.geocode_location(end_location)
            
            if not start_coords or not end_coords:
                # Fallback to mock calculation
                return DistanceService._mock_calculation(start_location, end_location)
            
            # Calculate route using OpenRouteService
            route_url = DistanceService.ORS_API_URL
            headers = {
                'Authorization': getattr(settings, 'ORS_API_KEY', ''),
                'Content-Type': 'application/json'
            }
            
            payload = {
                'coordinates': [list(start_coords), list(end_coords)],
                'profile': 'driving-hgv',
                'format': 'json',
                'options': {
                    'vehicle_type': 'truck',
                    'preference': 'fastest'
                }
            }
            
            response = requests.post(route_url, headers=headers, json=payload, timeout=15)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('features') and len(data['features']) > 0:
                feature = data['features'][0]
                properties = feature['properties']
                summary = properties['summary']
                
                # Convert meters to miles
                distance_meters = summary['distance']
                distance_miles = distance_meters * 0.000621371
                
                # Convert seconds to hours
                duration_seconds = summary['duration']
                duration_hours = duration_seconds / 3600
                
                return {
                    'distance_miles': round(distance_miles, 2),
                    'duration_hours': round(duration_hours, 2),
                    'route_info': {
                        'coordinates': feature['geometry']['coordinates'],
                        'summary': summary,
                        'waypoints': len(feature['geometry']['coordinates'])
                    },
                    'success': True
                }
            else:
                return DistanceService._mock_calculation(start_location, end_location)
                
        except Exception as e:
            print(f"Route calculation error: {e}")
            return DistanceService._mock_calculation(start_location, end_location)
    
    @staticmethod
    def _mock_calculation(start_location: str, end_location: str) -> Dict:
        """
        Fallback mock calculation when API is unavailable
        
        Args:
            start_location: Starting location string
            end_location: Destination location string
            
        Returns:
            Dictionary with estimated distance and duration
        """
        # Simple distance estimation based on location names
        # This is a fallback when the API is not available
        distance_miles = 850  # Default fallback
        
        # Try to estimate based on common routes
        start_lower = start_location.lower()
        end_lower = end_location.lower()
        
        # Common route estimations
        if 'new york' in start_lower and 'los angeles' in end_lower:
            distance_miles = 2800
        elif 'chicago' in start_lower and 'miami' in end_lower:
            distance_miles = 1200
        elif 'dallas' in start_lower and 'phoenix' in end_lower:
            distance_miles = 1000
        elif 'seattle' in start_lower and 'portland' in end_lower:
            distance_miles = 175
        
        # Estimate duration based on truck speed (55 mph average)
        duration_hours = distance_miles / 55
        
        return {
            'distance_miles': distance_miles,
            'duration_hours': round(duration_hours, 2),
            'route_info': {
                'coordinates': [],
                'summary': {'distance': distance_miles * 1609.34, 'duration': duration_hours * 3600},
                'waypoints': 2
            },
            'success': False,  # Indicates this is a fallback calculation
            'fallback': True
        }
