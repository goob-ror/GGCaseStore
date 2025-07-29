const db = require('../db');

/**
 * Product Variant CRUD Operations
 * Handles all product variant-related database operations
 */

// Get variants for a product
const getVariantsByProductId = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM product_variants WHERE product_id = ?', [req.params.productId]);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add variant to product
const createVariant = async (req, res) => {
  try {
    const { variant_name, price } = req.body;
    const [result] = await db.execute(
      'INSERT INTO product_variants (product_id, variant_name, price) VALUES (?, ?, ?)',
      [req.params.productId, variant_name, price]
    );
    res.status(201).json({ success: true, id: result.insertId, message: 'Variant added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update variant
const updateVariant = async (req, res) => {
  try {
    const { variant_name, price } = req.body;
    const [result] = await db.execute(
      'UPDATE product_variants SET variant_name = ?, price = ? WHERE id = ?',
      [variant_name, price, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Variant not found' });
    }
    res.json({ success: true, message: 'Variant updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete variant
const deleteVariant = async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM product_variants WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Variant not found' });
    }
    res.json({ success: true, message: 'Variant deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getVariantsByProductId,
  createVariant,
  updateVariant,
  deleteVariant
};
