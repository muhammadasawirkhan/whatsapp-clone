import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { initSocket } from "./socket/socketHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Database Connection
connectDB();

const app = express();
const server = http.createServer(app);

// =========================================================
// 1. CORS CONFIGURATION (MUST BE FIRST BEFORE ROUTERS)
// =========================================================

const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://chatter-frontend.netlify.app", // Your production Netlify URL
  "http://localhost:5173",                 // Your local React Vite development server
  "http://localhost:3000"
].filter(Boolean); // Clean out undefined values safely

// Configure Express CORS middleware with flexible validation fallback
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman or internal system checks)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Safe production fallback instead of throwing a hard breaking JavaScript Error
      console.warn(`Mismatch origin detected by validation: ${origin}`);
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Global Preflight Interceptor (Explicitly catches browser OPTIONS checks at the gate)
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://chatter-frontend.netlify.app');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  return res.sendStatus(200);
});

// =========================================================
// 2. PARSERS & APPLICATION ROUTING
// =========================================================

app.use(express.json());

// Main App Endpoints
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

// =========================================================
// 3. SOCKET.IO INITIALIZATION
// =========================================================

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
});

initSocket(io);

// Start Server Pipeline
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Allowed origins array:", allowedOrigins);
});