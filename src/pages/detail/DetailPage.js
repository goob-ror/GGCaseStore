import { UserApiService } from '../../lib/UserApiService.js';
import { TopNavigationBar, initializeTopNavigationSearch } from '../../components/TopNavigationBar.js';
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

    // Initialize search functionality
    initializeTopNavigationSearch();
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
            <div class="related-products-container">
              <h2 class="related-title">Produk Terkait</h2>
              <div class="related-grid" id="related-products">
                <div class="loading-text">Loading related products...</div>
              </div>
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
    // Handle hash-based routing from catalog page
    const hash = window.location.hash;

    if (hash.includes('/detail/')) {
      const productId = hash.split('/detail/')[1];
      if (productId && productId !== 'detail' && productId.trim() !== '') {
        return productId.trim();
      }
    }

    // Fallback to query params
    const urlParams = new URLSearchParams(window.location.search);
    const queryId = urlParams.get('id');
    if (queryId) {
      return queryId;
    }

    // Last fallback - check if there's a path parameter
    const pathParts = window.location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    if (lastPart && lastPart !== 'detail' && !isNaN(lastPart)) {
      return lastPart;
    }

    return null;
  }

  async loadProductData() {
    const container = document.getElementById('product-container');
    this.showProductSkeleton(container);

    try {
      const productId = this.getProductId();

      if (!productId) {
        throw new Error('Product ID not found');
      }

      const response = await this.UserApiService.get(`/products/${productId}/details`);
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
      // Related products are now included in the main product details response
      if (this.product?.related_products && this.product.related_products.length > 0) {
        this.relatedProducts = this.product.related_products;

        this.renderRelatedProducts(container);
        this.bindRelatedProductEvents();
      } else {
        container.innerHTML = '<p class="no-data-text">Produk terkait tidak ditemukan.</p>';
      }

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
      <div class="detail-header">
        <button class="back-btn" id="back-btn">
          <i class="fas fa-arrow-left"></i>
        </button>
      </div>

      <div class="product-detail-container">
        <div class="product-images-section">
          <div class="main-image-container">
            <img src="${this.getCurrentImage()}"
                 alt="${this.product.name}"
                 class="product-main-img" />
          </div>
          ${this.renderThumbnails()}
        </div>

        <div class="product-info-section">
          <div class="product-header">
            <div class="title-rating">
              <h1 class="product-title">${this.product.name}</h1>
              <div class="product-rating">
                <div class="stars filled">★ </div>
                <span class="rating-text">${this.product.avg_rating ? this.product.avg_rating.toFixed(1) : '0.0'}</span>
                <span class="rating-count">Terjual ${this.product.total_sold || 0}+</span>
              </div>
            </div>
          </div>

          <div class="price-section">
          <div class="price-container">
            <span class="price">${this.formatPrice(this.product.price)}</span>
            <button class="wishlist-btn ${this.isInWishlist() ? 'added' : ''}" id="wishlist-btn">
              <i class="fas fa-heart"></i>
            </button>
          </div>
        </div>

          ${this.renderVariantsSection()}

          <div class="description-section">
            <h3 class="description-title">Deskripsi</h3>
            <div class="brand-info">Brand: <strong>${this.product.brand_name || 'Unknown'}</strong></div>
            <div class="category-info">Category: <strong>${this.product.category_name || 'Unknown'}</strong></div>
            <div class="description-text">${this.formatDescription(this.product.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.')}</div>
          </div>
        </div>
      </div>
    `;
  }

  renderRelatedProducts(container) {
    container.innerHTML = this.relatedProducts.map(product => `
      <div class="related-card" data-product-id="${product.id}">
        <div class="related-image">
          <img src="${this.getProductImage(product)}"
               alt="${product.name}"
               loading="lazy" />
        </div>
        <div class="related-info">
          <h4 class="related-name">${product.name}</h4>
          <div class="related-price">${this.formatPrice(product.price)}</div>
          <div class="related-rating">
            <span class="related-stars">${this.renderStars(product.avg_rating || 0)}</span>
            <span class="related-sold">Terjual ${product.total_sold || 0}+</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderThumbnails() {
    if (!this.product.photos || this.product.photos.length === 0) {
      return '<div class="thumbnail-images"></div>';
    }

    // Display ALL product images in a simple scrollable container
    const thumbnails = this.product.photos.map((photo, index) => `
      <div class="thumbnail ${this.selectedImage === index ? 'active' : ''}"
           data-index="${index}">
        <img src="${photo.photo_url || this.getPlaceholderImage()}"
             alt="${this.product.name} ${index + 1}"
             loading="lazy" />
      </div>
    `).join('');

    return `
      <div class="thumbnail-images">
        <div class="thumbnail-container">
          ${thumbnails}
        </div>
      </div>
    `;
  }

  renderVariantsSection() {
    if (!this.product.variants || this.product.variants.length === 0) {
      return '';
    }

    const variantsHTML = this.product.variants
      .map(variant => {
        const name = variant.name || variant.variant_name || 'Unknown';
        return `<div class="variant-box">${name}</div>`;
      })
      .join('');

    return `
      <div class="variants-section">
        <div class="variants-title">Varian:</div>
        <div class="variants-container">
          ${variantsHTML}
        </div>
      </div>
    `;
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
    // Navigation events - highlight Katalog for detail pages
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
      // Remove any existing active class
      link.classList.remove('active');
      // Add active class to Katalog link since this is a product detail page
      if (link.getAttribute('href') === '/katalog') {
        link.classList.add('active');
      }
    });

    const bottomLinks = document.querySelectorAll(".bottom-nav a");
    bottomLinks.forEach(link => {
      // Remove any existing active class
      link.classList.remove('active');
      // Add active class to Katalog link
      if (link.getAttribute("data-path") === '/katalog') {
        link.classList.add("active");
      }
    });
  }

  bindProductEvents() {
    // Back button
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.history.back();
      });
    }

    // Thumbnail events
    document.querySelectorAll('.thumbnail').forEach(thumbnail => {
      thumbnail.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        this.handleThumbnailClick(index);
      });
    });

    // Variant events - updated for new class name
    document.querySelectorAll('.variant-option').forEach(button => {
      button.addEventListener('click', (e) => {
        const variantId = e.currentTarget.dataset.variantId;
        const variantName = e.currentTarget.dataset.variantName;
        this.handleVariantClick(variantId, variantName);
      });
    });

    // Action button events
    const wishlistBtn = document.getElementById('wishlist-btn');
    if (wishlistBtn) {
      wishlistBtn.addEventListener('click', () => this.handleWishlistClick());
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
      mainImg.src = this.product.photos[index].photo_url || this.getPlaceholderImage();
    }

    // Update thumbnail active state - now all images are included, so index matches directly
    document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
      thumb.classList.toggle('active', i === index);
    });
  }

  handleVariantClick(variantId, variantName) {
    this.selectedVariant = variantId;

    // Update variant active state
    document.querySelectorAll('.variant-option').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.variantId === variantId);
    });
  }

  async handleWishlistClick() {
    try {
      const wishlistBtn = document.getElementById('wishlist-btn');
      const isCurrentlyInWishlist = this.isInWishlist();

      if (isCurrentlyInWishlist) {
        // Remove from wishlist
        this.removeFromWishlist();
        wishlistBtn.classList.remove('added');
        this.showSuccessMessage('Removed from wishlist');
      } else {
        // Add to wishlist
        this.addToWishlist();
        wishlistBtn.classList.add('added');
        this.showSuccessMessage('Added to wishlist');
      }

    } catch (error) {
      console.error('Error handling wishlist:', error);
      this.showErrorMessage('Failed to update wishlist');
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
    window.location.hash = `#/detail/${id}`;
  }

  // ===== UTILITY METHODS =====
  getCurrentImage() {
    if (!this.product.photos || this.product.photos.length === 0) {
      return this.getPlaceholderImage();
    }
    // API returns photos with 'photo_url' field, not 'image_url'
    return this.product.photos[this.selectedImage]?.photo_url || this.getPlaceholderImage();
  }

  getProductImage(product) {
    // Get the first photo from the product's photos array, or use placeholder
    if (product.photos && product.photos.length > 0) {
      return product.photos[0].photo_url || this.getPlaceholderImage();
    }
    return this.getPlaceholderImage();
  }

  getSelectedVariantId() {
    if (!this.selectedVariant || !this.product.variants) return null;
    const variant = this.product.variants.find(v => v.name === this.selectedVariant);
    return variant ? variant.id : null;
  }

  formatPrice(price) {
    if (!price) return '0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  formatDescription(description) {
    if (!description) return 'No description available';

    // Convert \n to <br> tags for line breaks
    return description.replace(/\n/g, '<br>');
  }

  renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let starsHTML = '';

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      starsHTML += '★';
    }

    // Half star
    if (hasHalfStar) {
      starsHTML += '☆';
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      starsHTML += '☆';
    }

    return starsHTML;
  }

  getPlaceholderImage() {
    return 'https://via.placeholder.com/400x400/f5f5f5/666666?text=No+Image';
  }

  // ===== WISHLIST MANAGEMENT =====

  getWishlistKey() {
    return 'wishlist';
  }

  getWishlist() {
    try {
      const wishlist = localStorage.getItem(this.getWishlistKey());
      return wishlist ? JSON.parse(wishlist) : [];
    } catch (error) {
      console.error('Error reading wishlist from localStorage:', error);
      return [];
    }
  }

  saveWishlist(wishlist) {
    try {
      localStorage.setItem(this.getWishlistKey(), JSON.stringify(wishlist));
    } catch (error) {
      console.error('Error saving wishlist to localStorage:', error);
    }
  }

  isInWishlist() {
    if (!this.product) return false;
    const wishlist = this.getWishlist();
    return wishlist.some(item => item.id === this.product.id);
  }

  addToWishlist() {
    if (!this.product) return;

    const wishlist = this.getWishlist();

    // Check if already in wishlist
    if (wishlist.some(item => item.id === this.product.id)) {
      return;
    }

    // Add product with data structure matching wishlist page expectations
    const wishlistItem = {
      id: this.product.id,
      title: this.product.name, // wishlist page expects 'title'
      name: this.product.name,
      price: this.formatPrice(this.product.price), // formatted price with currency
      image: this.getCurrentImage(),
      brand_name: this.product.brand_name,
      category_name: this.product.category_name,
      avg_rating: this.product.avg_rating || 0,
      total_sold: this.product.total_sold || 0,
      stock: this.product.stock || 0,
      addedAt: new Date().toISOString()
    };

    wishlist.push(wishlistItem);
    this.saveWishlist(wishlist);
  }

  removeFromWishlist() {
    if (!this.product) return;

    const wishlist = this.getWishlist();
    const updatedWishlist = wishlist.filter(item => item.id !== this.product.id);
    this.saveWishlist(updatedWishlist);
  }

  showSuccessMessage(message) {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.className = 'toast-notification success';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10000;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  showErrorMessage(message) {
    // Create a simple error toast notification
    const toast = document.createElement('div');
    toast.className = 'toast-notification error';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10000;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }
}

export default DetailPage;