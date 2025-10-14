// server/controllers/authController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db.js";
import dotenv from "dotenv";
dotenv.config();

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    const existing = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (existing.rows.length > 0)
      return res.status(400).json({ message: "Email already exists" });

    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
      [name, email, hashed, role || "citizen"]
    );

    res.status(201).json(result.rows[0]);
    console.log("📩 Register endpoint hit");

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

    if (user.rows.length === 0)
      return res.status(400).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.rows[0].password);
    if (!valid) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ token, user: { id: user.rows[0].id, email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
};
