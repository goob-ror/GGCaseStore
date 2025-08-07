const db = require('../db');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

/**
 * Web Banner CRUD Operations
 * Handles all web banner-related database operations
 */

// Get all web banners
const getAllBanners = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT *,
      CASE 
        WHEN active = 1 
        AND (start_date IS NULL OR start_date <= NOW())
        AND (end_date IS NULL OR end_date >= NOW())
        THEN 1 
        ELSE 0 
      END AS is_currently_active,
      CASE 
        WHEN start_date IS NOT NULL AND start_date > NOW() THEN 'scheduled'
        WHEN end_date IS NOT NULL AND end_date < NOW() THEN 'expired'
        WHEN active = 0 THEN 'inactive'
        ELSE 'active'
      END AS status
      FROM web_banners 
      ORDER BY created_at DESC
    `);

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get active web banners only
const getActiveBanners = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT *,
      CASE 
        WHEN start_date IS NOT NULL AND start_date > NOW() THEN 'scheduled'
        WHEN end_date IS NOT NULL AND end_date < NOW() THEN 'expired'
        ELSE 'active'
      END AS status
      FROM web_banners 
      WHERE active = true 
      AND (start_date IS NULL OR start_date <= NOW())
      AND (end_date IS NULL OR end_date >= NOW())
      ORDER BY created_at DESC
    `);
    
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new banner
const createBanner = async (req, res) => {
  try {
    const { title, banner_image_url, redirect_url, active = true, start_date, end_date } = req.body;
    
    // Validate dates
    if (start_date && end_date && new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({ 
        success: false, 
        message: 'End date must be after start date' 
      });
    }
    
    const [result] = await db.execute(
      'INSERT INTO web_banners (title, banner_image_url, redirect_url, active, start_date, end_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [title || null, banner_image_url || null, redirect_url || null, active, start_date || null, end_date || null]
    );
    
    res.status(201).json({ success: true, id: result.insertId, message: 'Banner created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update banner
const updateBanner = async (req, res) => {
  try {
    const { title, banner_image_url, redirect_url, active, start_date, end_date } = req.body;
    
    // Validate dates
    if (start_date && end_date && new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({ 
        success: false, 
        message: 'End date must be after start date' 
      });
    }
    
    const [result] = await db.execute(
      'UPDATE web_banners SET title = ?, banner_image_url = ?, redirect_url = ?, active = ?, start_date = ?, end_date = ?, updated_at = NOW() WHERE id = ?',
      [title || null, banner_image_url || null, redirect_url || null, active, start_date || null, end_date || null, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    
    res.json({ success: true, message: 'Banner updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Activate banner
const activateBanner = async (req, res) => {
  try {
    const [result] = await db.execute(
      'UPDATE web_banners SET active = TRUE, updated_at = NOW() WHERE id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    res.json({ success: true, message: 'Banner activated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Deactivate banner
const deactivateBanner = async (req, res) => {
  try {
    const [result] = await db.execute(
      'UPDATE web_banners SET active = FALSE, updated_at = NOW() WHERE id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    res.json({ success: true, message: 'Banner deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete banner
const deleteBanner = async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM web_banners WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    res.json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Upload banner images with WebP conversion
const uploadBannerImages = async (req, res) => {
  try {
    const bannerId = req.params.id;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }

    // Check if banner exists
    const [bannerCheck] = await db.execute('SELECT id FROM web_banners WHERE id = ?', [bannerId]);
    if (bannerCheck.length === 0) {
      return res.status(404).json({ success: false, error: 'Banner not found' });
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads', 'banners');
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    const uploadedImages = [];
    const errors = [];

    for (let i = 0; i < Math.min(files.length, 2); i++) {
      const file = files[i];

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
        const filename = `banner_${bannerId}_${i + 1}_${timestamp}_${randomString}.webp`;
        const filePath = path.join(uploadsDir, filename);
        const publicUrl = `/uploads/banners/${filename}`;

        // Process and convert to WebP
        await sharp(file.buffer)
          .resize(1200, 400, {
            fit: 'cover',
            position: 'center'
          })
          .webp({ quality: 85 })
          .toFile(filePath);

        uploadedImages.push({
          index: i + 1,
          url: publicUrl,
          originalName: file.originalname
        });

      } catch (error) {
        console.error(`Error processing ${file.originalname}:`, error);
        errors.push(`${file.originalname}: Processing failed`);
      }
    }

    // Update database with first image as banner_image_url
    if (uploadedImages.length > 0) {
      const [result] = await db.execute(
        'UPDATE web_banners SET banner_image_url = ? WHERE id = ?',
        [uploadedImages[0].url, bannerId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Banner not found' });
      }
    }

    res.json({
      success: true,
      data: {
        uploaded: uploadedImages,
        errors: errors.length > 0 ? errors : undefined
      },
      message: `${uploadedImages.length} banner images uploaded successfully`
    });

  } catch (error) {
    console.error('Error uploading banner images:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllBanners,
  getActiveBanners,
  createBanner,
  updateBanner,
  activateBanner,
  deactivateBanner,
  deleteBanner,
  uploadBannerImages
};
