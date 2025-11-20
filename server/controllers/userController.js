// server/controllers/userController.js
import pool from '../db.js';
import bcrypt from 'bcrypt';

export const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let query = 'SELECT id, name, email, role, phone, created_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND role = $1';
      params.push(role);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, name, email, role, phone, address, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, phone, address, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, address, password } = req.body;

    // Check if user exists and has permission
    if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = $${paramCount}`);
      params.push(name);
      paramCount++;
    }

    if (phone) {
      updates.push(`phone = $${paramCount}`);
      params.push(phone);
      paramCount++;
    }

    if (address) {
      updates.push(`address = $${paramCount}`);
      params.push(address);
      paramCount++;
    }

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updates.push(`password = $${paramCount}`);
      params.push(hashed);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, name, email, role, phone, address`;
    const result = await pool.query(query, params);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const getStaffUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role FROM users WHERE role IN ($1, $2) ORDER BY name',
      ['staff', 'admin']
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting staff users:', error);
    res.status(500).json({ error: 'Failed to get staff users' });
  }
};

