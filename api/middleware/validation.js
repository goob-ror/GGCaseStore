const { body, param, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Common validation rules
const validateId = [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer')
];

const validateProductId = [
  param('productId').isInt({ min: 1 }).withMessage('Product ID must be a positive integer')
];

// Admin validation rules
const validateAdmin = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('password_hash')
    .isLength({ min: 1 })
    .withMessage('Password hash is required')
];

// Brand validation rules
const validateBrand = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Brand name must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-&.]+$/)
    .withMessage('Brand name contains invalid characters'),
  body('brand_photo')
    .optional()
    .isURL()
    .withMessage('Brand photo must be a valid URL')
];

// Category validation rules
const validateCategory = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category name must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-&.]+$/)
    .withMessage('Category name contains invalid characters'),
  body('category_photo')
    .optional()
    .isURL()
    .withMessage('Category photo must be a valid URL')
];

// Product validation rules
const validateProduct = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Product name must be between 1 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters'),
  body('brand_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Brand ID must be a positive integer'),
  body('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer')
];

// Product variant validation rules
const validateVariant = [
  body('variant_name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Variant name must be between 1 and 100 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
    .custom((value) => {
      // Check if price has at most 2 decimal places
      if (!/^\d+(\.\d{1,2})?$/.test(value.toString())) {
        throw new Error('Price must have at most 2 decimal places');
      }
      return true;
    })
];

// Product photo validation rules
const validatePhoto = [
  body('photo_url')
    .isURL()
    .withMessage('Photo URL must be a valid URL')
    .matches(/\.(jpg|jpeg|png|gif|webp)$/i)
    .withMessage('Photo URL must point to a valid image file (jpg, jpeg, png, gif, webp)')
];

// Rating validation rules
const validateRating = [
  body('star')
    .isInt({ min: 1, max: 5 })
    .withMessage('Star rating must be an integer between 1 and 5'),
  body('review_text')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Review text must not exceed 2000 characters')
];

// Web banner validation rules
const validateBanner = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),
  body('banner_image_url')
    .optional()
    .isURL()
    .withMessage('Banner image URL must be a valid URL'),
  body('redirect_url')
    .optional()
    .isURL()
    .withMessage('Redirect URL must be a valid URL'),
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be a boolean value')
];

module.exports = {
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
};
