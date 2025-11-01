# Backend (Express + MongoDB)

This backend implements a minimal API compatible with the frontend in this repo.

Features
- Express server
- Mongoose (MongoDB) models for User and Trip
- Basic JWT auth (token stored as HttpOnly cookie)
- Trip calculation endpoint with a simple mock algorithm

Quick start

1. Copy `.env.example` -> `.env` and update values (notably `MONGODB_URI` and `JWT_SECRET`).
2. Install dependencies:

```powershell
cd Backend
npm install
```

3. Run the server in dev mode:

```powershell
npm run dev
```

The server will run on `http://localhost:4000` by default and exposes the API under `/api/`.

Endpoints (high level)
- `POST /api/auth/signup` — create user
- `POST /api/auth/login` — login (returns cookie)
- `POST /api/auth/logout` — clears cookie
- `GET /api/auth/me` — get current user
- `POST /api/calculate` — calculate and create a trip (returns calculation response)
- `GET /api/trips` — list trips for current user
- `GET /api/trips/:id` — get trip details
- `GET /api/trips/:id/route` — get route points and distance
- `GET /api/trips/:id/logs` — get eld logs for trip
