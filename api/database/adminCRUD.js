const db = require('../db');
const bcrypt = require('bcrypt');

/**
 * Admin CRUD Operations
 * Handles all admin-related database operations
 */

// Get all admins
const getAllAdmins = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        id,
        username,
        last_login_ip,
        last_login_at,
        created_at,
        updated_at
      FROM admins
      ORDER BY created_at DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new admin
const createAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username already exists
    const [existingUser] = await db.execute('SELECT id FROM admins WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      return res.status(409).json({ success: false, error: 'Username already exists' });
    }

    // Hash the password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const [result] = await db.execute(
      'INSERT INTO admins (username, password_hash, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
      [username, password_hash]
    );
    res.status(201).json({ success: true, id: result.insertId, message: 'Admin created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update admin
const updateAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const adminId = req.params.id;

    // Check if username already exists (excluding current admin)
    const [existingUser] = await db.execute(
      'SELECT id FROM admins WHERE username = ? AND id != ?',
      [username, adminId]
    );
    if (existingUser.length > 0) {
      return res.status(409).json({ success: false, error: 'Username already exists' });
    }

    // Build update query based on provided fields
    let updateFields = ['username = ?', 'updated_at = NOW()'];
    let updateValues = [username];

    if (password) {
      // Hash the new password
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(password, saltRounds);
      updateFields.push('password_hash = ?');
      updateValues.push(password_hash);
    }

    updateValues.push(adminId);

    const [result] = await db.execute(
      `UPDATE admins SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Admin not found' });
    }

    res.json({ success: true, message: 'Admin updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete admin
const deleteAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;

    // Prevent deleting the current admin
    if (req.admin && req.admin.id == adminId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own admin account'
      });
    }

    // Check if admin exists
    const [existingAdmin] = await db.execute('SELECT id FROM admins WHERE id = ?', [adminId]);
    if (existingAdmin.length === 0) {
      return res.status(404).json({ success: false, error: 'Admin not found' });
    }

    // Check if this is the last admin
    const [adminCount] = await db.execute('SELECT COUNT(*) as count FROM admins');
    if (adminCount[0].count <= 1) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete the last admin account'
      });
    }

    const [result] = await db.execute('DELETE FROM admins WHERE id = ?', [adminId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Admin not found' });
    }

    res.json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin
};