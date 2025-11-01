from django.urls import path
from . import views

urlpatterns = [
    # Health check
    path('health/', views.health_check, name='health_check'),
    
    # Authentication
    path('auth/csrf/', views.get_csrf_token, name='csrf_token'),
    path('auth/login/', views.login_user, name='login'),
    path('auth/signup/', views.signup_user, name='signup'),
    path('auth/logout/', views.logout_user, name='logout'),
    path('auth/me/', views.get_current_user, name='current_user'),
    
    # Trip management
    path('trips/', views.trip_list, name='trip_list'),
    path('trips/<int:trip_id>/', views.trip_detail, name='trip_detail'),
    path('calculate/', views.calculate_trip, name='calculate_trip'),
    path('trips/<int:trip_id>/route/', views.trip_route, name='trip_route'),
    path('trips/<int:trip_id>/logs/', views.trip_eld_logs, name='trip_eld_logs'),
]
