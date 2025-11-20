// server/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "../db.js";
dotenv.config();

export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch full user data from database
    const userResult = await pool.query(
      "SELECT id, email, role, name FROM users WHERE id = $1",
      [decoded.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }
    
    req.user = {
      id: userResult.rows[0].id,
      email: userResult.rows[0].email,
      role: userResult.rows[0].role,
      name: userResult.rows[0].name
    };
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
};

// Role-based access control middleware
export const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export const staffOrAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({ message: "Staff or admin access required" });
  }
  next();
};
