// server/routes/userRoutes.js
import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { staffOrAdmin } from '../middleware/authMiddleware.js';
import {
  getUsers,
  getUserById,
  getCurrentUser,
  updateUser,
  getStaffUsers,
} from '../controllers/userController.js';

const router = express.Router();

// Get current user (authenticated)
router.get('/me', authMiddleware, getCurrentUser);

// Get all users (staff/admin only)
router.get('/', authMiddleware, staffOrAdmin, getUsers);

// Get staff users (for assignment dropdowns)
router.get('/staff', authMiddleware, staffOrAdmin, getStaffUsers);

// Get user by ID
router.get('/:id', authMiddleware, getUserById);

// Update user
router.put('/:id', authMiddleware, updateUser);

export default router;

