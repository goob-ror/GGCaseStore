const db = require('../db');

/**
 * Rating CRUD Operations
 * Handles all rating-related database operations
 */

// Helper function to update product rating statistics
const updateProductRating = async (productId) => {
  const [ratingStats] = await db.execute(`
    SELECT
      AVG(star) as avg_rating,
      COUNT(*) as total_raters
    FROM ratings
    WHERE product_id = ?
  `, [productId]);

  if (ratingStats.length > 0) {
    await db.execute(
      'UPDATE products SET avg_rating = ?, total_raters = ? WHERE id = ?',
      [ratingStats[0].avg_rating, ratingStats[0].total_raters, productId]
    );
  }
};

// Get ratings for a product
const getRatingsByProductId = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM ratings WHERE product_id = ? ORDER BY created_at DESC',
      [req.params.productId]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add rating to product
const createRating = async (req, res) => {
  try {
    const { star, review_text } = req.body;

    // Check if product exists
    const [product] = await db.execute('SELECT id FROM products WHERE id = ?', [req.params.productId]);
    if (product.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const [result] = await db.execute(
      'INSERT INTO ratings (product_id, star, review_text, created_at) VALUES (?, ?, ?, NOW())',
      [req.params.productId, star, review_text || null]
    );

    // Update product rating statistics
    await updateProductRating(req.params.productId);

    res.status(201).json({ success: true, id: result.insertId, message: 'Rating added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getRatingsByProductId,
  createRating,
  updateProductRating
};
