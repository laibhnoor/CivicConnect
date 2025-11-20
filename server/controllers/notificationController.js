// server/controllers/notificationController.js
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/notificationService.js';

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, unread_only = false } = req.query;

    let notifications = await getUserNotifications(userId, parseInt(limit));

    if (unread_only === 'true') {
      notifications = notifications.filter(n => !n.is_read);
    }

    res.json(notifications);
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await markNotificationAsRead(id, userId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await markAllNotificationsAsRead(userId);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = (await import('../db.js')).default;
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
      [userId]
    );
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};

