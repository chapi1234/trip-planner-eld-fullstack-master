"""
Hours of Service (HOS) calculation logic for trip planning
Based on FMCSA regulations for property-carrying CMV drivers
"""

from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime, timedelta, time
import math


class HOSCalculator:
    """Hours of Service calculator for 70-hour/8-day rule"""
    
    # HOS Limits
    MAX_DAILY_DRIVING = 11  # hours
    MAX_DAILY_ON_DUTY = 14  # hours
    MAX_WEEKLY_ON_DUTY = 70  # hours in 8 days
    MIN_OFF_DUTY = 10  # hours
    MIN_REST_BREAK = 0.5  # 30 minutes
    MAX_DRIVING_BEFORE_BREAK = 8  # hours
    
    # Trip assumptions
    FUEL_STOP_INTERVAL = 1000  # miles
    FUEL_STOP_DURATION = 0.5  # hours
    PICKUP_DURATION = 1  # hour
    DROPOFF_DURATION = 1  # hour
    AVERAGE_SPEED = 55  # mph
    
    # Enhanced HOS calculations
    MAX_CONSECUTIVE_DRIVING = 8  # hours before mandatory break
    MANDATORY_BREAK_DURATION = 0.5  # 30 minutes
    FUEL_STOP_TIME = 0.5  # hours for fuel stop
    LOADING_TIME = 1  # hour for pickup
    UNLOADING_TIME = 1  # hour for dropoff
    
    @staticmethod
    def calculate_trip_details(current_cycle_used: Decimal, distance_miles: Decimal) -> dict:
        """
        Calculate trip details based on HOS regulations
        
        Args:
            current_cycle_used: Current hours used in 70-hour cycle
            distance_miles: Total trip distance in miles
            
        Returns:
            Dictionary with calculated trip details
        """
        # Calculate driving time
        driving_time = distance_miles / HOSCalculator.AVERAGE_SPEED
        
        # Calculate fuel stops needed (every 1000 miles)
        fuel_stops = math.ceil(distance_miles / HOSCalculator.FUEL_STOP_INTERVAL) - 1
        fuel_stops = max(0, fuel_stops)  # Ensure non-negative
        
        # Calculate total fuel stop time
        total_fuel_time = fuel_stops * HOSCalculator.FUEL_STOP_TIME
        
        # Calculate pickup/dropoff time
        pickup_dropoff_time = HOSCalculator.LOADING_TIME + HOSCalculator.UNLOADING_TIME
        
        # Calculate mandatory rest breaks (30-minute break every 8 hours of driving)
        rest_stops_needed = math.ceil(driving_time / HOSCalculator.MAX_CONSECUTIVE_DRIVING) - 1
        rest_stops_needed = max(0, rest_stops_needed)
        total_rest_time = rest_stops_needed * HOSCalculator.MANDATORY_BREAK_DURATION
        
        # Calculate additional on-duty time (pre-trip, post-trip, paperwork)
        pre_trip_time = 0.5  # 30 minutes
        post_trip_time = 0.5  # 30 minutes
        paperwork_time = 0.25  # 15 minutes
        total_on_duty_time = pre_trip_time + post_trip_time + paperwork_time
        
        # Calculate total trip time (including all on-duty activities)
        total_trip_time = driving_time + total_fuel_time + pickup_dropoff_time + total_rest_time + total_on_duty_time
        
        # Calculate days needed
        days_needed = math.ceil(total_trip_time / HOSCalculator.MAX_DAILY_ON_DUTY)
        
        # Check if trip is feasible with current cycle
        remaining_cycle_hours = HOSCalculator.MAX_WEEKLY_ON_DUTY - current_cycle_used
        feasible = remaining_cycle_hours >= total_trip_time
        
        return {
            'total_distance': distance_miles,
            'estimated_drive_time': Decimal(str(round(driving_time, 2))),
            'total_trip_time': Decimal(str(round(total_trip_time, 2))),
            'fuel_stops': fuel_stops,
            'rest_stops': rest_stops_needed,
            'days_needed': days_needed,
            'feasible': feasible,
            'remaining_cycle_hours': Decimal(str(round(remaining_cycle_hours, 2))),
            'pickup_duration': HOSCalculator.LOADING_TIME,
            'dropoff_duration': HOSCalculator.UNLOADING_TIME,
            'fuel_stop_duration': HOSCalculator.FUEL_STOP_TIME,
            'rest_break_duration': HOSCalculator.MANDATORY_BREAK_DURATION,
            'on_duty_time': Decimal(str(round(total_on_duty_time, 2))),
            'driving_time': Decimal(str(round(driving_time, 2))),
            'fuel_time': Decimal(str(round(total_fuel_time, 2))),
            'rest_time': Decimal(str(round(total_rest_time, 2))),
        }
    
    @staticmethod
    def generate_route_points(current_location: str, pickup_location: str, 
                            dropoff_location: str, trip_details: dict) -> list:
        """
        Generate route points for the trip
        
        Args:
            current_location: Current location
            pickup_location: Pickup location
            dropoff_location: Dropoff location
            trip_details: Calculated trip details
            
        Returns:
            List of route points
        """
        points = []
        sequence = 0
        
        # Start point (current location)
        points.append({
            'point_type': 'start',
            'address': current_location,
            'latitude': 0.0,  # Will be filled by geocoding
            'longitude': 0.0,
            'sequence': sequence,
            'duration_minutes': 0,
            'estimated_arrival': None
        })
        sequence += 1
        
        # Pickup point
        points.append({
            'point_type': 'pickup',
            'address': pickup_location,
            'latitude': 0.0,
            'longitude': 0.0,
            'sequence': sequence,
            'duration_minutes': int(trip_details['pickup_duration'] * 60),
            'estimated_arrival': None
        })
        sequence += 1
        
        # Fuel stops (simplified - evenly distributed)
        fuel_stops = trip_details['fuel_stops']
        if fuel_stops > 0:
            for i in range(fuel_stops):
                points.append({
                    'point_type': 'fuel',
                    'address': f'Fuel Stop {i+1}',
                    'latitude': 0.0,
                    'longitude': 0.0,
                    'sequence': sequence,
                    'duration_minutes': int(trip_details['fuel_stop_duration'] * 60),
                    'estimated_arrival': None
                })
                sequence += 1
        
        # Rest stops (simplified - evenly distributed)
        rest_stops = trip_details['rest_stops']
        if rest_stops > 0:
            for i in range(rest_stops):
                points.append({
                    'point_type': 'rest',
                    'address': f'Rest Stop {i+1}',
                    'latitude': 0.0,
                    'longitude': 0.0,
                    'sequence': sequence,
                    'duration_minutes': int(trip_details['rest_break_duration'] * 60),
                    'estimated_arrival': None
                })
                sequence += 1
        
        # Dropoff point
        points.append({
            'point_type': 'dropoff',
            'address': dropoff_location,
            'latitude': 0.0,
            'longitude': 0.0,
            'sequence': sequence,
            'duration_minutes': int(trip_details['dropoff_duration'] * 60),
            'estimated_arrival': None
        })
        sequence += 1
        
        # End point (return to current location or end)
        points.append({
            'point_type': 'end',
            'address': 'Trip Complete',
            'latitude': 0.0,
            'longitude': 0.0,
            'sequence': sequence,
            'duration_minutes': 0,
            'estimated_arrival': None
        })
        
        return points
    
    @staticmethod
    def generate_eld_logs(trip_details: dict, start_date: datetime) -> list:
        """
        Generate ELD logs for the trip
        
        Args:
            trip_details: Calculated trip details
            start_date: Start date for the trip
            
        Returns:
            List of ELD log dictionaries
        """
        logs = []
        days_needed = trip_details['days_needed']
        total_trip_time = float(trip_details['total_trip_time'])
        
        # Distribute trip time across days
        daily_time = total_trip_time / days_needed
        daily_driving = min(daily_time, HOSCalculator.MAX_DAILY_DRIVING)
        
        for day in range(days_needed):
            log_date = start_date + timedelta(days=day)
            
            # Calculate duty statuses for the day
            duty_statuses = []
            current_time = time(6, 0)  # Start at 6 AM
            
            # On-duty not driving (pre-trip)
            pre_trip_end = (datetime.combine(datetime.today(), current_time) + timedelta(hours=1)).time()
            duty_statuses.append({
                'status': 'on_duty',
                'start_time': current_time,
                'end_time': pre_trip_end,
                'location': 'Pre-trip inspection',
                'sequence': len(duty_statuses)
            })
            current_time = pre_trip_end
            
            # Driving time
            driving_hours = min(daily_driving, 8)  # Max 8 hours before break
            if driving_hours > 0:
                end_driving = (datetime.combine(datetime.today(), current_time) + timedelta(hours=driving_hours)).time()
                duty_statuses.append({
                    'status': 'driving',
                    'start_time': current_time,
                    'end_time': end_driving,
                    'location': 'Driving',
                    'sequence': len(duty_statuses)
                })
                current_time = end_driving
            
            # Rest break if needed
            if driving_hours >= 8:
                break_end = (datetime.combine(datetime.today(), current_time) + timedelta(minutes=30)).time()
                duty_statuses.append({
                    'status': 'on_duty',
                    'start_time': current_time,
                    'end_time': break_end,
                    'location': 'Rest break',
                    'sequence': len(duty_statuses)
                })
                current_time = break_end
            
            # Additional driving if day allows
            remaining_driving = daily_driving - driving_hours
            if remaining_driving > 0:
                end_driving = (datetime.combine(datetime.today(), current_time) + timedelta(hours=remaining_driving)).time()
                duty_statuses.append({
                    'status': 'driving',
                    'start_time': current_time,
                    'end_time': end_driving,
                    'location': 'Driving',
                    'sequence': len(duty_statuses)
                })
                current_time = end_driving
            
            # Off-duty for remaining time
            if current_time.hour < 22:  # End day at 10 PM
                duty_statuses.append({
                    'status': 'off_duty',
                    'start_time': current_time,
                    'end_time': time(22, 0),
                    'location': 'Off duty',
                    'sequence': len(duty_statuses)
                })
            
            logs.append({
                'date': log_date.date(),
                'driver_name': 'Driver',
                'carrier_name': 'Carrier',
                'vehicle_number': 'V001',
                'total_miles': trip_details['total_distance'] / days_needed,
                'duty_statuses': duty_statuses
            })
        
        return logs
