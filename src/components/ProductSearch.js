import { UserApiService } from '../lib/UserApiService.js';

/**
 * Product Search Component
 * Provides search functionality for products in the navigation bar
 */
export class ProductSearch {
  constructor(options = {}) {
    this.options = {
      placeholder: 'Cari Barang....',
      searchPlaceholder: 'Cari produk...',
      noResultsText: 'Tidak ada produk ditemukan',
      maxResults: 8,
      debounceDelay: 300,
      ...options
    };
    
    this.userApiService = new UserApiService();
    this.products = [];
    this.filteredProducts = [];
    this.isOpen = false;
    this.searchTimeout = null;
    
    this.onSelect = options.onSelect || this.defaultOnSelect.bind(this);
  }

  /**
   * Create the HTML structure for the product search
   */
  createHTML(containerId) {
    return `
      <div class="product-search" id="${containerId}">
        <div class="search-bar">
          <input 
            type="text" 
            class="search-input" 
            id="${containerId}-input"
            placeholder="${this.options.placeholder}"
            autocomplete="off"
          >
          <button type="button" class="search-btn" id="${containerId}-btn">
            <i class="fas fa-search"></i>
          </button>
        </div>
        
        <div class="search-dropdown" id="${containerId}-dropdown" style="display: none;">
          <div class="search-results" id="${containerId}-results">
            <div class="loading-state">
              <i class="fas fa-spinner fa-spin"></i>
              Mencari produk...
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Initialize the component after HTML is inserted
   */
  initialize(containerId) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.searchInput = document.getElementById(`${containerId}-input`);
    this.searchBtn = document.getElementById(`${containerId}-btn`);
    this.dropdown = document.getElementById(`${containerId}-dropdown`);
    this.resultsContainer = document.getElementById(`${containerId}-results`);

    this.bindEvents();
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Search input with debounce
    this.searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      
      // Clear previous timeout
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      
      if (query.length === 0) {
        this.close();
        return;
      }
      
      // Debounce search
      this.searchTimeout = setTimeout(() => {
        this.searchProducts(query);
      }, this.options.debounceDelay);
    });

    // Search button click
    this.searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const query = this.searchInput.value.trim();
      if (query) {
        this.performSearch(query);
      }
    });

    // Enter key to search
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = this.searchInput.value.trim();
        if (query) {
          this.performSearch(query);
        }
      } else if (e.key === 'Escape') {
        this.close();
      } else {
        this.handleKeyNavigation(e);
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        this.close();
      }
    });

    // Prevent dropdown from closing when clicking inside
    this.dropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  /**
   * Search for products via API
   */
  async searchProducts(query) {
    try {
      this.showLoading();
      this.open();
      
      const response = await this.userApiService.get('/products/search', {
        q: query,
        limit: this.options.maxResults
      });
      
      if (response.success) {
        this.products = response.data || [];
        this.renderResults();
      } else {
        this.showError('Gagal mencari produk');
      }
    } catch (error) {
      console.error('Error searching products:', error);
      this.showError('Terjadi kesalahan saat mencari produk');
    }
  }

  /**
   * Render search results
   */
  renderResults() {
    if (this.products.length === 0) {
      this.resultsContainer.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search"></i>
          <span>${this.options.noResultsText}</span>
        </div>
      `;
      return;
    }

    const resultsHTML = this.products.map(product => `
      <div class="search-result-item" data-id="${product.id}" data-name="${product.name}">
        <div class="result-image">
          <img src="${product.photos?.[0]?.photo_url}" 
               alt="${this.escapeHtml(product.name)}">
        </div>
        <div class="result-content">
          <div class="result-name">${this.escapeHtml(product.name)}</div>
          <div class="result-meta">
            <span class="result-brand">${this.escapeHtml(product.brand_name || '')}</span>
            <span class="result-price">Rp ${this.formatPrice(product.base_price || product.price)}</span>
          </div>
        </div>
      </div>
    `).join('');

    this.resultsContainer.innerHTML = resultsHTML;

    // Bind click events for results
    this.resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(item.dataset.id);
        const name = item.dataset.name;
        this.selectProduct({ id, name });
      });
    });
  }

  /**
   * Show loading state
   */
  showLoading() {
    this.resultsContainer.innerHTML = `
      <div class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        Mencari produk...
      </div>
    `;
  }

  /**
   * Show error state
   */
  showError(message) {
    this.resultsContainer.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <span>${message}</span>
      </div>
    `;
  }

  /**
   * Handle product selection
   */
  selectProduct(product) {
    this.close();
    this.onSelect(product);
  }

  /**
   * Default product selection handler - navigate to product detail
   */
  defaultOnSelect(product) {
    window.location.href = `/product/${product.id}`;
  }

  /**
   * Perform search and navigate to search results page
   */
  performSearch(query) {
    this.close();
    window.location.href = `/search?key=${encodeURIComponent(query)}`;
  }

  /**
   * Open dropdown
   */
  open() {
    if (this.isOpen) return;
    
    this.isOpen = true;
    this.dropdown.style.display = 'block';
    this.container.classList.add('open');
    
    // Position dropdown
    this.positionDropdown();
  }

  /**
   * Close dropdown
   */
  close() {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    this.dropdown.style.display = 'none';
    this.container.classList.remove('open');
  }

  /**
   * Position dropdown menu
   */
  positionDropdown() {
    const rect = this.searchInput.getBoundingClientRect();
    const dropdownRect = this.dropdown.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;

    // Always position below the search bar for navigation
    this.dropdown.style.top = '100%';
    this.dropdown.style.left = '0';
    this.dropdown.style.right = '0';
  }

  /**
   * Handle keyboard navigation
   */
  handleKeyNavigation(e) {
    if (!this.isOpen) return;

    const items = this.resultsContainer.querySelectorAll('.search-result-item');
    const currentFocused = this.resultsContainer.querySelector('.search-result-item.focused');
    let focusIndex = -1;

    if (currentFocused) {
      focusIndex = Array.from(items).indexOf(currentFocused);
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusIndex = Math.min(focusIndex + 1, items.length - 1);
        this.focusItem(items[focusIndex]);
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        focusIndex = Math.max(focusIndex - 1, 0);
        this.focusItem(items[focusIndex]);
        break;
        
      case 'Enter':
        e.preventDefault();
        if (currentFocused) {
          currentFocused.click();
        }
        break;
    }
  }

  /**
   * Focus a search result item
   */
  focusItem(item) {
    // Remove previous focus
    this.resultsContainer.querySelectorAll('.search-result-item.focused').forEach(i => {
      i.classList.remove('focused');
    });
    
    // Add focus to new item
    if (item) {
      item.classList.add('focused');
      item.scrollIntoView({ block: 'nearest' });
    }
  }

  /**
   * Format price for display
   */
  formatPrice(price) {
    return new Intl.NumberFormat('id-ID').format(price || 0);
  }

  /**
   * Escape HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }

  /**
   * Clear search input
   */
  clear() {
    this.searchInput.value = '';
    this.close();
  }

  /**
   * Destroy the component
   */
  destroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    if (this.container) {
      this.container.remove();
    }
  }
}
