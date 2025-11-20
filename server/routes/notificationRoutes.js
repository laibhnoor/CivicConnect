// server/routes/notificationRoutes.js
import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from '../controllers/notificationController.js';

const router = express.Router();

// All notification routes require authentication
router.use(authMiddleware);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);

export default router;

