const db = require('../db');

/**
 * Web Banner CRUD Operations
 * Handles all web banner-related database operations
 */

// Get all web banners
const getAllBanners = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM web_banners ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get active web banners only
const getActiveBanners = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM web_banners WHERE active = true ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new banner
const createBanner = async (req, res) => {
  try {
    const { title, banner_image_url, redirect_url, active = true } = req.body;
    const [result] = await db.execute(
      'INSERT INTO web_banners (title, banner_image_url, redirect_url, active, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [title || null, banner_image_url || null, redirect_url || null, active]
    );
    res.status(201).json({ success: true, id: result.insertId, message: 'Banner created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update banner
const updateBanner = async (req, res) => {
  try {
    const { title, banner_image_url, redirect_url, active } = req.body;
    const [result] = await db.execute(
      'UPDATE web_banners SET title = ?, banner_image_url = ?, redirect_url = ?, active = ?, updated_at = NOW() WHERE id = ?',
      [title || null, banner_image_url || null, redirect_url || null, active, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    res.json({ success: true, message: 'Banner updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete banner
const deleteBanner = async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM web_banners WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    res.json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllBanners,
  getActiveBanners,
  createBanner,
  updateBanner,
  deleteBanner
};
