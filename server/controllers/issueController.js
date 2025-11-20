// server/controllers/issueController.js
import pool from "../db.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { sendNotification } from "../services/notificationService.js";
import { classifyImage } from "../services/imageClassifier.js";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/issues';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

export const uploadMiddleware = upload.single('photo');
export const uploadResolutionMiddleware = upload.single('resolution_photo');

export const createIssue = async (req, res) => {
  try {
    let { title, description, category, latitude, longitude, priority } = req.body;
    const userId = req.user.id;
    
    // Handle photo upload
    let photoUrl = null;
    let aiSuggestedCategory = null;
    
    if (req.file) {
      photoUrl = `/uploads/issues/${req.file.filename}`;
      
      // Optional: AI image classification (if enabled)
      // This will suggest a category based on the image
      if (process.env.ENABLE_AI_CLASSIFIER === 'true' && !category) {
        try {
          const imagePath = path.join(process.cwd(), photoUrl);
          const classification = await classifyImage(imagePath);
          aiSuggestedCategory = classification.category;
          
          // Use AI suggestion if no category was provided
          if (!category) {
            category = aiSuggestedCategory;
            console.log(`🤖 AI suggested category: ${category} (confidence: ${(classification.confidence * 100).toFixed(0)}%)`);
          }
        } catch (error) {
          console.warn('AI classification failed, using provided category:', error.message);
          // Continue with user-provided category
        }
      }
    }

    const result = await pool.query(
      "INSERT INTO issues (user_id, title, description, category, latitude, longitude, photo_url, priority) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
      [userId, title, description, category, latitude, longitude, photoUrl, priority || 'medium']
    );
    
    // Get reporter name for response
    const reporterResult = await pool.query(
      "SELECT name, email FROM users WHERE id = $1",
      [userId]
    );
    
    const issue = result.rows[0];
    issue.reporter = reporterResult.rows[0].name;
    
    // Add AI suggestion to response if available
    if (aiSuggestedCategory) {
      issue.ai_suggested_category = aiSuggestedCategory;
    }
    
    // Send notification to admin/staff
    await sendNotification({
      issueId: issue.id,
      userId: userId,
      type: 'new_issue',
      title: 'New Issue Reported',
      message: `A new issue "${title}" has been reported in category ${category}`
    });
    
    res.status(201).json(issue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create issue" });
  }
};

export const getIssues = async (req, res) => {
  try {
    const { status, category, priority, assigned_to, user_id } = req.query;
    let query = `
      SELECT i.*, 
        u.name as reporter,
        u.email as reporter_email,
        a.name as assigned_to_name,
        a.email as assigned_to_email
      FROM issues i 
      JOIN users u ON i.user_id = u.id 
      LEFT JOIN users a ON i.assigned_to = a.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND i.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (category) {
      query += ` AND i.category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (priority) {
      query += ` AND i.priority = $${paramCount}`;
      params.push(priority);
      paramCount++;
    }

    if (assigned_to) {
      query += ` AND i.assigned_to = $${paramCount}`;
      params.push(assigned_to);
      paramCount++;
    }

    if (user_id) {
      query += ` AND i.user_id = $${paramCount}`;
      params.push(user_id);
      paramCount++;
    }

    query += ` ORDER BY i.created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get issues" });
  }
};

export const getIssueById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT i.*, 
        u.name as reporter,
        u.email as reporter_email,
        a.name as assigned_to_name,
        a.email as assigned_to_email
      FROM issues i 
      JOIN users u ON i.user_id = u.id 
      LEFT JOIN users a ON i.assigned_to = a.id
      WHERE i.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Issue not found" });
    }

    // Get comments
    const commentsResult = await pool.query(
      `SELECT ic.*, u.name as commenter_name, u.role as commenter_role
       FROM issue_comments ic
       JOIN users u ON ic.user_id = u.id
       WHERE ic.issue_id = $1
       ORDER BY ic.created_at ASC`,
      [id]
    );

    const issue = result.rows[0];
    issue.comments = commentsResult.rows;

    res.json(issue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get issue" });
  }
};

export const updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      status, 
      priority, 
      assigned_to, 
      assigned_department,
      resolution_notes 
    } = req.body;
    
    // Get current issue
    const currentIssue = await pool.query(
      "SELECT * FROM issues WHERE id = $1",
      [id]
    );

    if (currentIssue.rows.length === 0) {
      return res.status(404).json({ error: "Issue not found" });
    }

    const oldIssue = currentIssue.rows[0];
    
    // Build update query dynamically
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (status !== undefined) {
      updates.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;
      
      if (status === 'resolved' && oldIssue.status !== 'resolved') {
        updates.push(`resolved_at = NOW()`);
      }
    }

    if (priority !== undefined) {
      updates.push(`priority = $${paramCount}`);
      params.push(priority);
      paramCount++;
    }

    if (assigned_to !== undefined) {
      updates.push(`assigned_to = $${paramCount}`);
      params.push(assigned_to || null);
      paramCount++;
    }

    if (assigned_department !== undefined) {
      updates.push(`assigned_department = $${paramCount}`);
      params.push(assigned_department || null);
      paramCount++;
    }

    if (resolution_notes !== undefined) {
      updates.push(`resolution_notes = $${paramCount}`);
      params.push(resolution_notes);
      paramCount++;
    }

    // Handle resolution photo upload
    if (req.file && req.file.fieldname === 'resolution_photo') {
      updates.push(`resolution_photo_url = $${paramCount}`);
      params.push(`/uploads/issues/${req.file.filename}`);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const query = `
      UPDATE issues 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, params);
    
    const updatedIssue = result.rows[0];
    
    // Send notifications if status changed
    if (status && status !== oldIssue.status) {
      await sendNotification({
        issueId: updatedIssue.id,
        userId: updatedIssue.user_id,
        type: 'status_update',
        title: 'Issue Status Updated',
        message: `Your issue "${updatedIssue.title}" status has been updated to ${status}`
      });
    }

    // Send notification if assigned
    if (assigned_to && assigned_to !== oldIssue.assigned_to) {
      await sendNotification({
        issueId: updatedIssue.id,
        userId: assigned_to,
        type: 'assignment',
        title: 'New Issue Assignment',
        message: `You have been assigned to issue: "${updatedIssue.title}"`
      });
    }

    res.json(updatedIssue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update issue" });
  }
};

export const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if issue exists
    const issue = await pool.query("SELECT * FROM issues WHERE id = $1", [id]);
    if (issue.rows.length === 0) {
      return res.status(404).json({ error: "Issue not found" });
    }

    // Delete associated files
    if (issue.rows[0].photo_url) {
      const photoPath = path.join(process.cwd(), issue.rows[0].photo_url);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }
    if (issue.rows[0].resolution_photo_url) {
      const resolutionPath = path.join(process.cwd(), issue.rows[0].resolution_photo_url);
      if (fs.existsSync(resolutionPath)) {
        fs.unlinkSync(resolutionPath);
      }
    }

    await pool.query("DELETE FROM issues WHERE id = $1", [id]);
    res.json({ message: "Issue deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete issue" });
  }
};

export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, is_internal } = req.body;
    const userId = req.user.id;

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ error: "Comment cannot be empty" });
    }

    const result = await pool.query(
      `INSERT INTO issue_comments (issue_id, user_id, comment, is_internal)
       VALUES ($1, $2, $3, $4)
       RETURNING *, (SELECT name FROM users WHERE id = $2) as commenter_name`,
      [id, userId, comment, is_internal || false]
    );

    // Send notification to issue reporter (if not internal)
    if (!is_internal) {
      const issueResult = await pool.query(
        "SELECT user_id, title FROM issues WHERE id = $1",
        [id]
      );
      
      if (issueResult.rows.length > 0) {
        await sendNotification({
          issueId: parseInt(id),
          userId: issueResult.rows[0].user_id,
          type: 'comment',
          title: 'New Comment on Your Issue',
          message: `A new comment was added to your issue: "${issueResult.rows[0].title}"`
        });
      }
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add comment" });
  }
};

export const getIssueStats = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
        COUNT(*) FILTER (WHERE status = 'closed') as closed,
        COUNT(*) FILTER (WHERE priority = 'urgent') as urgent,
        COUNT(*) FILTER (WHERE priority = 'high') as high,
        COUNT(*) FILTER (WHERE priority = 'medium') as medium,
        COUNT(*) FILTER (WHERE priority = 'low') as low
      FROM issues
    `);

    const categoryStats = await pool.query(`
      SELECT 
        category,
        COUNT(*) as count,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved
      FROM issues
      GROUP BY category
      ORDER BY count DESC
    `);

    const recentIssues = await pool.query(`
      SELECT COUNT(*) as count
      FROM issues
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);

    res.json({
      overall: stats.rows[0],
      byCategory: categoryStats.rows,
      recent: recentIssues.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get stats" });
  }
};
