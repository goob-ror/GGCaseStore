const db = require('../db');

/**
 * Admin CRUD Operations
 * Handles all admin-related database operations
 */

// Get all admins
const getAllAdmins = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, username, created_at, updated_at FROM admins');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new admin
const createAdmin = async (req, res) => {
  try {
    const { username, password_hash } = req.body;

    // Check if username already exists
    const [existingUser] = await db.execute('SELECT id FROM admins WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      return res.status(409).json({ success: false, error: 'Username already exists' });
    }

    const [result] = await db.execute(
      'INSERT INTO admins (username, password_hash, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
      [username, password_hash]
    );
    res.status(201).json({ success: true, id: result.insertId, message: 'Admin created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllAdmins,
  createAdmin
};