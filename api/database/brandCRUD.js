const db = require('../db');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

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

// Upload brand image with WebP conversion
const uploadBrandImage = async (req, res) => {
  try {
    const brandId = req.params.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    // Check if brand exists
    const [brandCheck] = await db.execute('SELECT id FROM brands WHERE id = ?', [brandId]);
    if (brandCheck.length === 0) {
      return res.status(404).json({ success: false, error: 'Brand not found' });
    }

    // Validate file
    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({ success: false, error: 'File must be an image' });
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return res.status(400).json({ success: false, error: 'File too large (max 10MB)' });
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', 'brands');
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const filename = `brand_${brandId}_${timestamp}_${randomString}.webp`;
    const filePath = path.join(uploadsDir, filename);
    const publicUrl = `/uploads/brands/${filename}`;

    // Process and convert to WebP with 1:1 aspect ratio
    await sharp(file.buffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 85 })
      .toFile(filePath);

    // Update database
    const [result] = await db.execute(
      'UPDATE brands SET brand_photo = ? WHERE id = ?',
      [publicUrl, brandId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }

    res.json({
      success: true,
      data: {
        brand_photo: publicUrl
      },
      message: 'Brand image uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading brand image:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
  uploadBrandImage
};