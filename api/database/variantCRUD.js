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
    const { variant_name } = req.body;
    const [result] = await db.execute(
      'INSERT INTO product_variants (product_id, variant_name) VALUES (?, ?)',
      [req.params.productId, variant_name]
    );
    res.status(201).json({ success: true, id: result.insertId, message: 'Variant added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Bulk update variants for a product
const updateProductVariants = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const productId = req.params.productId;
    const { variants } = req.body; // Array of variant objects

    if (!Array.isArray(variants)) {
      return res.status(400).json({ success: false, error: 'Variants must be an array' });
    }

    // Start transaction
    await connection.beginTransaction();

    try {
      // Delete existing variants for this product
      await connection.execute('DELETE FROM product_variants WHERE product_id = ?', [productId]);

      // Insert new variants
      if (variants.length > 0) {
        const values = variants.map(variant => [productId, variant.variant_name]).filter(v => v[1] && v[1].trim());

        if (values.length > 0) {
          // Insert variants one by one to avoid prepared statement issues
          for (const [prodId, variantName] of values) {
            await connection.execute(
              'INSERT INTO product_variants (product_id, variant_name) VALUES (?, ?)',
              [prodId, variantName]
            );
          }
        }
      }

      // Commit transaction
      await connection.commit();

      res.json({ success: true, message: 'Product variants updated successfully' });
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    // Always release the connection
    connection.release();
  }
};

// Update variant
const updateVariant = async (req, res) => {
  try {
    const { variant_name } = req.body;
    const [result] = await db.execute(
      'UPDATE product_variants SET variant_name = ? WHERE id = ?',
      [variant_name, req.params.id]
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
  updateProductVariants,
  updateVariant,
  deleteVariant
};
