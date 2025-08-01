import { UserApiService } from '../../lib/UserApiService.js';
import { TopNavigationBar } from '../../components/TopNavigationBar.js';
import { BottomNavigationBar } from '../../components/BottomNavigationBar.js';
import { Footer } from '../../components/Footer.js';
import '../../styles/components/DetailPage.css';

class DetailPage {
  constructor() {
    this.UserApiService = new UserApiService();
    this.selectedVariant = null;
    this.selectedImage = 0;
    this.container = null;
    this.product = null;
    this.relatedProducts = [];
  }

  async render(container) {
    this.container = container;
    container.innerHTML = this.getHTML();
    this.setUpNavigation();
    this.bindEvents();
    await this.loadProductData();
    await this.loadRelatedProducts();
  }

  setUpNavigation() {
    document.getElementById('top-bar').innerHTML = TopNavigationBar();
    document.getElementById('bottom-bar').innerHTML = BottomNavigationBar();
    document.getElementById('footer').innerHTML = Footer();
  }

  getHTML() {
    return `
      <div id="top-bar"></div>
      <div class="detail-page">
        <main class="detail-main">
          <!-- Product Container -->
          <div class="product-container" id="product-container">
            <div class="loading-container">
              <div class="loading-spinner"></div>
              <p>Loading product details...</p>
            </div>
          </div>

          <!-- Related Products Section -->
          <div class="related-products-section">
            <h2 class="section-title">Produk Terkait</h2>
            <div class="related-products-grid" id="related-products">
              <div class="loading-text">Loading related products...</div>
            </div>
          </div>
        </main>
      </div>
      <div id="footer"></div>
      <div id="bottom-bar"></div>
    `;
  }

  // ===== DATA LOADING METHODS =====
  
  getProductId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || window.location.pathname.split('/').pop();
  }

  async loadProductData() {
    const container = document.getElementById('product-container');
    this.showProductSkeleton(container);

    try {
      const productId = this.getProductId();
      
      if (!productId) {
        throw new Error('Product ID not found');
      }

      const response = await this.UserApiService.get(`/products/${productId}`);
      this.product = response.data;

      if (!this.product) {
        container.innerHTML = this.getNotFoundHTML();
        return;
      }

      // Set default variant
      if (this.product.variants && this.product.variants.length > 0) {
        this.selectedVariant = this.product.variants[0].name;
      }

      this.renderProductDetails(container);
      this.bindProductEvents();

    } catch (error) {
      console.error('Error loading product:', error);
      container.innerHTML = this.getErrorHTML(error.message);
    }
  }

  async loadRelatedProducts() {
    const container = document.getElementById('related-products');
    container.innerHTML = '<div class="loading-text">Loading related products...</div>';

    try {
      const productId = this.getProductId();
      const response = await this.UserApiService.get(`/products/${productId}/related`);
      this.relatedProducts = response.data || [];

      if (this.relatedProducts.length === 0) {
        container.innerHTML = '<p class="no-data-text">No related products found</p>';
        return;
      }

      this.renderRelatedProducts(container);
      this.bindRelatedProductEvents();

    } catch (error) {
      console.error('Error loading related products:', error);
      container.innerHTML = '<p class="error-text">Failed to load related products</p>';
    }
  }

  // ===== SKELETON & LOADING STATES =====

  showProductSkeleton(container) {
    container.innerHTML = `
      <div class="product-skeleton">
        <div class="product-images-skeleton">
          <div class="main-image-skeleton"></div>
          <div class="thumbnails-skeleton">
            <div class="thumbnail-skeleton"></div>
            <div class="thumbnail-skeleton"></div>
            <div class="thumbnail-skeleton"></div>
          </div>
        </div>
        <div class="product-info-skeleton">
          <div class="title-skeleton"></div>
          <div class="rating-skeleton"></div>
          <div class="price-skeleton"></div>
          <div class="description-skeleton"></div>
        </div>
      </div>
    `;
  }

  // ===== RENDER METHODS =====

  renderProductDetails(container) {
    if (!this.product) return;

    container.innerHTML = `
      <div class="product-images">
        <div class="main-image">
          <img src="${this.getCurrentImage()}" 
               alt="${this.product.name}" 
               class="product-main-img" />
        </div>
        ${this.renderThumbnails()}
      </div>

      <div class="product-info">
        <h1 class="product-title">${this.product.name}</h1>
        
        <div class="product-rating">
          <div class="stars">${this.renderStars(this.product.rating || 0)}</div>
          <span class="rating-text">${this.product.rating || 0}</span>
          <span class="sold-text">Terjual ${this.product.sold_count || 0}+</span>
        </div>

        <div class="product-price">
          <span class="price">Rp ${this.formatPrice(this.product.price)}</span>
          <button class="wishlist-btn" id="wishlist-btn">
            <span class="heart">❤️</span>
          </button>
        </div>

        <div class="stock-info">
          <span class="stock-text">
            Stock: ${this.product.stock > 0 ? this.product.stock : 'Out of Stock'}
          </span>
        </div>

        ${this.renderVariantsSection()}

        <div class="description-section">
          <h3 class="description-title">Deskripsi</h3>
          <p class="brand-info">Brand: ${this.product.brand_name || 'Unknown'}</p>
          <p class="description-text">${this.product.description || 'No description available'}</p>
        </div>

        <div class="action-buttons">
          <button class="add-to-cart-btn" id="add-to-cart-btn" 
                  ${this.product.stock === 0 ? 'disabled' : ''}>
            ${this.product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <button class="buy-now-btn" id="buy-now-btn" 
                  ${this.product.stock === 0 ? 'disabled' : ''}>
            ${this.product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
          </button>
        </div>
      </div>
    `;
  }

  renderRelatedProducts(container) {
    container.innerHTML = this.relatedProducts.map(product => `
      <div class="related-card" data-product-id="${product.id}">
        <div class="related-image">
          <img src="${product.image_url || product.thumbnail || this.getPlaceholderImage()}" 
               alt="${product.name}" 
               loading="lazy" />
        </div>
        <div class="related-info">
          <h4 class="related-name">${product.name}</h4>
          <div class="related-price">Rp ${this.formatPrice(product.price)}</div>
          <div class="related-rating">
            <span class="related-stars">${this.renderStars(product.rating || 0)}</span>
            <span class="related-sold">Terjual ${product.sold_count || 0}+</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderThumbnails() {
    if (!this.product.photos || this.product.photos.length <= 1) {
      return '<div class="thumbnail-images"></div>';
    }
    
    const thumbnails = this.product.photos.slice(1).map((photo, index) => `
      <div class="thumbnail ${this.selectedImage === index + 1 ? 'active' : ''}" 
           data-index="${index + 1}">
        <img src="${photo.image_url || this.getPlaceholderImage()}" 
             alt="${this.product.name} ${index + 2}" 
             loading="lazy" />
      </div>
    `).join('');

    return `<div class="thumbnail-images">${thumbnails}</div>`;
  }

  renderVariantsSection() {
    if (!this.product.variants || this.product.variants.length === 0) {
      return '';
    }
    
    const variants = this.product.variants.map(variant => `
      <button class="variant-btn ${this.selectedVariant === variant.name ? 'active' : ''} ${!variant.available ? 'disabled' : ''}"
              data-variant="${variant.name}"
              data-variant-id="${variant.id}"
              ${!variant.available ? 'disabled' : ''}>
        <div class="variant-icon ${variant.color || 'default'}"></div>
        <span>${variant.name}</span>
        ${variant.stock <= 5 && variant.stock > 0 ? 
          `<small class="stock-warning">Stock: ${variant.stock}</small>` : ''}
      </button>
    `).join('');

    return `
      <div class="variants-section">
        <h3 class="variants-title">Varian:</h3>
        <div class="variants-container">${variants}</div>
      </div>
    `;
  }

  renderStars(rating) {
    let stars = '';
    for (let i = 0; i < 5; i++) {
      const isFilled = i < Math.floor(rating);
      stars += `<span class="star ${isFilled ? 'filled' : ''}">★</span>`;
    }
    return stars;
  }

  // ===== ERROR & NOT FOUND STATES =====

  getNotFoundHTML() {
    return `
      <div class="error-container">
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist or has been removed.</p>
        <button onclick="window.history.back()" class="back-btn">Go Back</button>
      </div>
    `;
  }

  getErrorHTML(message) {
    return `
      <div class="error-container">
        <h2>Error Loading Product</h2>
        <p>${message}</p>
        <button onclick="window.location.reload()" class="retry-btn">Try Again</button>
        <button onclick="window.history.back()" class="back-btn">Go Back</button>
      </div>
    `;
  }

  // ===== EVENT BINDING =====

  bindEvents() {
    // Navigation events
    const navLinks = document.querySelectorAll('.nav-links a');
    const currentPath = window.location.pathname;

    navLinks.forEach(link => {
      if (link.getAttribute('href') === currentPath) {
        link.classList.add('active');
      }
    });

    const bottomLinks = document.querySelectorAll(".bottom-nav a");
    bottomLinks.forEach(link => {
      if (link.getAttribute("data-path").toLowerCase() === currentPath) {
        link.classList.add("active");
      }
    });
  }

  bindProductEvents() {
    // Thumbnail events
    document.querySelectorAll('.thumbnail').forEach(thumbnail => {
      thumbnail.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        this.handleThumbnailClick(index);
      });
    });

    // Variant events
    document.querySelectorAll('.variant-btn:not(.disabled)').forEach(button => {
      button.addEventListener('click', (e) => {
        const variant = e.currentTarget.dataset.variant;
        this.handleVariantClick(variant);
      });
    });

    // Action button events
    const wishlistBtn = document.getElementById('wishlist-btn');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const buyNowBtn = document.getElementById('buy-now-btn');

    if (wishlistBtn) {
      wishlistBtn.addEventListener('click', () => this.handleWishlistClick());
    }

    if (addToCartBtn && !addToCartBtn.disabled) {
      addToCartBtn.addEventListener('click', () => this.handleAddToCart());
    }

    if (buyNowBtn && !buyNowBtn.disabled) {
      buyNowBtn.addEventListener('click', () => this.handleBuyNow());
    }
  }

  bindRelatedProductEvents() {
    document.querySelectorAll('.related-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const productId = e.currentTarget.dataset.productId;
        this.handleRelatedProductClick(productId);
      });
    });
  }

  // ===== EVENT HANDLERS =====

  handleThumbnailClick(index) {
    this.selectedImage = index;
    const mainImg = document.querySelector('.product-main-img');
    
    if (mainImg && this.product.photos && this.product.photos[index]) {
      mainImg.src = this.product.photos[index].image_url || this.getPlaceholderImage();
    }
    
    // Update thumbnail active state
    document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
      thumb.classList.toggle('active', i === index - 1);
    });
  }

  handleVariantClick(variant) {
    this.selectedVariant = variant;
    
    // Update variant active state
    document.querySelectorAll('.variant-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.variant === variant);
    });
  }

  async handleWishlistClick() {
    try {
      await this.UserApiService.post('/wishlist', {
        product_id: this.product.id
      });
      
      const wishlistBtn = document.getElementById('wishlist-btn');
      wishlistBtn.classList.add('added');
      this.showSuccessMessage('Added to wishlist');
      
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      this.showErrorMessage('Failed to add to wishlist');
    }
  }

  async handleAddToCart() {
    try {
      const selectedVariantId = this.getSelectedVariantId();
      
      await this.UserApiService.post('/cart', {
        product_id: this.product.id,
        variant_id: selectedVariantId,
        quantity: 1
      });
      
      this.showSuccessMessage('Added to cart');
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      this.showErrorMessage('Failed to add to cart');
    }
  }

  handleBuyNow() {
    const selectedVariantId = this.getSelectedVariantId();
    window.location.href = `/checkout?product_id=${this.product.id}&variant_id=${selectedVariantId}&quantity=1`;
  }

  handleRelatedProductClick(id) {
    window.location.href = `/product-detail?id=${id}`;
  }

  // ===== UTILITY METHODS =====

  getCurrentImage() {
    if (!this.product.photos || this.product.photos.length === 0) {
      return this.getPlaceholderImage();
    }
    return this.product.photos[this.selectedImage]?.image_url || this.getPlaceholderImage();
  }

  getSelectedVariantId() {
    if (!this.selectedVariant || !this.product.variants) return null;
    const variant = this.product.variants.find(v => v.name === this.selectedVariant);
    return variant ? variant.id : null;
  }

  formatPrice(price) {
    return price ? price.toLocaleString('id-ID') : '0';
  }

  getPlaceholderImage() {
    return 'https://via.placeholder.com/400x400/f5f5f5/666666?text=No+Image';
  }

  showSuccessMessage(message) {
    // Implementation for success toast/notification
    console.log('Success:', message);
  }

  showErrorMessage(message) {
    // Implementation for error toast/notification
    console.log('Error:', message);
  }
}

export default DetailPage;