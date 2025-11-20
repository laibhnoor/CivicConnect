// server/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import authRoutes from "./routes/authRoutes.js";
import issueRoutes from "./routes/issueRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import pool from "./db.js";

dotenv.config();
const app = express();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/auth", authRoutes);
console.log("✅ Auth routes loaded at /api/auth");

app.use("/api/issues", issueRoutes);
console.log("✅ Issue routes loaded at /api/issues");

app.use("/api/notifications", notificationRoutes);
console.log("✅ Notification routes loaded at /api/notifications");

app.use("/api/users", userRoutes);
console.log("✅ User routes loaded at /api/users");

// Test DB connection
app.get("/", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json({ server: "running", time: result.rows[0].now });
});

console.log("Loaded .env PORT:", process.env.PORT);



app.listen(process.env.PORT, () =>
  console.log(`✅ Server running on port ${process.env.PORT}`)
);

