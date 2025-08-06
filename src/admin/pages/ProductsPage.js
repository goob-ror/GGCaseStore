import { ApiService } from '../../lib/ApiService.js';
import { NotificationService } from '../../components/NotificationService.js';
import { ImageUpload } from '../../components/ImageUpload.js';
import { DynamicVariants } from '../../components/DynamicVariants.js';
import { SearchableDropdown } from '../../components/SearchableDropdown.js';
import { PriceFormatter } from '../../components/PriceFormatter.js';
import { QRCodeGenerator } from '../../components/QRCodeGenerator.js';
import { ProductSearch } from '../../components/ProductSearch.js';

class ProductsPage {
  constructor() {
    this.apiService = new ApiService();
    this.notificationService = new NotificationService();
    this.products = [];
    this.brands = [];
    this.categories = [];
    this.showForm = false;
    this.editingProduct = null;

    // Pagination state
    this.currentPage = 1;
    this.itemsPerPage = 20;
    this.totalPages = 1;
    this.totalProducts = 0;

    // Search state
    this.searchQuery = '';
    this.isSearching = false;

    // Initialize components
    this.imageUpload = null;
    this.brandDropdown = null;
    this.categoryDropdown = null;
    this.priceFormatter = null;
    this.qrGenerator = null;
    this.productSearch = null;
  }

  async render(container) {
    container.innerHTML = this.getHTML();
    this.bindEvents();
    await this.loadData();
  }

  getHTML() {
    return `
      <div class="products-page">
        <div class="page-header">
          <div class="header-content">
            <h1>Products Management</h1>
            <p>Manage your product catalog</p>
          </div>
          <div class="header-controls">
            <div class="search-controls">
              <div id="productSearchContainer"></div>
            </div>
            <div class="pagination-controls">
              <label for="itemsPerPage">Items per page:</label>
              <select id="itemsPerPage" class="form-control-sm">
                <option value="10">10</option>
                <option value="20" selected>20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
            <button class="btn btn-primary" id="addProductBtn">
              <i class="fas fa-plus"></i>
              Add Product
            </button>
          </div>
        </div>

        <div class="products-content">
          <div class="products-list" id="productsList">
            <div class="loading-state">
              <i class="fas fa-spinner fa-spin"></i>
              Loading products...
            </div>
          </div>
          <div class="pagination-container" id="paginationContainer"></div>

          <div class="product-form-modal" id="productFormModal" style="display: none;">
            <div class="modal-backdrop"></div>
            <div class="modal-content modal-large">
              <div class="modal-header">
                <h3 id="formTitle">Add New Product</h3>
                <button class="modal-close" id="closeFormBtn">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <form class="product-form" id="productForm">
                <div class="form-columns">
                  <!-- Column 1: Image Upload -->
                  <div class="form-column column-images">
                    <div class="column-header">
                      <h4><i class="fas fa-images"></i> Product Images</h4>
                    </div>
                    <div class="column-content">
                      <div id="productImageUpload"></div>
                    </div>
                  </div>

                  <!-- Column 2: Product Details -->
                  <div class="form-column column-details">
                    <div class="column-header">
                      <h4><i class="fas fa-info-circle"></i> Product Details</h4>
                    </div>
                    <div class="column-content">
                      <div class="form-group">
                        <label for="productName" class="form-label">Product Name *</label>
                        <input type="text" id="productName" name="name" class="form-control" required>
                      </div>

                      <div class="form-group">
                        <label for="productDescription" class="form-label">Description</label>
                        <textarea id="productDescription" name="description" class="form-control" rows="3"></textarea>
                      </div>

                      <div class="form-group">
                        <label class="form-label">Brand</label>
                        <div id="productBrandDropdown"></div>
                      </div>

                      <div class="form-group">
                        <label class="form-label">Category</label>
                        <div id="productCategoryDropdown"></div>
                      </div>

                      <div class="form-group">
                        <label class="form-label">Base Price</label>
                        <div id="productPriceFormatter"></div>
                        <small class="form-text text-muted">This is the base price. You can add variants with different prices later.</small>
                      </div>

                      <!-- NEW PROMO SECTION -->
                      <div class="promo-section">
                        <div class="promo-header">
                          <h5><i class="fas fa-tags"></i> Promotional Settings</h5>
                          <div class="promo-toggle">
                            <label class="toggle-switch">
                              <input type="checkbox" id="isPromo" name="is_promo">
                              <span class="toggle-slider"></span>
                            </label>
                            <label for="isPromo" class="toggle-label">Enable Promotion</label>
                          </div>
                        </div>
                        
                        <div class="promo-fields" id="promoFields" style="display: none;">
                          <div class="form-group">
                            <label for="promoPrice" class="form-label">Promo Price *</label>
                            <div id="productPromoPriceFormatter"></div>
                            <small class="form-text text-muted">Must be lower than base price</small>
                          </div>
                          
                          <div class="form-row">
                            <div class="form-group">
                              <label for="promoStartDate" class="form-label">Start Date</label>
                              <input type="datetime-local" id="promoStartDate" name="promo_price_start_date" class="form-control">
                              <small class="form-text text-muted">Leave empty for immediate start</small>
                            </div>
                            
                            <div class="form-group">
                              <label for="promoEndDate" class="form-label">End Date</label>
                              <input type="datetime-local" id="promoEndDate" name="promo_price_end_date" class="form-control">
                              <small class="form-text text-muted">Leave empty for no expiration</small>
                            </div>
                          </div>
                          
                          <div class="promo-preview" id="promoPreview">
                            <div class="price-comparison">
                              <span class="original-price" id="originalPriceDisplay">Rp 0</span>
                              <span class="promo-price" id="promoPriceDisplay">Rp 0</span>
                              <span class="discount-badge" id="discountBadge">0% OFF</span>
                            </div>
                            <div class="promo-period" id="promoPeriod">
                              <i class="fas fa-calendar"></i>
                              <span id="promoPeriodText">No time limit</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="form-group">
                        <label class="form-label">Total Sold</label>
                        <input type="number" class="form-control" id="totalSold" name="total_sold" min="0" placeholder="0">
                        <small class="form-text text-muted">Number of units sold</small>
                      </div>

                      <div class="form-group">
                        <label class="form-label">Customer Rating</label>
                        <div class="rating-controls">
                          <div class="rating-inputs">
                            <div class="rating-input-group">
                              <label for="avgRating" class="form-label-small">Average Rating</label>
                              <input type="number" class="form-control" id="avgRating" name="avg_rating" min="0" max="5" step="0.1" placeholder="0.0">
                            </div>
                            <div class="rating-input-group">
                              <label for="totalRaters" class="form-label-small">Total Reviews</label>
                              <input type="number" class="form-control" id="totalRaters" name="total_raters" min="0" placeholder="0">
                            </div>
                          </div>
                          <div class="rating-preview">
                            <div class="star-rating" id="starRating">
                              <span class="stars" id="starsDisplay">☆☆☆☆☆</span>
                              <span class="rating-text" id="ratingText">0.0 (0 reviews)</span>
                            </div>
                          </div>
                          <small class="form-text text-muted">Manually set rating or let it be calculated from customer reviews</small>
                        </div>
                      </div>

                      <div class="form-group">
                        <div id="productVariants"></div>
                      </div>
                    </div>
                  </div>

                  <!-- Column 3: QR Code -->
                  <div class="form-column column-qr">
                    <div class="column-header">
                      <h4><i class="fas fa-qrcode"></i> QR Code</h4>
                    </div>
                    <div class="column-content">
                      <div id="productQRGenerator"></div>
                    </div>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn btn-secondary" id="cancelFormBtn">Cancel</button>
                  <button type="submit" class="btn btn-primary" id="saveProductBtn">
                    <span class="btn-text">Save Product</span>
                    <span class="btn-loading d-none">
                      <i class="fas fa-spinner fa-spin"></i>
                      Saving...
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>
        .products-page {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          gap: 1rem;
        }

        .header-content h1 {
          font-size: 2rem;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .header-content p {
          color: #64748b;
          margin: 0;
        }

        .products-list {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .loading-state {
          padding: 3rem;
          text-align: center;
          color: #64748b;
        }

        .products-table {
          width: 100%;
          border-collapse: collapse;
        }

        .products-table th,
        .products-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #f1f5f9;
        }

        .products-table th {
          background: #f8fafc;
          font-weight: 600;
          color: #374151;
        }

        .products-table tr:hover {
          background: #f9fafb;
        }

        .product-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-icon {
          padding: 0.5rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-edit {
          background: #3b82f6;
          color: white;
        }

        .btn-edit:hover {
          background: #2563eb;
        }

        .btn-delete {
          background: #ef4444;
          color: white;
        }

        .btn-delete:hover {
          background: #dc2626;
        }

        .product-form-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .modal-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
        }

        .modal-content {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          z-index: 1;
        }

        .modal-large {
          max-width: 1200px;
          width: 95%;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
        }

        .modal-close {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.375rem;
          transition: all 0.2s;
        }

        .modal-close:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .product-form {
          padding: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        .empty-state {
          padding: 3rem;
          text-align: center;
          color: #64748b;
        }

        .empty-state i {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: #d1d5db;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: stretch;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .modal-content {
            margin: 1rem;
            max-width: none;
          }

          .products-table {
            font-size: 0.875rem;
          }

          .products-table th,
          .products-table td {
            padding: 0.75rem 0.5rem;
          }
        }

        /* 3-Column Form Layout */
        .form-columns {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 2rem;
          padding: 1.5rem;
        }

        .form-column {
          display: flex;
          flex-direction: column;
          min-height: 500px;
        }

        .column-header {
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .column-header h4 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .column-header i {
          color: #6366f1;
        }

        .column-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .column-images .column-content {
          min-height: 400px;
        }

        .column-qr .column-content {
          min-height: 350px;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .form-columns {
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
          }

          .column-qr {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 768px) {
          .form-columns {
            grid-template-columns: 1fr;
            gap: 1rem;
            padding: 1rem;
          }

          .form-column {
            min-height: auto;
          }

          .modal-large {
            width: 98%;
            max-width: none;
          }
        }

        /* Promo Section Styles */
        .promo-badge {
          background: #dc2626;
          color: white;
          font-size: 0.6rem;
          padding: 0.1rem 0.3rem;
          border-radius: 3px;
          font-weight: 600;
          margin-left: 0.5rem;
          vertical-align: top;
        }

        .price-cell {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .original-price-small {
          font-size: 0.8rem;
          color: #6b7280;
          text-decoration: line-through;
        }

        .promo-price-small {
          font-size: 0.95rem;
          font-weight: 600;
          color: #dc2626;
        }

        .regular-price {
          font-size: 0.9rem;
          font-weight: 500;
          color: #374151;
        }

        .discount-small {
          background: #dc2626;
          color: white;
          font-size: 0.6rem;
          padding: 0.1rem 0.25rem;
          border-radius: 2px;
          font-weight: 600;
        }

        .promo-section {
          margin: 1.5rem 0;
          padding: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: #f8f9fa;
          transition: all 0.3s ease;
        }

        .promo-section.active {
          border-color: #f59e0b;
          background: #fffbeb;
        }

        .promo-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .promo-header h5 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .promo-header i {
          color: #f59e0b;
        }

        .promo-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 24px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }

        input:checked + .toggle-slider {
          background-color: #f59e0b;
        }

        input:checked + .toggle-slider:before {
          transform: translateX(26px);
        }

        .toggle-label {
          font-size: 0.9rem;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          margin: 0;
        }

        .promo-fields {
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .promo-preview {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          margin-top: 1rem;
        }

        .price-comparison {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .original-price {
          font-size: 1rem;
          color: #6b7280;
          text-decoration: line-through;
        }

        .promo-price {
          font-size: 1.25rem;
          font-weight: 700;
          color: #dc2626;
        }

        .discount-badge {
          background: #dc2626;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .promo-period {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .promo-period i {
          color: #9ca3af;
        }

        /* Validation states */
        .promo-price-error {
          border-color: #ef4444 !important;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
        }

        .promo-error-message {
          color: #ef4444;
          font-size: 0.75rem;
          margin-top: 0.25rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .promo-error-message i {
          font-size: 0.7rem;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .promo-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .promo-toggle {
            justify-content: center;
          }

          .price-comparison {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }

        /* Rating Display Styles */
        .rating-controls {
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .rating-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .rating-input-group {
          display: flex;
          flex-direction: column;
        }

        .form-label-small {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.25rem;
        }

        .rating-preview {
          padding: 0.5rem;
          background: white;
          border-radius: 6px;
          border: 1px solid #e9ecef;
          margin-bottom: 0.5rem;
        }

        .star-rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .stars {
          font-size: 1.5rem;
          color: #ffc107;
          letter-spacing: 2px;
        }

        .rating-text {
          font-size: 0.9rem;
          color: #6c757d;
          font-weight: 500;
        }

        /* Table Rating Display */
        .rating-cell {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stars-small {
          font-size: 0.9rem;
          color: #ffc107;
          letter-spacing: 1px;
        }

        .rating-small {
          font-size: 0.75rem;
          color: #6c757d;
        }

        /* Pagination Styles */
        .header-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .search-controls {
          flex: 1;
          max-width: 400px;
          min-width: 250px;
        }

        .admin-search-box {
          position: relative;
          width: 100%;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-input-wrapper .search-icon {
          position: absolute;
          left: 0.75rem;
          color: #6c757d;
          font-size: 0.875rem;
          z-index: 1;
        }

        .search-input-wrapper .search-input {
          width: 100%;
          padding: 0.5rem 2.5rem 0.5rem 2.25rem;
          border: 1px solid #e6b120;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          background: white;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .search-input-wrapper .search-input:focus {
          outline: none;
          border-color: #ffcd29;
          box-shadow: 0 0 0 3px rgba(255, 205, 41, 0.2);
        }

        .search-input-wrapper .search-input::placeholder {
          color: #9ca3af;
        }

        .clear-search-btn {
          position: absolute;
          right: 0.75rem;
          background: none;
          border: none;
          color: #6c757d;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 0.25rem;
          transition: color 0.2s ease, background-color 0.2s ease;
          z-index: 1;
        }

        .clear-search-btn:hover {
          color: #374151;
          background-color: #f3f4f6;
        }

        .clear-search-btn i {
          font-size: 0.75rem;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .pagination-controls label {
          font-size: 0.875rem;
          color: #6c757d;
          margin: 0;
        }

        .form-control-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
          border-radius: 4px;
          border: 1px solid #ced4da;
        }

        .pagination-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1.5rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .pagination-info {
          font-size: 0.875rem;
          color: #6c757d;
        }

        .pagination-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .pagination-btn {
          padding: 0.5rem 0.75rem;
          border: 1px solid #dee2e6;
          background: white;
          color: #495057;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #e9ecef;
          border-color: #adb5bd;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-btn.active {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }

        /* Responsive styles for search */
        @media (max-width: 768px) {
          .header-controls {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }

          .search-controls {
            max-width: none;
            min-width: auto;
            order: -1;
          }

          .pagination-controls {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .search-input-wrapper .search-input {
            padding: 0.5rem 2rem 0.5rem 2rem;
            font-size: 0.8rem;
          }

          .search-input-wrapper .search-icon {
            left: 0.5rem;
          }

          .clear-search-btn {
            right: 0.5rem;
          }
        }
      </style>
    `;
  }

  bindEvents() {
    const addProductBtn = document.getElementById('addProductBtn');
    const closeFormBtn = document.getElementById('closeFormBtn');
    const cancelFormBtn = document.getElementById('cancelFormBtn');
    const productForm = document.getElementById('productForm');
    const modal = document.getElementById('productFormModal');
    const modalBackdrop = modal?.querySelector('.modal-backdrop');

    addProductBtn?.addEventListener('click', () => this.showProductForm());
    closeFormBtn?.addEventListener('click', () => this.hideProductForm());
    cancelFormBtn?.addEventListener('click', () => this.hideProductForm());
    modalBackdrop?.addEventListener('click', () => this.hideProductForm());
    productForm?.addEventListener('submit', (e) => this.handleFormSubmit(e));

    // Initialize search component
    this.initializeSearchComponent();

    // Initialize form components
    this.initializeFormComponents();

    // Add rating input listeners
    this.bindRatingInputs();

    // Add pagination event listeners
    this.bindPaginationEvents();
  }

  initializeSearchComponent() {
    const searchContainer = document.getElementById('productSearchContainer');
    if (!searchContainer) return;

    // Create a simple search input instead of the complex ProductSearch component
    searchContainer.innerHTML = `
      <div class="admin-search-box">
        <div class="search-input-wrapper">
          <i class="fas fa-search search-icon"></i>
          <input
            type="text"
            class="search-input"
            id="adminProductSearchInput"
            placeholder="Search products by name, brand, or category..."
            autocomplete="off"
          >
          <button type="button" class="clear-search-btn" id="clearSearchBtn" style="display: none;">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    `;

    const searchInput = document.getElementById('adminProductSearchInput');
    const clearBtn = document.getElementById('clearSearchBtn');

    if (searchInput) {
      let searchTimeout;

      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();

        // Show/hide clear button
        if (clearBtn) {
          clearBtn.style.display = query.length > 0 ? 'block' : 'none';
        }

        // Clear previous timeout
        if (searchTimeout) {
          clearTimeout(searchTimeout);
        }

        // Debounce search
        searchTimeout = setTimeout(() => {
          this.handleSearch(query);
        }, 300);
      });

      // Handle Enter key
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const query = searchInput.value.trim();
          this.handleSearch(query);
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        this.handleSearch('');
        searchInput.focus();
      });
    }
  }

  async handleSearch(query) {
    this.searchQuery = query;
    this.currentPage = 1; // Reset to first page when searching
    this.isSearching = query.length > 0;

    await this.loadData();
  }

  initializeFormComponents() {
    // Initialize QR code update debounce timer
    this.qrUpdateTimeout = null;

    // Initialize Image Upload
    this.imageUpload = new ImageUpload({
      multiple: true,
      maxFiles: 10,
      enableCropping: true, // Re-enabled for 1:1 aspect ratio cropping
      cropAspectRatio: 1, // 1:1 square ratio
      onFilesChange: (files) => {
        console.log('Images changed:', files);
      },
      onError: (error) => {
        this.notificationService.error('Image Upload Error', error);
      },
      onExistingFileRemove: async (photoId) => {
        await this.removeProductPhoto(photoId);
      }
    });

    // Initialize Brand Dropdown
    this.brandDropdown = new SearchableDropdown({
      placeholder: 'Select a brand...',
      onSelect: (brand) => {
        console.log('Brand selected:', brand);
        this.updateQRCode();
      }
    });

    // Initialize Category Dropdown
    this.categoryDropdown = new SearchableDropdown({
      placeholder: 'Select a category...',
      onSelect: (category) => {
        console.log('Category selected:', category);
        this.updateQRCode();
      }
    });

    // Initialize Price Formatter
    this.priceFormatter = new PriceFormatter({
      onValueChange: (value) => {
        console.log('Price changed:', value);
      }
    });

    // Initialize Promo Price Formatter
    this.promoPriceFormatter = new PriceFormatter({
      onValueChange: (value) => {
        this.validatePromoPrice(value);
        this.updatePromoPreview();
      }
    });

    // Initialize QR Generator
    this.qrGenerator = new QRCodeGenerator({
      size: 200,
      onGenerated: (data) => {
        console.log('QR Code generated:', data);
      }
    });

    // Initialize Dynamic Variants
    this.dynamicVariants = new DynamicVariants({
      maxVariants: 20,
      placeholder: 'Enter variant name (e.g., Size M - Red, 128GB - Black)',
      onVariantsChange: (variants) => {
        console.log('Variants changed:', variants);
      }
    });

    // Insert HTML and initialize components
    this.insertComponentHTML();

    // Add event listeners for QR code updates
    this.bindQRUpdateEvents();

    // NEW: Add promo event listeners
    this.bindPromoEvents();
  }

  bindQRUpdateEvents() {
    // Update QR code when product name changes
    const productNameInput = document.getElementById('productName');
    if (productNameInput) {
      productNameInput.addEventListener('input', () => {
        this.updateQRCode();
      });
    }
  }

  insertComponentHTML() {
    // Insert Image Upload HTML
    const imageUploadContainer = document.getElementById('productImageUpload');
    if (imageUploadContainer) {
      imageUploadContainer.innerHTML = this.imageUpload.createHTML('productImageUpload');
      this.imageUpload.initialize('productImageUpload');
    }

    // Insert Brand Dropdown HTML
    const brandDropdownContainer = document.getElementById('productBrandDropdown');
    if (brandDropdownContainer) {
      brandDropdownContainer.innerHTML = this.brandDropdown.createHTML('productBrandDropdown');
      this.brandDropdown.initialize('productBrandDropdown');
    }

    // Insert Category Dropdown HTML
    const categoryDropdownContainer = document.getElementById('productCategoryDropdown');
    if (categoryDropdownContainer) {
      categoryDropdownContainer.innerHTML = this.categoryDropdown.createHTML('productCategoryDropdown');
      this.categoryDropdown.initialize('productCategoryDropdown');
    }

    // Insert Price Formatter HTML
    const priceFormatterContainer = document.getElementById('productPriceFormatter');
    if (priceFormatterContainer) {
      priceFormatterContainer.innerHTML = this.priceFormatter.createHTML('productPriceFormatter', 'base_price');
      this.priceFormatter.initialize('productPriceFormatter');
    }

    // Insert QR Generator HTML
    const qrGeneratorContainer = document.getElementById('productQRGenerator');
    if (qrGeneratorContainer) {
      qrGeneratorContainer.innerHTML = this.qrGenerator.createHTML('productQRGenerator');
      this.qrGenerator.initialize('productQRGenerator');
    }

    // Insert Dynamic Variants HTML
    const variantsContainer = document.getElementById('productVariants');
    if (variantsContainer) {
      variantsContainer.innerHTML = this.dynamicVariants.createHTML('productVariants');
      this.dynamicVariants.initialize('productVariants');
    }
    // Insert Promo Price Formatter HTML
    const promoPriceFormatterContainer = document.getElementById('productPromoPriceFormatter');
    if (promoPriceFormatterContainer) {
      promoPriceFormatterContainer.innerHTML = this.promoPriceFormatter.createHTML('productPromoPriceFormatter', 'promo_price');
      this.promoPriceFormatter.initialize('productPromoPriceFormatter');
    }
  }

  async loadData() {
    try {
      // Build products API endpoint with search if needed
      let productsEndpoint = `/products?page=${this.currentPage}&limit=${this.itemsPerPage}`;

      if (this.isSearching && this.searchQuery) {
        // Use search endpoint instead of regular products endpoint
        productsEndpoint = `/products/search?q=${encodeURIComponent(this.searchQuery)}&page=${this.currentPage}&limit=${this.itemsPerPage}`;
      }

      const [productsResponse, brandsResponse, categoriesResponse] = await Promise.all([
        this.apiService.get(productsEndpoint),
        this.apiService.get('/brands'),
        this.apiService.get('/categories')
      ]);

      this.products = productsResponse.data || [];
      this.brands = brandsResponse.data || [];
      this.categories = categoriesResponse.data || [];

      // Update pagination info
      if (productsResponse.pagination) {
        this.totalPages = productsResponse.pagination.totalPages;
        this.totalProducts = productsResponse.pagination.totalProducts;
      } else if (this.isSearching) {
        // For search results, set pagination based on results
        this.totalProducts = this.products.length;
        this.totalPages = Math.ceil(this.totalProducts / this.itemsPerPage);
      }

      this.renderProductsList();
      this.renderPagination();
      this.populateFormSelects();
      this.populateDropdowns();

    } catch (error) {
      console.error('Error loading products data:', error);
      this.notificationService.error('Error', 'Failed to load products data');
      this.renderError();
    }
  }

  renderProductsList() {
    const container = document.getElementById('productsList');
    if (!container) return;

    if (this.products.length === 0) {
      const emptyStateContent = this.isSearching
        ? `
          <i class="fas fa-search"></i>
          <h3>No Products Found</h3>
          <p>No products match your search for "${this.escapeHtml(this.searchQuery)}". Try different keywords or clear the search.</p>
          <button class="btn btn-secondary" onclick="document.getElementById('adminProductSearchInput').value = ''; document.getElementById('clearSearchBtn').click();">
            Clear Search
          </button>
        `
        : `
          <i class="fas fa-box"></i>
          <h3>No Products Found</h3>
          <p>Start by adding your first product to the catalog.</p>
        `;

      container.innerHTML = `
        <div class="empty-state">
          ${emptyStateContent}
        </div>
      `;
      return;
    }

    const tableHTML = `
      <table class="products-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Brand</th>
            <th>Category</th>
            <th>Price</th>
            <th>Rating</th>
            <th>Sold</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${this.products.map(product => {
          // Check if promo is active
          const now = new Date();
          const isPromoActive = product.isPromo && 
            (product.current_price || product.is_promo_active) &&
            (!product.promo_price_start_date || new Date(product.promo_price_start_date) <= now) &&
            (!product.promo_price_end_date || new Date(product.promo_price_end_date) >= now);

          return `
            <tr>
              <td>
                <div>
                  <div class="font-weight-500">
                    ${this.escapeHtml(product.name)}
                    ${isPromoActive ? '<span class="promo-badge">PROMO</span>' : ''}
                  </div>
                  ${product.description ? `<div class="text-sm text-gray-500">${this.escapeHtml(product.description.substring(0, 60))}${product.description.length > 60 ? '...' : ''}</div>` : ''}
                </div>
              </td>
              <td>${product.brand_name || '-'}</td>
              <td>${product.category_name || '-'}</td>
              <td>
                ${this.formatPriceCell(product, isPromoActive)}
              </td>
              <td>
                <div class="rating-cell">
                  <span class="stars-small">${this.generateStarsDisplay(product.avg_rating || 0)}</span>
                  <span class="rating-small">${(product.avg_rating || 0).toFixed(1)} (${product.total_raters || 0})</span>
                </div>
              </td>
              <td>${(product.total_sold || 0).toLocaleString()}</td>
              <td>${new Date(product.created_at).toLocaleDateString()}</td>
              <td>
                <div class="product-actions">
                  <button class="btn-icon btn-edit" onclick="window.productsPage.editProduct(${product.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn-icon btn-delete" onclick="window.productsPage.deleteProduct(${product.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          `;
        }).join('')}
        </tbody>
      </table>
    `;

    container.innerHTML = tableHTML;
    
    // Make this instance globally accessible for onclick handlers
    window.productsPage = this;
  }

  renderError() {
    const container = document.getElementById('productsList');
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Error Loading Products</h3>
          <p>There was an error loading the products. Please try again.</p>
          <button class="btn btn-primary" onclick="window.location.reload()">Retry</button>
        </div>
      `;
    }
  }

  populateFormSelects() {
    const brandSelect = document.getElementById('productBrand');
    const categorySelect = document.getElementById('productCategory');

    if (brandSelect) {
      brandSelect.innerHTML = '<option value="">Select Brand</option>' +
        this.brands.map(brand => `<option value="${brand.id}">${this.escapeHtml(brand.name)}</option>`).join('');
    }

    if (categorySelect) {
      categorySelect.innerHTML = '<option value="">Select Category</option>' +
        this.categories.map(category => `<option value="${category.id}">${this.escapeHtml(category.name)}</option>`).join('');
    }
  }

  sanitizeRatingInput(value) {
    let sanitized = String(value).trim();
    
    if (!sanitized || sanitized === '' || isNaN(sanitized)) {
      return 0;
    }
    
    // Convert to number and remove leading zeros
    let numValue = parseFloat(sanitized);
    
    // Apply bounds: below 0 becomes 0, above 5 becomes 5
    if (numValue < 0) {
      numValue = 0;
    } else if (numValue > 5) {
      numValue = 5;
    }
    
    // Round to 1 decimal place for rating precision
    numValue = Math.round(numValue * 10) / 10;
    
    return numValue;
  }

  bindPromoEvents() {
    const promoToggle = document.getElementById('isPromo');
    const promoFields = document.getElementById('promoFields');
    const promoSection = document.querySelector('.promo-section');
    const promoStartDate = document.getElementById('promoStartDate');
    const promoEndDate = document.getElementById('promoEndDate');

    if (promoToggle && promoFields) {
      promoToggle.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        
        if (isChecked) {
          promoFields.style.display = 'block';
          promoSection?.classList.add('active');
          // Focus on promo price when enabled
          setTimeout(() => {
            const promoPriceInput = document.querySelector('#productPromoPriceFormatter input');
            if (promoPriceInput) {
              promoPriceInput.focus();
            }
          }, 100);
        } else {
          promoFields.style.display = 'none';
          promoSection?.classList.remove('active');
          // Clear promo fields when disabled
          if (this.promoPriceFormatter) {
            this.promoPriceFormatter.setValue(0);
          }
          if (promoStartDate) promoStartDate.value = '';
          if (promoEndDate) promoEndDate.value = '';
        }
        
        this.updatePromoPreview();
      });
    }

    // Add listeners for date changes
    if (promoStartDate) {
      promoStartDate.addEventListener('change', () => this.updatePromoPreview());
    }
    
    if (promoEndDate) {
      promoEndDate.addEventListener('change', () => this.updatePromoPreview());
    }

    // Add listener for base price changes to update promo preview
    if (this.priceFormatter) {
      const originalOnValueChange = this.priceFormatter.onValueChange;
      this.priceFormatter.onValueChange = (value) => {
        if (originalOnValueChange) {
          originalOnValueChange(value);
        }
        this.validatePromoPrice();
        this.updatePromoPreview();
      };
    }
  }

  validatePromoPrice(promoPrice = null) {
    const basePrice = this.priceFormatter?.getValue() || 0;
    const currentPromoPrice = promoPrice !== null ? promoPrice : (this.promoPriceFormatter?.getValue() || 0);
    const promoContainer = document.getElementById('productPromoPriceFormatter');
    
    // Remove any existing error styling and messages
    const existingError = promoContainer?.querySelector('.promo-error-message');
    if (existingError) {
      existingError.remove();
    }
    
    const promoPriceInput = promoContainer?.querySelector('input');
    if (promoPriceInput) {
      promoPriceInput.classList.remove('promo-price-error');
    }

    // Only validate if promo is enabled and has a price
    const isPromoEnabled = document.getElementById('isPromo')?.checked;
    if (!isPromoEnabled || currentPromoPrice <= 0) {
      return true;
    }

    // Validate that promo price is less than base price
    if (currentPromoPrice >= basePrice) {
      if (promoPriceInput) {
        promoPriceInput.classList.add('promo-price-error');
      }
      
      if (promoContainer) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'promo-error-message';
        errorMessage.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Promo price must be lower than base price';
        promoContainer.appendChild(errorMessage);
      }
      
      return false;
    }

    return true;
  }

  updatePromoPreview() {
    const basePrice = this.priceFormatter?.getValue() || 0;
    const promoPrice = this.promoPriceFormatter?.getValue() || 0;
    const isPromoEnabled = document.getElementById('isPromo')?.checked;
    
    const originalPriceDisplay = document.getElementById('originalPriceDisplay');
    const promoPriceDisplay = document.getElementById('promoPriceDisplay');
    const discountBadge = document.getElementById('discountBadge');
    const promoPeriodText = document.getElementById('promoPeriodText');

    if (!originalPriceDisplay || !promoPriceDisplay || !discountBadge || !promoPeriodText) {
      return;
    }

    if (!isPromoEnabled || promoPrice <= 0) {
      originalPriceDisplay.textContent = 'Rp 0';
      promoPriceDisplay.textContent = 'Rp 0';
      discountBadge.textContent = '0% OFF';
      promoPeriodText.textContent = 'Promotion disabled';
      return;
    }

    // Format prices
    originalPriceDisplay.textContent = basePrice.toLocaleString('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    });
    
    promoPriceDisplay.textContent = promoPrice.toLocaleString('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    });

    // Calculate discount percentage
    const discountPercentage = basePrice > 0 ? Math.round(((basePrice - promoPrice) / basePrice) * 100) : 0;
    discountBadge.textContent = `${discountPercentage}% OFF`;

    // Update period text
    const startDate = document.getElementById('promoStartDate')?.value;
    const endDate = document.getElementById('promoEndDate')?.value;
    
    if (startDate || endDate) {
      const startText = startDate ? new Date(startDate).toLocaleDateString() : 'Now';
      const endText = endDate ? new Date(endDate).toLocaleDateString() : 'No end date';
      promoPeriodText.textContent = `${startText} - ${endText}`;
    } else {
      promoPeriodText.textContent = 'No time limit';
    }
  }

  formatPriceCell(product, isPromoActive) {
    const basePrice = Number(product.base_price || product.price || 0);
    const promoPrice = Number(product.promo_price || product.current_price || 0);

    if (isPromoActive && promoPrice < basePrice) {
      const discountPercentage = Math.round(((basePrice - promoPrice) / basePrice) * 100);
      
      return `
        <div class="price-cell">
          <span class="original-price-small">${basePrice.toLocaleString('id-ID', { 
            style: 'currency', 
            currency: 'IDR', 
            minimumFractionDigits: 0, 
            maximumFractionDigits: 0 
          })}</span>
          <span class="promo-price-small">${promoPrice.toLocaleString('id-ID', { 
            style: 'currency', 
            currency: 'IDR', 
            minimumFractionDigits: 0, 
            maximumFractionDigits: 0 
          })}</span>
          <span class="discount-small">${discountPercentage}% OFF</span>
        </div>
      `;
    } else {
      return `
        <span class="regular-price">${basePrice.toLocaleString('id-ID', { 
          style: 'currency', 
          currency: 'IDR', 
          minimumFractionDigits: 0, 
          maximumFractionDigits: 0 
        })}</span>
      `;
    }
  }

  bindRatingInputs() {
    const avgRatingInput = document.getElementById('avgRating');
    const totalRatersInput = document.getElementById('totalRaters');

    if (avgRatingInput && totalRatersInput) {
      // Add input validation for avgRating
      avgRatingInput.addEventListener('input', (e) => {
        const sanitizedValue = this.sanitizeRatingInput(e.target.value);
        
        // Only update if the sanitized value is different from current value
        if (parseFloat(e.target.value) !== sanitizedValue) {
          e.target.value = sanitizedValue;
        }
        
        const totalRaters = parseInt(totalRatersInput.value) || 0;
        this.updateRatingDisplay(sanitizedValue, totalRaters);
      });

      // Add blur event to ensure final validation
      avgRatingInput.addEventListener('blur', (e) => {
        const sanitizedValue = this.sanitizeRatingInput(e.target.value);
        e.target.value = sanitizedValue;
        
        const totalRaters = parseInt(totalRatersInput.value) || 0;
        this.updateRatingDisplay(sanitizedValue, totalRaters);
      });

      // Add validation for totalRaters as well
      totalRatersInput.addEventListener('input', (e) => {
        let value = parseInt(e.target.value) || 0;
        if (value < 0) {
          value = 0;
          e.target.value = value;
        }
        
        const avgRating = this.sanitizeRatingInput(avgRatingInput.value);
        this.updateRatingDisplay(avgRating, value);
      });

      totalRatersInput.addEventListener('blur', (e) => {
        let value = parseInt(e.target.value) || 0;
        if (value < 0) {
          value = 0;
          e.target.value = value;
        }
        
        const avgRating = this.sanitizeRatingInput(avgRatingInput.value);
        this.updateRatingDisplay(avgRating, value);
      });
    }
  }

  addRatingValidationStyles() {
    // Add this CSS to your existing styles
    const style = document.createElement('style');
    style.textContent = `
      .rating-input-invalid {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
      }
      
      .rating-input-valid {
        border-color: #10b981 !important;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
      }
      
      .rating-validation-message {
        font-size: 0.75rem;
        margin-top: 0.25rem;
        color: #ef4444;
      }
    `;
    document.head.appendChild(style);
  }

  populateDropdowns() {
    // Populate brand dropdown
    if (this.brandDropdown) {
      this.brandDropdown.setItems(this.brands);
    }

    // Populate category dropdown
    if (this.categoryDropdown) {
      this.categoryDropdown.setItems(this.categories);
    }
  }

  updateQRCode() {
    if (!this.qrGenerator) return;

    // Clear any existing timeout to debounce rapid calls
    if (this.qrUpdateTimeout) {
      clearTimeout(this.qrUpdateTimeout);
    }

    // Debounce QR code generation to prevent multiple rapid calls
    this.qrUpdateTimeout = setTimeout(() => {
      const productName = document.getElementById('productName')?.value;
      const brandId = this.brandDropdown?.getValue();
      const categoryId = this.categoryDropdown?.getValue();

      if (productName) {
        const productData = {
          id: this.editingProduct?.id || 'new',
          name: productName,
          brand_name: brandId ? this.brands.find(b => b.id === brandId)?.name : '',
          category_name: categoryId ? this.categories.find(c => c.id === categoryId)?.name : ''
        };

        this.qrGenerator.generateFromProduct(productData);
      } else {
        // Clear QR code if no product name
        this.qrGenerator.clear();
      }
    }, 300); // 300ms debounce delay
  }

  showProductForm(product = null) {
    this.editingProduct = product;
    const modal = document.getElementById('productFormModal');
    const form = document.getElementById('productForm');
    const title = document.getElementById('formTitle');

    if (product) {
      title.textContent = 'Edit Product';
      // Reset form first, then populate with product data
      form.reset();
      this.populateForm(product);
    } else {
      title.textContent = 'Add New Product';
      form.reset();

      // Clear components only for new products
      if (this.imageUpload) {
        this.imageUpload.clear();
      }

      if (this.qrGenerator) {
        this.qrGenerator.clear();
      }

      if (this.dynamicVariants) {
        this.dynamicVariants.clear();
      }
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  hideProductForm() {
    const modal = document.getElementById('productFormModal');
    modal.style.display = 'none';
    document.body.style.overflow = '';

    // Clear image upload component to prevent persistence across products
    if (this.imageUpload) {
      this.imageUpload.clear();
    }

    // Clear QR generator
    if (this.qrGenerator) {
      this.qrGenerator.clear();
    }

    // Clear variants
    if (this.dynamicVariants) {
      this.dynamicVariants.clear();
    }

    // Reset form
    const form = document.getElementById('productForm');
    if (form) {
      form.reset();
    }

    this.editingProduct = null;
  }

  populateForm(product) {
    // Populate basic form fields immediately
    const productNameField = document.getElementById('productName');
    const productDescriptionField = document.getElementById('productDescription');
    const isPromoToggle = document.getElementById('isPromo');
    const promoStartDate = document.getElementById('promoStartDate');
    const promoEndDate = document.getElementById('promoEndDate');


    if (productNameField) {
      productNameField.value = product.name || '';
    }

    if (productDescriptionField) {
      productDescriptionField.value = product.description || '';
    }

    if (isPromoToggle) {
      isPromoToggle.checked = product.isPromo || false;
      
      // Trigger the change event to show/hide promo fields
      const event = new Event('change');
      isPromoToggle.dispatchEvent(event);
    }

    // Use setTimeout to ensure promo fields are visible before populating
    setTimeout(() => {
      if (this.promoPriceFormatter && product.promo_price) {
        this.promoPriceFormatter.setValue(product.promo_price);
      }

      if (promoStartDate && product.promo_price_start_date) {
        // Convert to datetime-local format
        const startDate = new Date(product.promo_price_start_date);
        promoStartDate.value = startDate.toISOString().slice(0, 16);
      }

      if (promoEndDate && product.promo_price_end_date) {
        // Convert to datetime-local format  
        const endDate = new Date(product.promo_price_end_date);
        promoEndDate.value = endDate.toISOString().slice(0, 16);
      }

      // Update promo preview after populating
      this.updatePromoPreview();
    }, 200);

    // Populate legacy selects (if they exist)
    const brandSelect = document.getElementById('productBrand');
    const categorySelect = document.getElementById('productCategory');
    if (brandSelect) brandSelect.value = product.brand_id || '';
    if (categorySelect) categorySelect.value = product.category_id || '';

    // Populate total sold field
    const totalSoldField = document.getElementById('totalSold');
    if (totalSoldField) {
      totalSoldField.value = product.total_sold || 0;
    }

    // Populate rating fields
    const avgRatingField = document.getElementById('avgRating');
    const totalRatersField = document.getElementById('totalRaters');
    if (avgRatingField) {
      avgRatingField.value = product.avg_rating || 0;
    }
    if (totalRatersField) {
      totalRatersField.value = product.total_raters || 0;
    }

    // Update rating display
    this.updateRatingDisplay(product.avg_rating || 0, product.total_raters || 0);

    // Use setTimeout to ensure components are fully initialized before populating them
    setTimeout(() => {
      // Ensure dropdowns have their items before setting values
      this.populateDropdowns();

      // Populate new components - always set values, even if null/undefined
      if (this.brandDropdown) {
        this.brandDropdown.setValue(product.brand_id);
      }

      if (this.categoryDropdown) {
        this.categoryDropdown.setValue(product.category_id);
      }

      if (this.priceFormatter) {
        // Set price even if it's 0 or null
        this.priceFormatter.setValue(product.base_price || 0);
      }

      // Load existing product images
      if (this.imageUpload && product.id) {
        this.loadProductImages(product.id);
      }

      // Load existing product variants
      if (this.dynamicVariants && product.id) {
        this.loadProductVariants(product.id);
      }

      // Generate QR code for existing product
      if (this.qrGenerator) {
        this.qrGenerator.generateFromProduct(product);
      }
    }, 100); // Small delay to ensure components are ready
  }

  async loadProductImages(productId) {
    try {
      const response = await this.apiService.get(`/products/${productId}/photos`);
      const photos = response.data || [];

      if (photos.length > 0 && this.imageUpload) {
        // Store photo IDs for deletion purposes
        const imageData = photos.map(photo => ({
          id: photo.id,
          url: this.apiService.getStaticURL(photo.photo_url),
          isExisting: true
        }));
        this.imageUpload.setExistingFiles(imageData);
      }
    } catch (error) {
      console.error('Error loading product images:', error);
    }
  }

  async loadProductVariants(productId) {
    try {
      const response = await this.apiService.get(`/products/${productId}/variants`);
      const variants = response.data || [];

      if (this.dynamicVariants) {
        this.dynamicVariants.setVariants(variants);
      }
    } catch (error) {
      console.error('Error loading product variants:', error);
    }
  }

  async handleFormSubmit(e) {
    e.preventDefault();

    const saveBtn = document.getElementById('saveProductBtn');
    const btnText = saveBtn.querySelector('.btn-text');
    const btnLoading = saveBtn.querySelector('.btn-loading');

    // Get data from form components
    const formData = new FormData(e.target);
    
    // Apply security validation to rating before sending to backend
    const rawRating = formData.get('avg_rating');
    const sanitizedRating = this.sanitizeRatingInput(rawRating);
    
    // Ensure total_raters is also sanitized
    const rawTotalRaters = formData.get('total_raters');
    const sanitizedTotalRaters = Math.max(0, parseInt(rawTotalRaters) || 0);

    const isPromo = document.getElementById('isPromo')?.checked || false;
    const promoPrice = isPromo ? (this.promoPriceFormatter?.getValue() || null) : null;
    const promoStartDate = formData.get('promo_price_start_date') || null;
    const promoEndDate = formData.get('promo_price_end_date') || null;

    // Validate promo price if enabled
    if (isPromo && !this.validatePromoPrice(promoPrice)) {
      this.notificationService.error('Validation Error', 'Please fix the promo price error before saving');
      return;
    }
    
    const productData = {
      name: formData.get('name'),
      description: formData.get('description'),
      brand_id: this.brandDropdown?.getValue() || null,
      category_id: this.categoryDropdown?.getValue() || null,
      base_price: this.priceFormatter?.getValue() || 0,
      total_sold: parseInt(formData.get('total_sold')) || 0,
      avg_rating: sanitizedRating,
      total_raters: sanitizedTotalRaters,
      is_promo: isPromo,
      promo_price: promoPrice,
      promo_price_start_date: promoStartDate,
      promo_price_end_date: promoEndDate
    };

    saveBtn.disabled = true;
    btnText.classList.add('d-none');
    btnLoading.classList.remove('d-none');

    try {
      let productId;

      if (this.editingProduct) {
        await this.apiService.put(`/products/${this.editingProduct.id}`, productData);
        productId = this.editingProduct.id;
        this.notificationService.success('Success', 'Product updated successfully');
      } else {
        const response = await this.apiService.post('/products', productData);
        productId = response.id;
        this.notificationService.success('Success', 'Product created successfully');
      }

      // Upload images if any
      const images = this.imageUpload?.getFiles();
      if (images && images.length > 0 && productId) {
        await this.uploadProductImages(productId, images);
      }

      // Update product variants
      const variants = this.dynamicVariants?.getVariants() || [];
      if (productId) {
        await this.updateProductVariants(productId, variants);
      }

      this.hideProductForm();
      await this.loadData();

    } catch (error) {
      console.error('Error saving product:', error);
      this.notificationService.error('Error', error.message || 'Failed to save product');
    } finally {
      saveBtn.disabled = false;
      btnText.classList.remove('d-none');
      btnLoading.classList.add('d-none');
    }
  }

  async updateProductVariants(productId, variants) {
    try {
      await this.apiService.put(`/products/${productId}/variants`, { variants });
      console.log('Product variants updated successfully');
    } catch (error) {
      console.error('Error updating variants:', error);
      this.notificationService.error('Warning', 'Product saved but failed to update variants');
    }
  }

  async uploadProductImages(productId, images) {
    try {
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append('photos', image, `product_${productId}_${index}.webp`);
      });

      const response = await this.apiService.uploadFile(`/products/${productId}/upload-photos`, formData);

      this.notificationService.success('Success', 'Product images uploaded successfully');

      // Refresh the uploaded images in the form if still editing
      if (this.editingProduct && this.editingProduct.id === productId) {
        await this.loadProductImages(productId);
      }

      return response;
    } catch (error) {
      console.error('Error uploading images:', error);
      this.notificationService.error('Warning', 'Product saved but failed to upload some images');
      throw error;
    }
  }

  async removeProductPhoto(photoId) {
    try {
      // Soft delete - just remove the association, don't delete the physical file
      await this.apiService.delete(`/photos/${photoId}`);
      this.notificationService.success('Success', 'Photo removed from product');

      // Refresh the images if currently editing
      if (this.editingProduct && this.editingProduct.id) {
        await this.loadProductImages(this.editingProduct.id);
      }
    } catch (error) {
      console.error('Error removing photo:', error);
      this.notificationService.error('Error', 'Failed to remove photo');
      throw error;
    }
  }

  // Updated updateRatingDisplay method with proper 5-star limit
  updateRatingDisplay(avgRating, totalRaters) {
    const starsDisplay = document.getElementById('starsDisplay');
    const ratingText = document.getElementById('ratingText');

    if (starsDisplay && ratingText) {
      const rating = Math.max(0, Math.min(5, parseFloat(avgRating) || 0));
      
      const fullStars = Math.min(5, Math.floor(rating));
      const hasHalfStar = (rating % 1 >= 0.5) && (fullStars < 5);
      const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

      let starsHtml = '';

      // Add full stars (max 5)
      for (let i = 0; i < fullStars; i++) {
        starsHtml += '★';
      }

      // Add half star if needed and we haven't reached 5 stars yet
      if (hasHalfStar) {
        starsHtml += '☆';
      }

      // Add empty stars to complete 5 total stars
      for (let i = 0; i < emptyStars; i++) {
        starsHtml += '☆';
      }

      starsDisplay.innerHTML = starsHtml;
      ratingText.textContent = `${rating.toFixed(1)} (${totalRaters} review${totalRaters !== 1 ? 's' : ''})`;
    }
  }

  editProduct(id) {
    const product = this.products.find(p => p.id === id);
    if (product) {
      this.showProductForm(product);
    }
  }

  async deleteProduct(id) {
    const product = this.products.find(p => p.id === id);
    if (!product) return;

    if (!confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await this.apiService.delete(`/products/${id}`);
      this.notificationService.success('Success', 'Product deleted successfully');
      await this.loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
      this.notificationService.error('Error', error.message || 'Failed to delete product');
    }
  }

  generateStarsDisplay(rating) {
    // Ensure rating is within 0-5 bounds
    const ratingNum = Math.max(0, Math.min(5, parseFloat(rating) || 0));
    
    const fullStars = Math.min(5, Math.floor(ratingNum));
    const hasHalfStar = (ratingNum % 1 >= 0.5) && (fullStars < 5);
    const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

    let starsHtml = '';

    for (let i = 0; i < fullStars; i++) {
      starsHtml += '★';
    }

    if (hasHalfStar) {
      starsHtml += '☆';
    }

    for (let i = 0; i < emptyStars; i++) {
      starsHtml += '☆';
    }

    return starsHtml;
  }

  bindRatingInputs() {
    const avgRatingInput = document.getElementById('avgRating');
    const totalRatersInput = document.getElementById('totalRaters');

    if (avgRatingInput && totalRatersInput) {
      const updatePreview = () => {
        const avgRating = parseFloat(avgRatingInput.value) || 0;
        const totalRaters = parseInt(totalRatersInput.value) || 0;
        this.updateRatingDisplay(avgRating, totalRaters);
      };

      avgRatingInput.addEventListener('input', updatePreview);
      totalRatersInput.addEventListener('input', updatePreview);
    }
  }

  bindPaginationEvents() {
    const itemsPerPageSelect = document.getElementById('itemsPerPage');
    if (itemsPerPageSelect) {
      itemsPerPageSelect.addEventListener('change', (e) => {
        this.itemsPerPage = parseInt(e.target.value);
        this.currentPage = 1; // Reset to first page
        this.loadData();
      });
    }
  }

  renderPagination() {
    const container = document.getElementById('paginationContainer');
    if (!container) return;

    if (this.totalPages <= 1) {
      container.innerHTML = '';
      return;
    }

    const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalProducts);

    const paginationHTML = `
      <div class="pagination-info">
        Showing ${startItem}-${endItem} of ${this.totalProducts} products
      </div>
      <div class="pagination-buttons">
        <button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} onclick="window.productsPage.goToPage(${this.currentPage - 1})">
          <i class="fas fa-chevron-left"></i> Previous
        </button>
        ${this.generatePageButtons()}
        <button class="pagination-btn" ${this.currentPage === this.totalPages ? 'disabled' : ''} onclick="window.productsPage.goToPage(${this.currentPage + 1})">
          Next <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    `;

    container.innerHTML = paginationHTML;
  }

  generatePageButtons() {
    let buttons = '';
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons += `
        <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" onclick="window.productsPage.goToPage(${i})">
          ${i}
        </button>
      `;
    }

    return buttons;
  }

  goToPage(page) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadData();
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export default ProductsPage;