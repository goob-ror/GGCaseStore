/**
 * Webhook utility for emitting real-time events
 */

const emitWebhookEvent = (req, eventType, data) => {
  try {
    const io = req.app.get('io');
    if (io) {
      const event = {
        type: eventType,
        data: data,
        timestamp: new Date().toISOString(),
        userId: req.session?.admin?.id || null
      };
      
      // Emit to all connected admin clients
      io.emit('admin_event', event);
      
      console.log(`📡 Webhook event emitted: ${eventType}`, data);
    }
  } catch (error) {
    console.error('Failed to emit webhook event:', error);
  }
};

// Product events
const emitProductCreated = (req, product) => {
  emitWebhookEvent(req, 'product_created', product);
};

const emitProductUpdated = (req, product) => {
  emitWebhookEvent(req, 'product_updated', product);
};

const emitProductDeleted = (req, productId) => {
  emitWebhookEvent(req, 'product_deleted', { id: productId });
};

// Brand events
const emitBrandCreated = (req, brand) => {
  emitWebhookEvent(req, 'brand_created', brand);
};

const emitBrandUpdated = (req, brand) => {
  emitWebhookEvent(req, 'brand_updated', brand);
};

const emitBrandDeleted = (req, brandId) => {
  emitWebhookEvent(req, 'brand_deleted', { id: brandId });
};

// Category events
const emitCategoryCreated = (req, category) => {
  emitWebhookEvent(req, 'category_created', category);
};

const emitCategoryUpdated = (req, category) => {
  emitWebhookEvent(req, 'category_updated', category);
};

const emitCategoryDeleted = (req, categoryId) => {
  emitWebhookEvent(req, 'category_deleted', { id: categoryId });
};

// Banner events
const emitBannerCreated = (req, banner) => {
  emitWebhookEvent(req, 'banner_created', banner);
};

const emitBannerUpdated = (req, banner) => {
  emitWebhookEvent(req, 'banner_updated', banner);
};

const emitBannerDeleted = (req, bannerId) => {
  emitWebhookEvent(req, 'banner_deleted', { id: bannerId });
};

// Photo events
const emitPhotoUploaded = (req, photos) => {
  emitWebhookEvent(req, 'photo_uploaded', photos);
};

const emitPhotoDeleted = (req, photoId) => {
  emitWebhookEvent(req, 'photo_deleted', { id: photoId });
};

module.exports = {
  emitWebhookEvent,
  emitProductCreated,
  emitProductUpdated,
  emitProductDeleted,
  emitBrandCreated,
  emitBrandUpdated,
  emitBrandDeleted,
  emitCategoryCreated,
  emitCategoryUpdated,
  emitCategoryDeleted,
  emitBannerCreated,
  emitBannerUpdated,
  emitBannerDeleted,
  emitPhotoUploaded,
  emitPhotoDeleted
};
