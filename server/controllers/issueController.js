// server/controllers/issueController.js
import pool from "../db.js";

export const createIssue = async (req, res) => {
  try {
    const { title, description, category, latitude, longitude } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      "INSERT INTO issues (user_id, title, description, category, latitude, longitude) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [userId, title, description, category, latitude, longitude]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create issue" });
  }
};

export const getIssues = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT i.*, u.name as reporter FROM issues i JOIN users u ON i.user_id = u.id ORDER BY i.created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get issues" });
  }
};

export const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      "UPDATE issues SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *",
      [status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update status" });
  }
};
