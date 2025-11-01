# Trip Planner ELD Fullstack Application

A full-stack application for trucking trip planning with Hours of Service (HOS) compliance and ELD log generation, built with React frontend and Django backend.

## Project Structure

```
trip-planner-eld-fullstack/
├── README.md
├── frontend/                 # React application
│   ├── package.json
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── styles/          # CSS styles
│   │   └── ...
│   ├── index.html
│   └── vite.config.ts
├── backend/                  # Django API
│   ├── manage.py
│   ├── requirements.txt
│   ├── trip_planner/        # Django project settings
│   ├── api/                 # Django app
│   │   ├── models.py        # Database models
│   │   ├── views.py         # API endpoints
│   │   ├── serializers.py   # Data serializers
│   │   └── calculations.py  # HOS calculation logic
│   └── venv/                # Python virtual environment
└── docs/                    # Documentation
```

## Features

### Frontend (React)

- Trip planning interface
- HOS calculation display
- ELD log visualization
- Interactive dashboard
- Responsive design

### Backend (Django)

- RESTful API for trip calculations
- HOS compliance calculations (70-hour/8-day rule)
- ELD log generation
- Route point management
- Database persistence

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The backend API will be available at `http://localhost:8000`

### API Endpoints

- `GET /api/health/` - Health check
- `GET /api/trips/` - List all trips
- `POST /api/calculate/` - Calculate trip details
- `GET /api/trips/{id}/` - Get trip details
- `GET /api/trips/{id}/route/` - Get route information
- `GET /api/trips/{id}/logs/` - Get ELD logs

## HOS Compliance

The application implements FMCSA Hours of Service regulations:

- 70-hour/8-day rule for property-carrying CMV drivers
- 11-hour daily driving limit
- 14-hour daily duty limit
- 30-minute rest break requirement
- Fuel stop calculations (every 1000 miles)

## Technology Stack

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router

### Backend

- Django 5.2
- Django REST Framework
- SQLite (development)
- PostgreSQL (production ready)

## Development

### Running Tests

```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
cd frontend
npm test
```

### Deployment

The application is designed for easy deployment:

- Frontend: Vercel, Netlify, or any static hosting
- Backend: Railway, Render, or any Python hosting service

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is part of a coding assessment for Spotter AI.
