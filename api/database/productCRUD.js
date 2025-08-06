const db = require('../db');
const { emitProductCreated, emitProductUpdated, emitProductDeleted } = require('../utils/webhooks');

/**
 * Product CRUD Operations
 * Handles all product-related database operations
 */

const getAllProducts = async (req, res) => {

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
        CASE 
          WHEN p.isPromo = 1 
          AND (p.promo_price_start_date IS NULL OR p.promo_price_start_date <= NOW())
          AND (p.promo_price_end_date IS NULL OR p.promo_price_end_date >= NOW())
          THEN p.promo_price 
          ELSE p.price 
        END AS current_price,
        CASE 
          WHEN p.isPromo = 1 
          AND (p.promo_price_start_date IS NULL OR p.promo_price_start_date <= NOW())
          AND (p.promo_price_end_date IS NULL OR p.promo_price_end_date >= NOW())
          THEN 1 
          ELSE 0 
        END AS is_promo_active,
        p.promo_price,
        p.promo_price_start_date,
        p.promo_price_end_date,
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

    // Get photos for each product
    for (let product of rows) {
      const [photoRows] = await db.execute(
        'SELECT * FROM product_photos WHERE product_id = ? ORDER BY id ASC',
        [product.id]
      );
      product.photos = photoRows;
    }

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
    const { name, description, brand_id, category_id, base_price, total_sold, avg_rating, total_raters, is_promo = false, promo_price = null, promo_price_start_date = null, promo_price_end_date = null } = req.body;

    const price = base_price || 0;
    const discPrice = promo_price || null;
    const soldCount = total_sold || 0;
    const avgRating = avg_rating || 0;
    const totalRatersCount = total_raters || 0;

    if(is_promo && (promo_price === null || promo_price >= price)) {
      return res.status(400).json({ success: false, message: 'Harga promo harus lebih kecil dari harga normal.'})
    }

    const [result] = await db.execute(
      'INSERT INTO products (name, description, brand_id, category_id, isPromo, promo_price, price, total_sold, avg_rating, total_raters, promo_price_start_date, promo_price_end_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [name, description, brand_id, category_id, is_promo, discPrice, price, soldCount, avgRating, totalRatersCount, promo_price_start_date, promo_price_end_date]
    );

    const productId = result.insertId;
    const newProduct = { 
      id: productId, 
      name, 
      description, 
      brand_id, 
      category_id, 
      isPromo: is_promo, 
      promo_price: discPrice, 
      price, 
      total_sold: soldCount, 
      avg_rating: avgRating, 
      total_raters: totalRatersCount, 
      promo_price_start_date, 
      promo_price_end_date 
    };

    emitProductCreated(req, newProduct);
    res.status(201).json({ success: true, id: productId, message: 'Product created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { name, description, brand_id, category_id, base_price, total_sold, avg_rating, total_raters, is_promo = false, promo_price = null, promo_price_start_date = null, promo_price_end_date = null } = req.body;

    const price = base_price || 0;
    const soldCount = total_sold || 0;
    const avgRating = avg_rating || 0;
    const totalRatersCount = total_raters || 0;

    if(is_promo && (promo_price === null || promo_price >= price)) {
      return res.status(400).json({ success: false, message: 'Harga promo harus lebih kecil dari harga normal.'})
    }

    const [result] = await db.execute(
      'UPDATE products SET name = ?, description = ?, brand_id = ?, category_id = ?, isPromo = ?, promo_price = ?, price = ?, total_sold = ?, avg_rating = ?, total_raters = ?, promo_price_start_date = ?, promo_price_end_date = ?, updated_at = NOW() WHERE id = ?',
      [name, description, brand_id, category_id, is_promo, promo_price, price, soldCount, avgRating, totalRatersCount, promo_price_start_date, promo_price_end_date, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updatedProduct = { 
      id: req.params.id, 
      name, 
      description, 
      brand_id, 
      category_id, 
      isPromo: is_promo, 
      promo_price, 
      price, 
      total_sold: soldCount, 
      avg_rating: avgRating, 
      total_raters: totalRatersCount, 
      promo_price_start_date, 
      promo_price_end_date 
    };

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

    // Get photos for each product
    for (let product of rows) {
      const [photoRows] = await db.execute(
        'SELECT * FROM product_photos WHERE product_id = ? ORDER BY id ASC',
        [product.id]
      );
      product.photos = photoRows;
    }

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getPromoProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const allowedLimits = [10, 20, 50, 100];
    const validLimit = allowedLimits.includes(limit) ? limit : 20;
    const offset = (page - 1) * validLimit;

    // Get total count for pagination info
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM products 
      WHERE isPromo = 1 
      AND (promo_price_start_date IS NULL OR promo_price_start_date <= NOW())
      AND (promo_price_end_date IS NULL OR promo_price_end_date >= NOW())
    `;
    const [countResult] = await db.execute(countQuery);
    const totalProducts = countResult[0].total;
    const totalPages = Math.ceil(totalProducts / validLimit);

    const query = `
      SELECT
        p.*,
        p.price AS base_price,
        p.promo_price AS current_price,
        b.name AS brand_name,
        c.name AS category_name,
        COALESCE(p.avg_rating, 0) AS avg_rating,
        COALESCE(p.total_raters, 0) AS total_raters,
        COALESCE(p.total_sold, 0) AS total_sold,
        -- Calculate discount percentage
        ROUND(((p.price - p.promo_price) / p.price) * 100, 0) as discount_percentage
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.isPromo = 1 
      AND (p.promo_price_start_date IS NULL OR p.promo_price_start_date <= NOW())
      AND (p.promo_price_end_date IS NULL OR p.promo_price_end_date >= NOW())
      ORDER BY discount_percentage DESC, p.created_at DESC
      LIMIT ${validLimit} OFFSET ${offset}
    `;

    const [rows] = await db.query(query);

    // Get photos for each product
    for (let product of rows) {
      const [photoRows] = await db.execute(
        'SELECT * FROM product_photos WHERE product_id = ? ORDER BY id ASC',
        [product.id]
      );
      product.photos = photoRows;
    }

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
    console.error('❌ Error in getPromoProducts:', error.message);
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

    // Get photos for each product
    for (let product of rows) {
      const [photoRows] = await db.execute(
        'SELECT * FROM product_photos WHERE product_id = ? ORDER BY id ASC',
        [product.id]
      );
      product.photos = photoRows;
    }

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Product Based on High Rating and High Review
const getBestProducts = async (req, res) => {
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
      WHERE p.avg_rating > 0 AND p.total_raters > 0
      ORDER BY p.avg_rating DESC, p.total_raters DESC
      LIMIT 10
    `);

    // Get photos for each product
    for (let product of rows) {
      const [photoRows] = await db.execute(
        'SELECT * FROM product_photos WHERE product_id = ? ORDER BY id ASC',
        [product.id]
      );
      product.photos = photoRows;
    }

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

// Search products by name
const searchProducts = async (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;

    if (!query || query.trim().length === 0) {
      return res.json({ success: true, data: [] });
    }

    const searchTerm = `%${query.trim()}%`;

    const searchQuery = `
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
      WHERE p.name LIKE '${searchTerm}' OR p.description LIKE '${searchTerm}' OR b.name LIKE '${searchTerm}' OR c.name LIKE '${searchTerm}'
      ORDER BY p.avg_rating DESC, p.total_sold DESC
      LIMIT 10
    `;

    console.log('🔍 Executing search query:', searchQuery);

    const [rows] = await db.query(searchQuery);

    // Get photos for each product
    for (let product of rows) {
      const [photoRows] = await db.execute(
        'SELECT * FROM product_photos WHERE product_id = ? ORDER BY id ASC',
        [product.id]
      );
      product.photos = photoRows;
    }

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get products by category ID
const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Validate categoryId
    if (!categoryId || isNaN(categoryId)) {
      return res.status(400).json({ success: false, error: 'Valid category ID is required' });
    }

    const validLimit = Math.min(parseInt(limit), 100);
    const offset = (parseInt(page) - 1) * validLimit;

    const query = `
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
      WHERE p.category_id = ?
      ORDER BY p.created_at DESC
      LIMIT ${validLimit} OFFSET ${offset}
    `;

    const [rows] = await db.execute(query, [categoryId]);

    // Get photos for each product
    for (let product of rows) {
      const [photoRows] = await db.execute(
        'SELECT * FROM product_photos WHERE product_id = ? ORDER BY id ASC',
        [product.id]
      );
      product.photos = photoRows;
    }

    // Get total count for pagination
    const [countResult] = await db.execute(
      'SELECT COUNT(*) as total FROM products WHERE category_id = ?',
      [categoryId]
    );
    const totalProducts = countResult[0].total;
    const totalPages = Math.ceil(totalProducts / validLimit);

    res.json({
      success: true,
      data: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts,
        limit: validLimit
      }
    });
  } catch (error) {
    console.error('Error in getProductsByCategory:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get products by brand ID
const getProductsByBrand = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Validate brandId
    if (!brandId || isNaN(brandId)) {
      return res.status(400).json({ success: false, error: 'Valid brand ID is required' });
    }

    const validLimit = Math.min(parseInt(limit), 100);
    const offset = (parseInt(page) - 1) * validLimit;

    const query = `
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
      WHERE p.brand_id = ?
      ORDER BY p.created_at DESC
      LIMIT ${validLimit} OFFSET ${offset}
    `;

    const [rows] = await db.execute(query, [brandId]);

    // Get photos for each product
    for (let product of rows) {
      const [photoRows] = await db.execute(
        'SELECT * FROM product_photos WHERE product_id = ? ORDER BY id ASC',
        [product.id]
      );
      product.photos = photoRows;
    }

    // Get total count for pagination
    const [countResult] = await db.execute(
      'SELECT COUNT(*) as total FROM products WHERE brand_id = ?',
      [brandId]
    );
    const totalProducts = countResult[0].total;
    const totalPages = Math.ceil(totalProducts / validLimit);

    res.json({
      success: true,
      data: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts,
        limit: validLimit
      }
    });
  } catch (error) {
    console.error('Error in getProductsByBrand:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get product details with related products for detail page
const getProductDetails = async (req, res) => {
  try {
    const productId = req.params.id;

    // Get main product details
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
    `, [productId]);

    if (productRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const product = productRows[0];

    // Get product variants
    const [variantRows] = await db.execute(
      'SELECT * FROM product_variants WHERE product_id = ?',
      [productId]
    );

    // Get product photos
    const [photoRows] = await db.execute(
      'SELECT * FROM product_photos WHERE product_id = ?',
      [productId]
    );

    // Get related products (same category, excluding current product)
    const [relatedRows] = await db.execute(`
      SELECT
        p.id,
        p.name,
        p.price,
        p.price as base_price,
        b.name as brand_name,
        c.name as category_name,
        COALESCE(p.avg_rating, 0) as avg_rating,
        COALESCE(p.total_raters, 0) as total_raters,
        COALESCE(p.total_sold, 0) as total_sold,
        (SELECT photo_url FROM product_photos WHERE product_id = p.id LIMIT 1) as main_photo
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ? AND p.id != ?
      ORDER BY p.avg_rating DESC, p.total_sold DESC
      LIMIT 8
    `, [product.category_id, productId]);

    // Format related products with photos array
    const relatedProducts = relatedRows.map(relatedProduct => ({
      ...relatedProduct,
      photos: relatedProduct.main_photo ? [{ photo_url: relatedProduct.main_photo }] : []
    }));

    const productDetails = {
      ...product,
      variants: variantRows,
      photos: photoRows,
      related_products: relatedProducts
    };

    res.json({ success: true, data: productDetails });
  } catch (error) {
    console.error('Error in getProductDetails:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductDetails,
  createProduct,
  updateProduct,
  deleteProduct,
  getHighRatingProducts,
  getHighSalesProducts,
  getBestProducts,
  getProductsByPrice,
  getPromoProducts,
  searchProducts,
  getProductsByCategory,
  getProductsByBrand
};
