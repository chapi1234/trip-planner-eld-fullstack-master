from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Trip, RoutePoint, ELDLog, DutyStatus


class RoutePointSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoutePoint
        fields = [
            'id', 'point_type', 'latitude', 'longitude', 
            'address', 'sequence', 'estimated_arrival', 'duration_minutes'
        ]


class DutyStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = DutyStatus
        fields = [
            'id', 'status', 'start_time', 'end_time', 'location', 'sequence'
        ]


class ELDLogSerializer(serializers.ModelSerializer):
    duty_statuses = DutyStatusSerializer(many=True, read_only=True)
    
    class Meta:
        model = ELDLog
        fields = [
            'id', 'date', 'driver_name', 'carrier_name', 
            'vehicle_number', 'total_miles', 'duty_statuses'
        ]


class TripSerializer(serializers.ModelSerializer):
    route_points = RoutePointSerializer(many=True, read_only=True)
    eld_logs = ELDLogSerializer(many=True, read_only=True)
    
    class Meta:
        model = Trip
        fields = [
            'id', 'current_location', 'pickup_location', 'dropoff_location',
            'current_cycle_used', 'total_distance', 'estimated_drive_time',
            'total_trip_time', 'fuel_stops', 'rest_stops', 'status',
            'created_at', 'updated_at', 'route_points', 'eld_logs'
        ]
        read_only_fields = [
            'total_distance', 'estimated_drive_time', 'total_trip_time',
            'fuel_stops', 'rest_stops', 'created_at', 'updated_at'
        ]


class TripCalculationRequestSerializer(serializers.Serializer):
    """Serializer for trip calculation requests"""
    current_location = serializers.CharField(max_length=200)
    pickup_location = serializers.CharField(max_length=200)
    dropoff_location = serializers.CharField(max_length=200)
    current_cycle_used = serializers.DecimalField(max_digits=5, decimal_places=2)


class TripCalculationResponseSerializer(serializers.Serializer):
    """Serializer for trip calculation responses"""
    trip_id = serializers.IntegerField()
    total_distance = serializers.DecimalField(max_digits=8, decimal_places=2)
    estimated_drive_time = serializers.DecimalField(max_digits=5, decimal_places=2)
    total_trip_time = serializers.DecimalField(max_digits=5, decimal_places=2)
    fuel_stops = serializers.IntegerField()
    rest_stops = serializers.IntegerField()
    route_points = RoutePointSerializer(many=True)
    eld_logs_needed = serializers.IntegerField()
    message = serializers.CharField()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user data"""
    current_cycle_used = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'current_cycle_used']
        read_only_fields = ['id']
    
    def get_current_cycle_used(self, obj):
        # Default to 0 for now - could be extended with user profile
        return 0


class LoginRequestSerializer(serializers.Serializer):
    """Serializer for login requests"""
    email = serializers.EmailField()
    password = serializers.CharField()


class SignupRequestSerializer(serializers.Serializer):
    """Serializer for signup requests"""
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6)
    first_name = serializers.CharField(max_length=30)
    last_name = serializers.CharField(max_length=30)
