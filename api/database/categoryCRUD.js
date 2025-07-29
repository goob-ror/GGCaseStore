const db = require('../db');

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

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
