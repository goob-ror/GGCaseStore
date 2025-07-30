import { ApiService } from '../../lib/ApiService.js';
import { NotificationService } from '../../components/NotificationService.js';
import { ImageUpload } from '../../components/ImageUpload.js';
import { SearchableDropdown } from '../../components/SearchableDropdown.js';
import { PriceFormatter } from '../../components/PriceFormatter.js';
import { QRCodeGenerator } from '../../components/QRCodeGenerator.js';

class ProductsPage {
  constructor() {
    this.apiService = new ApiService();
    this.notificationService = new NotificationService();
    this.products = [];
    this.brands = [];
    this.categories = [];
    this.showForm = false;
    this.editingProduct = null;

    // Initialize components
    this.imageUpload = null;
    this.brandDropdown = null;
    this.categoryDropdown = null;
    this.priceFormatter = null;
    this.qrGenerator = null;
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
          <button class="btn btn-primary" id="addProductBtn">
            <i class="fas fa-plus"></i>
            Add Product
          </button>
        </div>

        <div class="products-content">
          <div class="products-list" id="productsList">
            <div class="loading-state">
              <i class="fas fa-spinner fa-spin"></i>
              Loading products...
            </div>
          </div>

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

    // Initialize form components
    this.initializeFormComponents();
  }

  initializeFormComponents() {
    // Initialize QR code update debounce timer
    this.qrUpdateTimeout = null;

    // Initialize Image Upload
    this.imageUpload = new ImageUpload({
      multiple: true,
      maxFiles: 10,
      enableCropping: false, // Temporarily disabled for debugging
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

    // Initialize QR Generator
    this.qrGenerator = new QRCodeGenerator({
      size: 200,
      onGenerated: (data) => {
        console.log('QR Code generated:', data);
      }
    });

    // Insert HTML and initialize components
    this.insertComponentHTML();

    // Add event listeners for QR code updates
    this.bindQRUpdateEvents();
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
  }

  async loadData() {
    try {
      const [productsResponse, brandsResponse, categoriesResponse] = await Promise.all([
        this.apiService.get('/products'),
        this.apiService.get('/brands'),
        this.apiService.get('/categories')
      ]);

      this.products = productsResponse.data || [];
      this.brands = brandsResponse.data || [];
      this.categories = categoriesResponse.data || [];

      this.renderProductsList();
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
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-box"></i>
          <h3>No Products Found</h3>
          <p>Start by adding your first product to the catalog.</p>
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
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${this.products.map(product => `
            <tr>
              <td>
                <div>
                  <div class="font-weight-500">${this.escapeHtml(product.name)}</div>
                  ${product.description ? `<div class="text-sm text-gray-500">${this.escapeHtml(product.description.substring(0, 60))}${product.description.length > 60 ? '...' : ''}</div>` : ''}
                </div>
              </td>
              <td>${product.brand_name || '-'}</td>
              <td>${product.category_name || '-'}</td>
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
          `).join('')}
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
      this.populateForm(product);
    } else {
      title.textContent = 'Add New Product';
      form.reset();
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  hideProductForm() {
    const modal = document.getElementById('productFormModal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
    this.editingProduct = null;
  }

  populateForm(product) {
    // Populate basic form fields
    document.getElementById('productName').value = product.name || '';
    document.getElementById('productDescription').value = product.description || '';

    // Populate legacy selects (if they exist)
    const brandSelect = document.getElementById('productBrand');
    const categorySelect = document.getElementById('productCategory');
    if (brandSelect) brandSelect.value = product.brand_id || '';
    if (categorySelect) categorySelect.value = product.category_id || '';

    // Populate new components
    if (this.brandDropdown && product.brand_id) {
      this.brandDropdown.setValue(product.brand_id);
    }

    if (this.categoryDropdown && product.category_id) {
      this.categoryDropdown.setValue(product.category_id);
    }

    if (this.priceFormatter && product.base_price) {
      this.priceFormatter.setValue(product.base_price);
    }

    // Load existing product images
    if (this.imageUpload && product.id) {
      this.loadProductImages(product.id);
    }

    // Generate QR code for existing product
    if (this.qrGenerator) {
      this.qrGenerator.generateFromProduct(product);
    }
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

  async handleFormSubmit(e) {
    e.preventDefault();

    const saveBtn = document.getElementById('saveProductBtn');
    const btnText = saveBtn.querySelector('.btn-text');
    const btnLoading = saveBtn.querySelector('.btn-loading');

    // Get data from form components
    const formData = new FormData(e.target);
    const productData = {
      name: formData.get('name'),
      description: formData.get('description'),
      brand_id: this.brandDropdown?.getValue() || null,
      category_id: this.categoryDropdown?.getValue() || null,
      base_price: this.priceFormatter?.getValue() || 0
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

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export default ProductsPage;
