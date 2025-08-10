const db = require('../db');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

/**
 * Category CRUD Operations
 * Handles all category-related database operations
 */

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM categories ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new category
const createCategory = async (req, res) => {
  try {
    const { name, category_photo } = req.body;

    // Check if category name already exists
    const [existingCategory] = await db.execute('SELECT id FROM categories WHERE name = ?', [name]);
    if (existingCategory.length > 0) {
      return res.status(409).json({ success: false, error: 'Category name already exists' });
    }

    const [result] = await db.execute(
      'INSERT INTO categories (name, category_photo, created_at) VALUES (?, ?, NOW())',
      [name, category_photo || null]
    );
    res.status(201).json({ success: true, id: result.insertId, message: 'Category created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { name, category_photo } = req.body;

    // Check if category name already exists (excluding current category)
    const [existingCategory] = await db.execute('SELECT id FROM categories WHERE name = ? AND id != ?', [name, req.params.id]);
    if (existingCategory.length > 0) {
      return res.status(409).json({ success: false, error: 'Category name already exists' });
    }

    const [result] = await db.execute(
      'UPDATE categories SET name = ?, category_photo = ? WHERE id = ?',
      [name, category_photo || null, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, message: 'Category updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    // Check if category is being used by any products
    const [products] = await db.execute('SELECT id FROM products WHERE category_id = ?', [req.params.id]);
    if (products.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Cannot delete category as it is being used by products'
      });
    }

    const [result] = await db.execute('DELETE FROM categories WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Upload category image with WebP conversion
const uploadCategoryImage = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    // Check if category exists
    const [categoryCheck] = await db.execute('SELECT id FROM categories WHERE id = ?', [categoryId]);
    if (categoryCheck.length === 0) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    // Validate file
    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({ success: false, error: 'File must be an image' });
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return res.status(400).json({ success: false, error: 'File too large (max 10MB)' });
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', 'categories');
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const filename = `category_${categoryId}_${timestamp}_${randomString}.webp`;
    const filePath = path.join(uploadsDir, filename);
    const publicUrl = `/uploads/categories/${filename}`;

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
      'UPDATE categories SET category_photo = ? WHERE id = ?',
      [publicUrl, categoryId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({
      success: true,
      data: {
        category_photo: publicUrl
      },
      message: 'Category image uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading category image:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage
};
