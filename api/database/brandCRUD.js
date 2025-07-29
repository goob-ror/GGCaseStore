const db = require('../db');

/**
 * Brand CRUD Operations
 * Handles all brand-related database operations
 */

// Get all brands
const getAllBrands = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM brands ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get brand by ID
const getBrandById = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM brands WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new brand
const createBrand = async (req, res) => {
  try {
    const { name, brand_photo } = req.body;

    // Check if brand name already exists
    const [existingBrand] = await db.execute('SELECT id FROM brands WHERE name = ?', [name]);
    if (existingBrand.length > 0) {
      return res.status(409).json({ success: false, error: 'Brand name already exists' });
    }

    const [result] = await db.execute(
      'INSERT INTO brands (name, brand_photo, created_at) VALUES (?, ?, NOW())',
      [name, brand_photo || null]
    );
    res.status(201).json({ success: true, id: result.insertId, message: 'Brand created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update brand
const updateBrand = async (req, res) => {
  try {
    const { name, brand_photo } = req.body;

    // Check if brand name already exists (excluding current brand)
    const [existingBrand] = await db.execute('SELECT id FROM brands WHERE name = ? AND id != ?', [name, req.params.id]);
    if (existingBrand.length > 0) {
      return res.status(409).json({ success: false, error: 'Brand name already exists' });
    }

    const [result] = await db.execute(
      'UPDATE brands SET name = ?, brand_photo = ? WHERE id = ?',
      [name, brand_photo || null, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }
    res.json({ success: true, message: 'Brand updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete brand
const deleteBrand = async (req, res) => {
  try {
    // Check if brand is being used by any products
    const [products] = await db.execute('SELECT id FROM products WHERE brand_id = ?', [req.params.id]);
    if (products.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Cannot delete brand as it is being used by products'
      });
    }

    const [result] = await db.execute('DELETE FROM brands WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }
    res.json({ success: true, message: 'Brand deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand
};