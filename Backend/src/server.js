require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const apiRoutes = require("./routes/trips");

const app = express();

const PORT = process.env.PORT || 4000;

// Connect DB
connectDB(process.env.MONGODB_URI || "mongodb://localhost:27017/tripplanner");

// Warn if JWT secret is not configured - prevents confusing jsonwebtoken errors later
if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET is not set. Authentication will fail until you set JWT_SECRET in Backend/.env");
}

app.use(morgan("dev"));
// Parse JSON bodies
app.use(express.json());

// Handle JSON parse errors (malformed JSON payloads) so they return 400 instead of 500
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    console.warn('JSON parse error:', err.message);
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }
  // If headers indicate malformed JSON, body-parser throws a SyntaxError
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.warn('Malformed JSON in request body:', err.message);
    return res.status(400).json({ message: 'Malformed JSON in request body' });
  }
  next();
});
app.use(cookieParser());

// Configure CORS so browser preflight and credentialed requests work predictably.
// Allow a single origin or a comma-separated list in FRONTEND_ORIGIN.
const frontendOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:5173").split(",").map(s => s.trim()).filter(Boolean);

// In development, allow any origin (but still send credentials). In production
// keep the strict whitelist behavior by configuring FRONTEND_ORIGIN.
const isProd = process.env.NODE_ENV === 'production';
const corsOptions = isProd
  ? {
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (frontendOrigins.indexOf(origin) !== -1) return callback(null, true);
        console.warn(`Blocked CORS request from origin: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRFToken', 'Accept'],
      exposedHeaders: ['Set-Cookie'],
    }
  : {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRFToken', 'Accept'],
      exposedHeaders: ['Set-Cookie'],
    };

app.use(cors(corsOptions));

// For debugging: respond to OPTIONS for any path so logs show the request/headers
app.options('*', (req, res) => {
  res.sendStatus(204);
});

// Mount API routes under /api
app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API is up" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
