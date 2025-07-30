import { ApiService } from '../../lib/ApiService.js';
import { NotificationService } from '../../components/NotificationService.js';
import { ImageUpload } from '../../components/ImageUpload.js';

class CategoriesPage {
  constructor() {
    this.apiService = new ApiService();
    this.notificationService = new NotificationService();
    this.categories = [];
    this.showForm = false;
    this.editingCategory = null;

    // Initialize components
    this.imageUpload = null;
  }

  async render(container) {
    container.innerHTML = this.getHTML();
    this.bindEvents();
    await this.loadCategories();
  }

  getHTML() {
    return `
      <div class="categories-page">
        <div class="page-header">
          <div class="header-content">
            <h1>Categories Management</h1>
            <p>Organize your products with categories</p>
          </div>
          <button class="btn btn-primary" id="addCategoryBtn">
            <i class="fas fa-plus"></i>
            Add Category
          </button>
        </div>

        <div class="categories-content">
          <div class="categories-grid" id="categoriesGrid">
            <div class="loading-state">
              <i class="fas fa-spinner fa-spin"></i>
              Loading categories...
            </div>
          </div>

          <div class="category-form-modal" id="categoryFormModal" style="display: none;">
            <div class="modal-backdrop"></div>
            <div class="modal-content modal-medium">
              <div class="modal-header">
                <h3 id="formTitle">Add New Category</h3>
                <button class="modal-close" id="closeFormBtn">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <form class="category-form" id="categoryForm">
                <div class="form-columns-2">
                  <!-- Column 1: Image Upload -->
                  <div class="form-column column-image">
                    <div class="column-header">
                      <h4><i class="fas fa-image"></i> Category Image</h4>
                    </div>
                    <div class="column-content">
                      <div id="categoryImageUpload"></div>
                    </div>
                  </div>

                  <!-- Column 2: Category Details -->
                  <div class="form-column column-details">
                    <div class="column-header">
                      <h4><i class="fas fa-info-circle"></i> Category Information</h4>
                    </div>
                    <div class="column-content">
                      <div class="form-group">
                        <label for="categoryName" class="form-label">Category Name *</label>
                        <input type="text" id="categoryName" name="name" class="form-control" required>
                      </div>

                      <div class="form-group">
                        <label for="categoryDescription" class="form-label">Description</label>
                        <textarea id="categoryDescription" name="description" class="form-control" rows="4" placeholder="Brief description of the category..."></textarea>
                        <small class="form-text text-muted">Optional category description for internal reference</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn btn-secondary" id="cancelFormBtn">Cancel</button>
                  <button type="submit" class="btn btn-primary" id="saveCategoryBtn">
                    <span class="btn-text">Save Category</span>
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
        .categories-page {
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

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .loading-state {
          grid-column: 1 / -1;
          padding: 3rem;
          text-align: center;
          color: #64748b;
        }

        .category-card {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .category-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .category-image {
          height: 150px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid #e2e8f0;
          overflow: hidden;
          position: relative;
        }

        .category-image img {
          max-width: 100%;
          max-height: 100%;
          object-fit: cover;
          width: 100%;
          height: 100%;
        }

        .category-image .placeholder {
          color: white;
          font-size: 3rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .category-content {
          padding: 1.5rem;
        }

        .category-name {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .category-meta {
          color: #64748b;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .category-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-icon {
          padding: 0.5rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.875rem;
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

        .category-form-modal {
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
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          z-index: 1;
        }

        .modal-medium {
          max-width: 800px;
          width: 90%;
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

        .category-form {
          padding: 1.5rem;
        }

        .form-text {
          color: #6b7280;
          font-size: 0.75rem;
          margin-top: 0.25rem;
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
          grid-column: 1 / -1;
          padding: 3rem;
          text-align: center;
          color: #64748b;
        }

        .empty-state i {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: #d1d5db;
        }

        /* 2-Column Form Layout */
        .form-columns-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          padding: 1.5rem;
        }

        .form-column {
          display: flex;
          flex-direction: column;
          min-height: 300px;
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

        .column-image .column-content {
          min-height: 250px;
        }

        @media (max-width: 768px) {
          .form-columns-2 {
            grid-template-columns: 1fr;
            gap: 1rem;
            padding: 1rem;
          }

          .form-column {
            min-height: auto;
          }

          .modal-medium {
            width: 98%;
            max-width: none;
          }
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: stretch;
          }

          .categories-grid {
            grid-template-columns: 1fr;
          }

          .modal-content {
            margin: 1rem;
            max-width: none;
          }
        }
      </style>
    `;
  }

  bindEvents() {
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const closeFormBtn = document.getElementById('closeFormBtn');
    const cancelFormBtn = document.getElementById('cancelFormBtn');
    const categoryForm = document.getElementById('categoryForm');
    const modal = document.getElementById('categoryFormModal');
    const modalBackdrop = modal?.querySelector('.modal-backdrop');

    addCategoryBtn?.addEventListener('click', () => this.showCategoryForm());
    closeFormBtn?.addEventListener('click', () => this.hideCategoryForm());
    cancelFormBtn?.addEventListener('click', () => this.hideCategoryForm());
    modalBackdrop?.addEventListener('click', () => this.hideCategoryForm());
    categoryForm?.addEventListener('submit', (e) => this.handleFormSubmit(e));

    // Initialize form components
    this.initializeFormComponents();
  }

  initializeFormComponents() {
    // Initialize Image Upload
    this.imageUpload = new ImageUpload({
      multiple: false,
      maxFiles: 1,
      enableCropping: false, // Temporarily disabled for debugging
      cropAspectRatio: 1, // 1:1 square ratio
      onFilesChange: (files) => {
        console.log('Category image changed:', files);
      },
      onError: (error) => {
        this.notificationService.error('Image Upload Error', error);
      }
    });

    // Insert HTML and initialize components
    this.insertComponentHTML();
  }

  insertComponentHTML() {
    // Insert Image Upload HTML
    const imageUploadContainer = document.getElementById('categoryImageUpload');
    if (imageUploadContainer) {
      imageUploadContainer.innerHTML = this.imageUpload.createHTML('categoryImageUpload');
      this.imageUpload.initialize('categoryImageUpload');
      // Add single image class
      imageUploadContainer.classList.add('single-image');
    }
  }

  async loadCategories() {
    try {
      const response = await this.apiService.get('/categories');
      this.categories = response.data || [];
      this.renderCategoriesGrid();
    } catch (error) {
      console.error('Error loading categories:', error);
      this.notificationService.error('Error', 'Failed to load categories');
      this.renderError();
    }
  }

  renderCategoriesGrid() {
    const container = document.getElementById('categoriesGrid');
    if (!container) return;

    if (this.categories.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-list"></i>
          <h3>No Categories Found</h3>
          <p>Start by adding your first category to organize your products.</p>
        </div>
      `;
      return;
    }

    const cardsHTML = this.categories.map(category => `
      <div class="category-card">
        <div class="category-image">
          ${category.category_photo ?
            `<img src="${this.apiService.getStaticURL(category.category_photo)}" alt="${this.escapeHtml(category.name)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
             <div class="placeholder" style="display: none;"><i class="fas fa-folder"></i></div>` :
            `<div class="placeholder"><i class="fas fa-folder"></i></div>`
          }
        </div>
        <div class="category-content">
          <h3 class="category-name">${this.escapeHtml(category.name)}</h3>
          <div class="category-meta">
            Created: ${new Date(category.created_at).toLocaleDateString()}
          </div>
          <div class="category-actions">
            <button class="btn-icon btn-edit" onclick="window.categoriesPage.editCategory(${category.id})">
              <i class="fas fa-edit"></i>
              Edit
            </button>
            <button class="btn-icon btn-delete" onclick="window.categoriesPage.deleteCategory(${category.id})">
              <i class="fas fa-trash"></i>
              Delete
            </button>
          </div>
        </div>
      </div>
    `).join('');

    container.innerHTML = cardsHTML;
    
    // Make this instance globally accessible for onclick handlers
    window.categoriesPage = this;
  }

  renderError() {
    const container = document.getElementById('categoriesGrid');
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Error Loading Categories</h3>
          <p>There was an error loading the categories. Please try again.</p>
          <button class="btn btn-primary" onclick="window.location.reload()">Retry</button>
        </div>
      `;
    }
  }

  showCategoryForm(category = null) {
    this.editingCategory = category;
    const modal = document.getElementById('categoryFormModal');
    const form = document.getElementById('categoryForm');
    const title = document.getElementById('formTitle');

    if (category) {
      title.textContent = 'Edit Category';
      this.populateForm(category);
    } else {
      title.textContent = 'Add New Category';
      form.reset();
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  hideCategoryForm() {
    const modal = document.getElementById('categoryFormModal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
    this.editingCategory = null;
  }

  populateForm(category) {
    // Populate basic form fields
    document.getElementById('categoryName').value = category.name || '';

    const descriptionField = document.getElementById('categoryDescription');
    if (descriptionField) {
      descriptionField.value = category.description || '';
    }

    // Populate legacy photo field if it exists
    const photoField = document.getElementById('categoryPhoto');
    if (photoField) {
      photoField.value = category.category_photo || '';
    }

    // Load existing category image
    if (this.imageUpload && category.category_photo) {
      this.imageUpload.setExistingFiles([this.apiService.getStaticURL(category.category_photo)]);
    }
  }

  async handleFormSubmit(e) {
    e.preventDefault();

    const saveBtn = document.getElementById('saveCategoryBtn');
    const btnText = saveBtn.querySelector('.btn-text');
    const btnLoading = saveBtn.querySelector('.btn-loading');

    const formData = new FormData(e.target);
    const categoryData = {
      name: formData.get('name'),
      description: formData.get('description') || null
    };

    saveBtn.disabled = true;
    btnText.classList.add('d-none');
    btnLoading.classList.remove('d-none');

    try {
      let categoryId;

      if (this.editingCategory) {
        await this.apiService.put(`/categories/${this.editingCategory.id}`, categoryData);
        categoryId = this.editingCategory.id;
        this.notificationService.success('Success', 'Category updated successfully');
      } else {
        const response = await this.apiService.post('/categories', categoryData);
        categoryId = response.id;
        this.notificationService.success('Success', 'Category created successfully');
      }

      // Upload image if any
      const images = this.imageUpload?.getFiles();
      if (images && images.length > 0 && categoryId) {
        await this.uploadCategoryImage(categoryId, images[0]);
      }

      this.hideCategoryForm();
      await this.loadCategories();

    } catch (error) {
      console.error('Error saving category:', error);
      this.notificationService.error('Error', error.message || 'Failed to save category');
    } finally {
      saveBtn.disabled = false;
      btnText.classList.remove('d-none');
      btnLoading.classList.add('d-none');
    }
  }

  async uploadCategoryImage(categoryId, image) {
    try {
      const formData = new FormData();
      formData.append('image', image, `category_${categoryId}.webp`);

      const response = await this.apiService.uploadFile(`/categories/${categoryId}/upload-image`, formData);

      this.notificationService.success('Success', 'Category image uploaded successfully');

      // Refresh the category data to get the updated image URL
      if (this.editingCategory && this.editingCategory.id === categoryId) {
        const categoryResponse = await this.apiService.get(`/categories/${categoryId}`);
        if (categoryResponse.data && this.imageUpload) {
          this.imageUpload.setExistingFiles([this.apiService.getStaticURL(categoryResponse.data.category_photo)]);
        }
      }

      return response;
    } catch (error) {
      console.error('Error uploading category image:', error);
      this.notificationService.error('Warning', 'Category saved but failed to upload image');
      throw error;
    }
  }

  editCategory(id) {
    const category = this.categories.find(c => c.id === id);
    if (category) {
      this.showCategoryForm(category);
    }
  }

  async deleteCategory(id) {
    const category = this.categories.find(c => c.id === id);
    if (!category) return;

    if (!confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await this.apiService.delete(`/categories/${id}`);
      this.notificationService.success('Success', 'Category deleted successfully');
      await this.loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      this.notificationService.error('Error', error.message || 'Failed to delete category');
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export default CategoriesPage;
