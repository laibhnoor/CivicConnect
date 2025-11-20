// server/services/notificationService.js
import nodemailer from 'nodemailer';
import pool from '../db.js';
import dotenv from 'dotenv';
dotenv.config();

// Email transporter configuration
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ Email credentials not configured. Email notifications will be disabled.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send SMS using Twilio
const sendSMS = async (phoneNumber, message) => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.warn('⚠️ Twilio credentials not configured. SMS notifications will be disabled.');
    return false;
  }

  try {
    // Dynamic import for Twilio (optional dependency)
    const twilio = await import('twilio').catch(() => null);
    if (!twilio) {
      console.warn('⚠️ Twilio package not installed. Install it with: npm install twilio');
      return false;
    }

    const client = twilio.default(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    return true;
  } catch (error) {
    console.error('SMS sending error:', error);
    return false;
  }
};

// Send email notification
const sendEmail = async (email, subject, message) => {
  const transporter = createTransporter();
  if (!transporter) {
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"CivicConnect" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">CivicConnect</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-top: 0;">${subject}</h2>
            <p style="color: #4b5563; line-height: 1.6;">${message}</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                This is an automated notification from CivicConnect. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

// Main notification service
export const sendNotification = async ({ issueId, userId, type, title, message }) => {
  try {
    // Get user details
    const userResult = await pool.query(
      'SELECT id, email, phone, name FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      console.warn(`User ${userId} not found for notification`);
      return;
    }

    const user = userResult.rows[0];

    // Store notification in database
    const notificationResult = await pool.query(
      `INSERT INTO notifications (user_id, issue_id, type, title, message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, issueId, type, title, message]
    );

    // Send email notification
    if (user.email) {
      await sendEmail(user.email, title, message);
    }

    // Send SMS notification (if phone number exists)
    if (user.phone) {
      await sendSMS(user.phone, `${title}: ${message}`);
    }

    return notificationResult.rows[0];
  } catch (error) {
    console.error('Notification service error:', error);
    // Don't throw - notifications are non-critical
    return null;
  }
};

// Get notifications for a user
export const getUserNotifications = async (userId, limit = 50) => {
  try {
    const result = await pool.query(
      `SELECT n.*, i.title as issue_title
       FROM notifications n
       LEFT JOIN issues i ON n.issue_id = i.id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const result = await pool.query(
      `UPDATE notifications 
       SET is_read = TRUE 
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [notificationId, userId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return null;
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId) => {
  try {
    await pool.query(
      `UPDATE notifications 
       SET is_read = TRUE 
       WHERE user_id = $1 AND is_read = FALSE`,
      [userId]
    );
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};

