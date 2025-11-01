from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import ensure_csrf_cookie
from django.middleware.csrf import get_token

from .models import Trip, RoutePoint, ELDLog, DutyStatus
from .serializers import (
    TripSerializer, TripCalculationRequestSerializer, 
    TripCalculationResponseSerializer, UserSerializer
)
from .calculations import HOSCalculator
from .distance_service import DistanceService


@api_view(['GET'])
def trip_list(request):
    """Get list of all trips"""
    trips = Trip.objects.all()
    serializer = TripSerializer(trips, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def trip_detail(request, trip_id):
    """Get detailed trip information"""
    trip = get_object_or_404(Trip, id=trip_id)
    serializer = TripSerializer(trip)
    return Response(serializer.data)


@api_view(['POST'])
def calculate_trip(request):
    """
    Calculate trip details based on HOS regulations
    
    Expected payload:
    {
        "current_location": "Current Location",
        "pickup_location": "Pickup Location", 
        "dropoff_location": "Dropoff Location",
        "current_cycle_used": 25.5
    }
    """
    print(f"DEBUG: Calculate trip request data: {request.data}")
    
    # Validate input
    serializer = TripCalculationRequestSerializer(data=request.data)
    if not serializer.is_valid():
        print(f"DEBUG: Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Extract data
    current_location = serializer.validated_data['current_location']
    pickup_location = serializer.validated_data['pickup_location']
    dropoff_location = serializer.validated_data['dropoff_location']
    current_cycle_used = serializer.validated_data['current_cycle_used']
    
    # Calculate real distance and duration between locations
    print(f"DEBUG: Calculating distance from {current_location} to {dropoff_location}")
    route_data = DistanceService.calculate_distance_and_duration(current_location, dropoff_location)
    distance_miles = route_data['distance_miles']
    estimated_duration = route_data['duration_hours']
    
    print(f"DEBUG: Calculated distance: {distance_miles} miles, duration: {estimated_duration} hours")
    
    # Calculate trip details
    try:
        trip_details = HOSCalculator.calculate_trip_details(current_cycle_used, distance_miles)
        
        # Create trip record
        trip = Trip.objects.create(
            current_location=current_location,
            pickup_location=pickup_location,
            dropoff_location=dropoff_location,
            current_cycle_used=current_cycle_used,
            total_distance=trip_details['total_distance'],
            estimated_drive_time=trip_details['estimated_drive_time'],
            total_trip_time=trip_details['total_trip_time'],
            fuel_stops=trip_details['fuel_stops'],
            rest_stops=trip_details['rest_stops'],
            status='planned'
        )
        
        # Generate route points
        route_points_data = HOSCalculator.generate_route_points(
            current_location, pickup_location, dropoff_location, trip_details
        )
        
        # Create route points
        route_points = []
        for point_data in route_points_data:
            point = RoutePoint.objects.create(
                trip=trip,
                point_type=point_data['point_type'],
                latitude=point_data['latitude'],
                longitude=point_data['longitude'],
                address=point_data['address'],
                sequence=point_data['sequence'],
                duration_minutes=point_data['duration_minutes']
            )
            route_points.append(point)
        
        # Generate ELD logs
        eld_logs_data = HOSCalculator.generate_eld_logs(trip_details, timezone.now())
        
        # Create ELD logs and duty statuses
        eld_logs = []
        for log_data in eld_logs_data:
            log = ELDLog.objects.create(
                trip=trip,
                date=log_data['date'],
                driver_name=log_data['driver_name'],
                carrier_name=log_data['carrier_name'],
                vehicle_number=log_data['vehicle_number'],
                total_miles=log_data['total_miles']
            )
            
            # Create duty statuses for this log
            for status_data in log_data['duty_statuses']:
                DutyStatus.objects.create(
                    log=log,
                    status=status_data['status'],
                    start_time=status_data['start_time'],
                    end_time=status_data['end_time'],
                    location=status_data['location'],
                    sequence=status_data['sequence']
                )
            
            eld_logs.append(log)
        
        # Prepare response
        response_data = {
            'trip_id': trip.id,
            'total_distance': trip_details['total_distance'],
            'estimated_drive_time': trip_details['estimated_drive_time'],
            'total_trip_time': trip_details['total_trip_time'],
            'fuel_stops': trip_details['fuel_stops'],
            'rest_stops': trip_details['rest_stops'],
            'route_points': [{
                'id': point.id,
                'point_type': point.point_type,
                'latitude': point.latitude,
                'longitude': point.longitude,
                'address': point.address,
                'sequence': point.sequence,
                'duration_minutes': point.duration_minutes
            } for point in route_points],
            'eld_logs_needed': len(eld_logs),
            'message': f"Trip calculated successfully. {trip_details['days_needed']} days needed." + 
                      (" Trip is feasible with current cycle." if trip_details['feasible'] else 
                       " Warning: Trip may exceed current cycle limits.")
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': f'Calculation failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def trip_route(request, trip_id):
    """Get route information for a trip"""
    trip = get_object_or_404(Trip, id=trip_id)
    route_points = RoutePoint.objects.filter(trip=trip).order_by('sequence')
    
    response_data = {
        'trip_id': trip.id,
        'total_distance': trip.total_distance,
        'route_points': [{
            'point_type': point.point_type,
            'latitude': point.latitude,
            'longitude': point.longitude,
            'address': point.address,
            'sequence': point.sequence,
            'duration_minutes': point.duration_minutes
        } for point in route_points]
    }
    
    return Response(response_data)


@api_view(['GET'])
def trip_eld_logs(request, trip_id):
    """Get ELD logs for a trip"""
    trip = get_object_or_404(Trip, id=trip_id)
    eld_logs = ELDLog.objects.filter(trip=trip).order_by('date')
    
    response_data = []
    for log in eld_logs:
        duty_statuses = DutyStatus.objects.filter(log=log).order_by('sequence')
        
        log_data = {
            'id': log.id,
            'date': log.date,
            'driver_name': log.driver_name,
            'carrier_name': log.carrier_name,
            'vehicle_number': log.vehicle_number,
            'total_miles': log.total_miles,
            'duty_statuses': [{
                'status': status.status,
                'start_time': status.start_time,
                'end_time': status.end_time,
                'location': status.location,
                'sequence': status.sequence
            } for status in duty_statuses]
        }
        response_data.append(log_data)
    
    return Response(response_data)


@api_view(['GET'])
def health_check(request):
    """Health check endpoint"""
    return Response({'status': 'healthy', 'message': 'Trip Planner API is running'})


@api_view(['GET'])
@ensure_csrf_cookie
def get_csrf_token(request):
    """Get CSRF token endpoint"""
    return Response({'csrf_token': get_token(request)})


@api_view(['POST'])
@ensure_csrf_cookie
def login_user(request):
    """Login endpoint"""
    try:
        data = request.data
        email = data.get('email')
        password = data.get('password')
        
        print(f"DEBUG: Email: {email}, Password: {password}")
        
        if not email or not password:
            return Response(
                {'error': 'Email and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find user by email
        try:
            user = User.objects.get(email=email)
            print(f"DEBUG: Found user: {user.username}")
        except User.DoesNotExist:
            print(f"DEBUG: User not found for email: {email}")
            return Response(
                {'error': 'Invalid email or password'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Authenticate user
        authenticated_user = authenticate(username=user.username, password=password)
        print(f"DEBUG: Authenticated user: {authenticated_user}")
        if authenticated_user is None:
            return Response(
                {'error': 'Invalid email or password'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Login user (creates session)
        login(request, authenticated_user)
        print(f"DEBUG: User logged in, session key: {request.session.session_key}")
        
        # Return user data
        serializer = UserSerializer(authenticated_user)
        print(f"DEBUG: User serializer data: {serializer.data}")
        return Response({
            'message': 'Login successful',
            'user': serializer.data,
            'session_id': request.session.session_key,
            'csrf_token': get_token(request)
        })
        
    except Exception as e:
        print(f"DEBUG: Exception in login: {e}")
        import traceback
        print(f"DEBUG: Traceback: {traceback.format_exc()}")
        return Response(
            {'error': f'Login failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@ensure_csrf_cookie
def signup_user(request):
    """Signup endpoint"""
    try:
        data = request.data
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        
        if not all([email, password, first_name, last_name]):
            return Response(
                {'error': 'All fields are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'User with this email already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create new user
        username = email.split('@')[0]  # Use email prefix as username
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        # Login the new user
        login(request, user)
        
        # Return user data
        serializer = UserSerializer(user)
        return Response({
            'message': 'Account created successfully',
            'user': serializer.data,
            'session_id': request.session.session_key,
            'csrf_token': get_token(request)
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': f'Signup failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@ensure_csrf_cookie
def logout_user(request):
    """Logout endpoint"""
    logout(request)
    return Response({'message': 'Logged out successfully'})


@api_view(['GET'])
def get_current_user(request):
    """Get current user endpoint"""
    if request.user.is_authenticated:
        serializer = UserSerializer(request.user)
        return Response({'user': serializer.data})
    else:
        return Response(
            {'error': 'Not authenticated'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )