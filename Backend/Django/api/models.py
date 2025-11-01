from django.db import models
from django.contrib.auth.models import User


class Trip(models.Model):
    """Trip model to store trip details and calculations"""
    
    STATUS_CHOICES = [
        ('planned', 'Planned'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    # Trip details
    current_location = models.CharField(max_length=200)
    pickup_location = models.CharField(max_length=200)
    dropoff_location = models.CharField(max_length=200)
    current_cycle_used = models.DecimalField(max_digits=5, decimal_places=2)
    
    # Calculated fields
    total_distance = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    estimated_drive_time = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    total_trip_time = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    fuel_stops = models.IntegerField(default=0)
    rest_stops = models.IntegerField(default=0)
    
    # Status and metadata
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Trip: {self.pickup_location} → {self.dropoff_location}"


class RoutePoint(models.Model):
    """Route points for mapping and stops"""
    
    TYPE_CHOICES = [
        ('start', 'Start'),
        ('pickup', 'Pickup'),
        ('fuel', 'Fuel Stop'),
        ('rest', 'Rest Stop'),
        ('dropoff', 'Dropoff'),
        ('end', 'End'),
    ]
    
    trip = models.ForeignKey(Trip, related_name='route_points', on_delete=models.CASCADE)
    point_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    latitude = models.DecimalField(max_digits=10, decimal_places=7)
    longitude = models.DecimalField(max_digits=10, decimal_places=7)
    address = models.CharField(max_length=200)
    sequence = models.IntegerField()
    estimated_arrival = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.IntegerField(default=0)  # Stop duration
    
    class Meta:
        ordering = ['trip', 'sequence']
    
    def __str__(self):
        return f"{self.trip} - {self.point_type}"


class ELDLog(models.Model):
    """ELD Log for a specific day"""
    
    trip = models.ForeignKey(Trip, related_name='eld_logs', on_delete=models.CASCADE)
    date = models.DateField()
    driver_name = models.CharField(max_length=100, default='Driver')
    carrier_name = models.CharField(max_length=100, default='Carrier')
    vehicle_number = models.CharField(max_length=50, default='V001')
    total_miles = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    
    class Meta:
        ordering = ['trip', 'date']
        unique_together = ['trip', 'date']
    
    def __str__(self):
        return f"ELD Log - {self.trip} - {self.date}"


class DutyStatus(models.Model):
    """Individual duty status entries for ELD logs"""
    
    STATUS_CHOICES = [
        ('off_duty', 'Off Duty'),
        ('sleeper', 'Sleeper Berth'),
        ('driving', 'Driving'),
        ('on_duty', 'On Duty (Not Driving)'),
    ]
    
    log = models.ForeignKey(ELDLog, related_name='duty_statuses', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    location = models.CharField(max_length=200)
    sequence = models.IntegerField()
    
    class Meta:
        ordering = ['log', 'sequence']
    
    def __str__(self):
        return f"{self.log} - {self.status} ({self.start_time} - {self.end_time})"