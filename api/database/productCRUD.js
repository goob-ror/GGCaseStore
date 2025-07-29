const db = require('../db');
const { emitProductCreated, emitProductUpdated, emitProductDeleted } = require('../utils/webhooks');

/**
 * Product CRUD Operations
 * Handles all product-related database operations
 */

// Get all products with brand and category info
const getAllProducts = async (req, res) => {
  try {
    const query = `
      SELECT p.*, b.name as brand_name, c.name as category_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `;
    const [rows] = await db.execute(query);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get product by ID with variants and photos
const getProductById = async (req, res) => {
  try {
    // Get product details
    const [productRows] = await db.execute(`
      SELECT p.*, b.name as brand_name, c.name as category_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [req.params.id]);

    if (productRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Get product variants
    const [variantRows] = await db.execute(
      'SELECT * FROM product_variants WHERE product_id = ?',
      [req.params.id]
    );

    // Get product photos
    const [photoRows] = await db.execute(
      'SELECT * FROM product_photos WHERE product_id = ?',
      [req.params.id]
    );

    const product = {
      ...productRows[0],
      variants: variantRows,
      photos: photoRows
    };

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new product
const createProduct = async (req, res) => {
  try {
    const { name, description, brand_id, category_id } = req.body;
    const [result] = await db.execute(
      'INSERT INTO products (name, description, brand_id, category_id, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [name, description, brand_id, category_id]
    );

    const productId = result.insertId;
    const newProduct = { id: productId, name, description, brand_id, category_id };

    // Emit webhook event
    emitProductCreated(req, newProduct);

    res.status(201).json({ success: true, id: productId, message: 'Product created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { name, description, brand_id, category_id } = req.body;
    const [result] = await db.execute(
      'UPDATE products SET name = ?, description = ?, brand_id = ?, category_id = ?, updated_at = NOW() WHERE id = ?',
      [name, description, brand_id, category_id, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updatedProduct = { id: req.params.id, name, description, brand_id, category_id };

    // Emit webhook event
    emitProductUpdated(req, updatedProduct);

    res.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Emit webhook event
    emitProductDeleted(req, parseInt(req.params.id));

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
