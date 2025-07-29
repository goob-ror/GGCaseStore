const db = require('../db');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { emitPhotoUploaded, emitPhotoDeleted } = require('../utils/webhooks');

/**
 * Product Photo CRUD Operations
 * Handles all product photo-related database operations
 */

// Get photos for a product
const getPhotosByProductId = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM product_photos WHERE product_id = ?', [req.params.productId]);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add photo to product
const createPhoto = async (req, res) => {
  try {
    const { photo_url } = req.body;
    const [result] = await db.execute(
      'INSERT INTO product_photos (product_id, photo_url) VALUES (?, ?)',
      [req.params.productId, photo_url]
    );
    res.status(201).json({ success: true, id: result.insertId, message: 'Photo added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete photo
const deletePhoto = async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM product_photos WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }
    res.json({ success: true, message: 'Photo deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Upload multiple photos for product with WebP conversion
const uploadProductPhotos = async (req, res) => {
  try {
    const productId = req.params.productId;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }

    // Check if product exists
    const [productCheck] = await db.execute('SELECT id FROM products WHERE id = ?', [productId]);
    if (productCheck.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads', 'products');
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    const uploadedPhotos = [];
    const errors = [];

    for (const file of files) {
      try {
        // Validate file
        if (!file.mimetype.startsWith('image/')) {
          errors.push(`${file.originalname}: Not an image file`);
          continue;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          errors.push(`${file.originalname}: File too large (max 10MB)`);
          continue;
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const filename = `product_${productId}_${timestamp}_${randomString}.webp`;
        const filePath = path.join(uploadsDir, filename);
        const publicUrl = `/uploads/products/${filename}`;

        // Process and convert to WebP
        await sharp(file.buffer)
          .resize(800, 800, {
            fit: 'cover',
            position: 'center'
          })
          .webp({ quality: 85 })
          .toFile(filePath);

        // Save to database
        const [result] = await db.execute(
          'INSERT INTO product_photos (product_id, photo_url) VALUES (?, ?)',
          [productId, publicUrl]
        );

        uploadedPhotos.push({
          id: result.insertId,
          photo_url: publicUrl,
          originalName: file.originalname
        });

      } catch (error) {
        console.error(`Error processing ${file.originalname}:`, error);
        errors.push(`${file.originalname}: Processing failed`);
      }
    }

    // Emit webhook event
    if (uploadedPhotos.length > 0) {
      emitPhotoUploaded(req, { productId, photos: uploadedPhotos });
    }

    res.status(201).json({
      success: true,
      data: {
        uploaded: uploadedPhotos,
        errors: errors.length > 0 ? errors : undefined
      },
      message: `${uploadedPhotos.length} photos uploaded successfully`
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Enhanced delete photo with file cleanup
const deletePhotoEnhanced = async (req, res) => {
  try {
    // Get photo info first
    const [photoRows] = await db.execute('SELECT * FROM product_photos WHERE id = ?', [req.params.id]);
    if (photoRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }

    const photo = photoRows[0];

    // Delete from database
    const [result] = await db.execute('DELETE FROM product_photos WHERE id = ?', [req.params.id]);

    // Delete physical file
    if (photo.photo_url) {
      try {
        const filePath = path.join(__dirname, '..', '..', 'public', photo.photo_url);
        await fs.unlink(filePath);
      } catch (fileError) {
        console.error('Failed to delete physical file:', fileError);
        // Don't fail the request if file deletion fails
      }
    }

    // Emit webhook event
    emitPhotoDeleted(req, parseInt(req.params.id));

    res.json({ success: true, message: 'Photo deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getPhotosByProductId,
  createPhoto,
  deletePhoto: deletePhotoEnhanced,
  uploadProductPhotos
};
