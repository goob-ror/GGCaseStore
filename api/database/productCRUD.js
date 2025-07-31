const db = require('../db');
const { emitProductCreated, emitProductUpdated, emitProductDeleted } = require('../utils/webhooks');

/**
 * Product CRUD Operations
 * Handles all product-related database operations
 */

const getAllProducts = async (req, res) => {
  console.log('🔍 getAllProducts route hit');

  try {
    // Parse pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const allowedLimits = [10, 20, 50, 100];
    const validLimit = allowedLimits.includes(limit) ? limit : 20;
    const offset = (page - 1) * validLimit;

    // Get total count for pagination info
    const countQuery = 'SELECT COUNT(*) as total FROM products';
    const [countResult] = await db.execute(countQuery);
    const totalProducts = countResult[0].total;
    const totalPages = Math.ceil(totalProducts / validLimit);

    const query = `
      SELECT
        p.*,
        p.price AS base_price,
        b.name AS brand_name,
        c.name AS category_name,
        COALESCE(p.avg_rating, 0) AS avg_rating,
        COALESCE(p.total_raters, 0) AS total_raters,
        COALESCE(p.total_sold, 0) AS total_sold
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
      LIMIT ${validLimit} OFFSET ${offset}
    `;

    console.log('🛠 Executing SQL:', query);

    const [rows] = await db.query(query);

    res.json({
      success: true,
      data: rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        limit: validLimit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('❌ Error in getAllProducts:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};


// Get product by ID with variants and photos
const getProductById = async (req, res) => {
  try {
    // Get product details
    const [productRows] = await db.execute(`
      SELECT
        p.*,
        p.price as base_price,
        b.name as brand_name,
        c.name as category_name,
        COALESCE(p.avg_rating, 0) as avg_rating,
        COALESCE(p.total_raters, 0) as total_raters,
        COALESCE(p.total_sold, 0) as total_sold
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
    const { name, description, brand_id, category_id, base_price, total_sold, avg_rating, total_raters } = req.body;

    // Convert base_price to price (frontend uses base_price, DB uses price)
    const price = base_price || 0;
    const soldCount = total_sold || 0;
    const avgRating = avg_rating || 0;
    const totalRatersCount = total_raters || 0;

    const [result] = await db.execute(
      'INSERT INTO products (name, description, brand_id, category_id, price, total_sold, avg_rating, total_raters, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [name, description, brand_id, category_id, price, soldCount, avgRating, totalRatersCount]
    );

    const productId = result.insertId;
    const newProduct = { id: productId, name, description, brand_id, category_id, price, total_sold: soldCount, avg_rating: avgRating, total_raters: totalRatersCount };

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
    const { name, description, brand_id, category_id, base_price, total_sold, avg_rating, total_raters } = req.body;

    // Convert base_price to price (frontend uses base_price, DB uses price)
    const price = base_price || 0;
    const soldCount = total_sold || 0;
    const avgRating = avg_rating || 0;
    const totalRatersCount = total_raters || 0;

    const [result] = await db.execute(
      'UPDATE products SET name = ?, description = ?, brand_id = ?, category_id = ?, price = ?, total_sold = ?, avg_rating = ?, total_raters = ?, updated_at = NOW() WHERE id = ?',
      [name, description, brand_id, category_id, price, soldCount, avgRating, totalRatersCount, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updatedProduct = { id: req.params.id, name, description, brand_id, category_id, price, total_sold: soldCount, avg_rating: avgRating, total_raters: totalRatersCount };

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

// Get High Rating Products
const getHighRatingProducts = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        p.*,
        p.price as base_price,
        b.name as brand_name,
        c.name as category_name,
        COALESCE(p.avg_rating, 0) as avg_rating,
        COALESCE(p.total_raters, 0) as total_raters,
        COALESCE(p.total_sold, 0) as total_sold
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.avg_rating > 0
      ORDER BY p.avg_rating DESC
      LIMIT 10
    `);


    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get High Sales Product
const getHighSalesProducts = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        p.*,
        p.price as base_price,
        b.name as brand_name,
        c.name as category_name,
        COALESCE(p.avg_rating, 0) as avg_rating,
        COALESCE(p.total_raters, 0) as total_raters,
        COALESCE(p.total_sold, 0) as total_sold
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.total_sold > 0
      ORDER BY p.total_sold DESC
      LIMIT 10
    `);

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Product Based on User Input Price
const getProductsByPrice = async (req, res) => {
  try {
    const { min_price, max_price } = req.query;

    const [rows] = await db.execute(`
      SELECT
        p.*,
        p.price as base_price,
        b.name as brand_name,
        c.name as category_name,
        COALESCE(p.avg_rating, 0) as avg_rating,
        COALESCE(p.total_raters, 0) as total_raters,
        COALESCE(p.total_sold, 0) as total_sold
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.price BETWEEN ? AND ?
      ORDER BY p.price ASC
    `, [min_price, max_price]);

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getHighRatingProducts,
  getHighSalesProducts,
  getProductsByPrice
};
