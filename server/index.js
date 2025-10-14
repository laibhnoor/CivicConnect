// server/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import issueRoutes from "./routes/issueRoutes.js";
import pool from "./db.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
console.log("✅ Auth routes loaded at /api/auth");

app.use("/api/issues", issueRoutes);

// Test DB connection
app.get("/", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json({ server: "running", time: result.rows[0].now });
});

console.log("Loaded .env PORT:", process.env.PORT);



app.listen(process.env.PORT, () =>
  console.log(`✅ Server running on port ${process.env.PORT}`)
);

