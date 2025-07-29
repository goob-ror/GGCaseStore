import { ApiService } from '../../lib/ApiService.js';
import { NotificationService } from '../../components/NotificationService.js';

class ProductsPage {
  constructor() {
    this.apiService = new ApiService();
    this.notificationService = new NotificationService();
    this.products = [];
    this.brands = [];
    this.categories = [];
    this.showForm = false;
    this.editingProduct = null;
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
            <div class="modal-content">
              <div class="modal-header">
                <h3 id="formTitle">Add New Product</h3>
                <button class="modal-close" id="closeFormBtn">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <form class="product-form" id="productForm">
                <div class="form-row">
                  <div class="form-group">
                    <label for="productName" class="form-label">Product Name *</label>
                    <input type="text" id="productName" name="name" class="form-control" required>
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="productDescription" class="form-label">Description</label>
                  <textarea id="productDescription" name="description" class="form-control" rows="4"></textarea>
                </div>
                
                <div class="form-row">
                  <div class="form-group">
                    <label for="productBrand" class="form-label">Brand</label>
                    <select id="productBrand" name="brand_id" class="form-control">
                      <option value="">Select Brand</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="productCategory" class="form-label">Category</label>
                    <select id="productCategory" name="category_id" class="form-control">
                      <option value="">Select Category</option>
                    </select>
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
    document.getElementById('productName').value = product.name || '';
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productBrand').value = product.brand_id || '';
    document.getElementById('productCategory').value = product.category_id || '';
  }

  async handleFormSubmit(e) {
    e.preventDefault();
    
    const saveBtn = document.getElementById('saveProductBtn');
    const btnText = saveBtn.querySelector('.btn-text');
    const btnLoading = saveBtn.querySelector('.btn-loading');
    
    const formData = new FormData(e.target);
    const productData = {
      name: formData.get('name'),
      description: formData.get('description'),
      brand_id: formData.get('brand_id') || null,
      category_id: formData.get('category_id') || null
    };

    saveBtn.disabled = true;
    btnText.classList.add('d-none');
    btnLoading.classList.remove('d-none');

    try {
      if (this.editingProduct) {
        await this.apiService.put(`/products/${this.editingProduct.id}`, productData);
        this.notificationService.success('Success', 'Product updated successfully');
      } else {
        await this.apiService.post('/products', productData);
        this.notificationService.success('Success', 'Product created successfully');
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
