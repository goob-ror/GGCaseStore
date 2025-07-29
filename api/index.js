const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const db = require('./db');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const {
  generalLimiter,
  strictLimiter,
  adminLimiter,
  adminLoginLimiter,
  ratingLimiter,
  testLimiter
} = require('./middleware/rateLimiter');
const {
  handleValidationErrors,
  validateId,
  validateProductId,
  validateAdmin,
  validateBrand,
  validateCategory,
  validateProduct,
  validateVariant,
  validatePhoto,
  validateRating,
  validateBanner
} = require('./middleware/validation');
const { requireAdmin, optionalAdmin } = require('./middleware/auth');

// Import CRUD modules
const adminCRUD = require('./database/adminCRUD');
const adminSession = require('./database/adminSession');
const brandCRUD = require('./database/brandCRUD');
const categoryCRUD = require('./database/categoryCRUD');
const productCRUD = require('./database/productCRUD');
const variantCRUD = require('./database/variantCRUD');
const photoCRUD = require('./database/photoCRUD');
const ratingCRUD = require('./database/ratingCRUD');
const bannerCRUD = require('./database/bannerCRUD');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server and Socket.IO
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    credentials: true
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available to other modules
app.set('io', io);

// Security Middleware
app.use(helmet()); // Set security headers
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));
app.use(generalLimiter); // Apply general rate limiting to all requests
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
    //secure: true; use if using https
  }
}));

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Max 10 files per request
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

// Test database connection
app.get('/api/test-db', testLimiter, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT 1 as test');
    res.json({
      success: true,
      message: 'Database connection successful',
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database connection failed',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'GG Catalog API'
  });
});

// ===== ADMIN ROUTES =====

// Admin login
app.post('/api/admin/login', adminLoginLimiter, adminSession.adminLogin);

// Admin logout
app.post('/api/admin/logout', adminLimiter, adminSession.adminLogout);

// Admin session check
app.get('/api/admin/session', adminLimiter, adminSession.checkSession);

// Get all admins (admin only)
app.get('/api/admins', adminLimiter, requireAdmin, adminCRUD.getAllAdmins);

// Create new admin (admin only)
app.post('/api/admins', adminLimiter, requireAdmin, validateAdmin, handleValidationErrors, adminCRUD.createAdmin);

// ===== BRAND ROUTES =====

// Get all brands (public)
app.get('/api/brands', brandCRUD.getAllBrands);

// Get brand by ID (public)
app.get('/api/brands/:id', validateId, handleValidationErrors, brandCRUD.getBrandById);

// Create new brand (admin only)
app.post('/api/brands', strictLimiter, requireAdmin, validateBrand, handleValidationErrors, brandCRUD.createBrand);

// Update brand (admin only)
app.put('/api/brands/:id', strictLimiter, requireAdmin, validateId, validateBrand, handleValidationErrors, brandCRUD.updateBrand);

// Delete brand (admin only)
app.delete('/api/brands/:id', strictLimiter, requireAdmin, validateId, handleValidationErrors, brandCRUD.deleteBrand);

// ===== CATEGORY ROUTES =====

// Get all categories (public)
app.get('/api/categories', categoryCRUD.getAllCategories);

// Get category by ID (public)
app.get('/api/categories/:id', validateId, handleValidationErrors, categoryCRUD.getCategoryById);

// Create new category (admin only)
app.post('/api/categories', strictLimiter, requireAdmin, validateCategory, handleValidationErrors, categoryCRUD.createCategory);

// Update category (admin only)
app.put('/api/categories/:id', strictLimiter, requireAdmin, validateId, validateCategory, handleValidationErrors, categoryCRUD.updateCategory);

// Delete category (admin only)
app.delete('/api/categories/:id', strictLimiter, requireAdmin, validateId, handleValidationErrors, categoryCRUD.deleteCategory);

// ===== PRODUCT ROUTES =====

// Get all products with brand and category info (public)
app.get('/api/products', productCRUD.getAllProducts);

// Get product by ID with variants and photos (public)
app.get('/api/products/:id', productCRUD.getProductById);

// Create new product (admin only)
app.post('/api/products', strictLimiter, requireAdmin, productCRUD.createProduct);

// Update product (admin only)
app.put('/api/products/:id', strictLimiter, requireAdmin, productCRUD.updateProduct);

// Delete product (admin only)
app.delete('/api/products/:id', strictLimiter, requireAdmin, productCRUD.deleteProduct);

// ===== PRODUCT VARIANT ROUTES =====

// Get variants for a product (public)
app.get('/api/products/:productId/variants', variantCRUD.getVariantsByProductId);

// Add variant to product (admin only)
app.post('/api/products/:productId/variants', strictLimiter, requireAdmin, variantCRUD.createVariant);

// Update variant (admin only)
app.put('/api/variants/:id', strictLimiter, requireAdmin, variantCRUD.updateVariant);

// Delete variant (admin only)
app.delete('/api/variants/:id', strictLimiter, requireAdmin, variantCRUD.deleteVariant);

// ===== PRODUCT PHOTO ROUTES =====

// Get photos for a product (public)
app.get('/api/products/:productId/photos', photoCRUD.getPhotosByProductId);

// Add photo to product (admin only)
app.post('/api/products/:productId/photos', strictLimiter, requireAdmin, photoCRUD.createPhoto);

// Delete photo (admin only)
app.delete('/api/photos/:id', strictLimiter, requireAdmin, photoCRUD.deletePhoto);

// Upload multiple photos for product (admin only)
app.post('/api/products/:productId/upload-photos', strictLimiter, requireAdmin, upload.array('photos', 10), photoCRUD.uploadProductPhotos);

// ===== RATING ROUTES =====

// Get ratings for a product (public)
app.get('/api/products/:productId/ratings', ratingCRUD.getRatingsByProductId);

// Add rating to product (public - customers can leave reviews)
app.post('/api/products/:productId/ratings', ratingLimiter, validateProductId, validateRating, handleValidationErrors, ratingCRUD.createRating);

// ===== WEB BANNER ROUTES =====

// Get all web banners (public)
app.get('/api/banners', bannerCRUD.getAllBanners);

// Get active web banners only (public)
app.get('/api/banners/active', bannerCRUD.getActiveBanners);

// Create new banner (admin only)
app.post('/api/banners', strictLimiter, requireAdmin, validateBanner, handleValidationErrors, bannerCRUD.createBanner);

// Update banner (admin only)
app.put('/api/banners/:id', strictLimiter, requireAdmin, validateId, validateBanner, handleValidationErrors, bannerCRUD.updateBanner);

// Delete banner (admin only)
app.delete('/api/banners/:id', strictLimiter, requireAdmin, validateId, handleValidationErrors, bannerCRUD.deleteBanner);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 GG Catalog API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 Database test: http://localhost:${PORT}/api/test-db`);
  console.log(`🔌 WebSocket server ready for connections`);
});

module.exports = app;
