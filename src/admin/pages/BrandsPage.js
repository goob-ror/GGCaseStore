import { ApiService } from '../../lib/ApiService.js';
import { NotificationService } from '../../components/NotificationService.js';
import { ImageUpload } from '../../components/ImageUpload.js';

class BrandsPage {
  constructor() {
    this.apiService = new ApiService();
    this.notificationService = new NotificationService();
    this.brands = [];
    this.showForm = false;
    this.editingBrand = null;

    // Initialize components
    this.imageUpload = null;
  }

  async render(container) {
    container.innerHTML = this.getHTML();
    this.bindEvents();
    await this.loadBrands();
  }

  getHTML() {
    return `
      <div class="brands-page">
        <div class="page-header">
          <div class="header-content">
            <h1>Brands Management</h1>
            <p>Manage product brands and their information</p>
          </div>
          <button class="btn btn-primary" id="addBrandBtn">
            <i class="fas fa-plus"></i>
            Add Brand
          </button>
        </div>

        <div class="brands-content">
          <div class="brands-grid" id="brandsGrid">
            <div class="loading-state">
              <i class="fas fa-spinner fa-spin"></i>
              Loading brands...
            </div>
          </div>

          <div class="brand-form-modal" id="brandFormModal" style="display: none;">
            <div class="modal-backdrop"></div>
            <div class="modal-content modal-medium">
              <div class="modal-header">
                <h3 id="formTitle">Add New Brand</h3>
                <button class="modal-close" id="closeFormBtn">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <form class="brand-form" id="brandForm">
                <div class="form-columns-2">
                  <!-- Column 1: Image Upload -->
                  <div class="form-column column-image">
                    <div class="column-header">
                      <h4><i class="fas fa-image"></i> Brand Logo</h4>
                    </div>
                    <div class="column-content">
                      <div id="brandImageUpload"></div>
                    </div>
                  </div>

                  <!-- Column 2: Brand Details -->
                  <div class="form-column column-details">
                    <div class="column-header">
                      <h4><i class="fas fa-info-circle"></i> Brand Information</h4>
                    </div>
                    <div class="column-content">
                      <div class="form-group">
                        <label for="brandName" class="form-label">Brand Name *</label>
                        <input type="text" id="brandName" name="name" class="form-control" required>
                      </div>

                      <div class="form-group">
                        <label for="brandDescription" class="form-label">Description</label>
                        <textarea id="brandDescription" name="description" class="form-control" rows="4" placeholder="Brief description of the brand..."></textarea>
                        <small class="form-text text-muted">Optional brand description for internal reference</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn btn-secondary" id="cancelFormBtn">Cancel</button>
                  <button type="submit" class="btn btn-primary" id="saveBrandBtn">
                    <span class="btn-text">Save Brand</span>
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
        .brands-page {
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

        .brands-grid {
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

        .brand-card {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .brand-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .brand-image {
          aspect-ratio: 1 / 1; /* Force 1:1 square aspect ratio */
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .brand-image img {
          width: 100%;
          height: 100%;
          object-fit: cover; /* Use cover to fill the square area */
        }

        .brand-image .placeholder {
          color: #94a3b8;
          font-size: 3rem;
        }

        .brand-content {
          padding: 1.5rem;
        }

        .brand-name {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .brand-meta {
          color: #64748b;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .brand-actions {
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

        .brand-form-modal {
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

        .brand-form {
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

          .brands-grid {
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
    const addBrandBtn = document.getElementById('addBrandBtn');
    const closeFormBtn = document.getElementById('closeFormBtn');
    const cancelFormBtn = document.getElementById('cancelFormBtn');
    const brandForm = document.getElementById('brandForm');
    const modal = document.getElementById('brandFormModal');
    const modalBackdrop = modal?.querySelector('.modal-backdrop');

    addBrandBtn?.addEventListener('click', () => this.showBrandForm());
    closeFormBtn?.addEventListener('click', () => this.hideBrandForm());
    cancelFormBtn?.addEventListener('click', () => this.hideBrandForm());
    modalBackdrop?.addEventListener('click', () => this.hideBrandForm());
    brandForm?.addEventListener('submit', (e) => this.handleFormSubmit(e));

    // Initialize form components
    this.initializeFormComponents();
  }

  initializeFormComponents() {
    // Initialize Image Upload
    this.imageUpload = new ImageUpload({
      multiple: false,
      maxFiles: 1,
      enableCropping: true, // Re-enabled for 1:1 aspect ratio cropping
      cropAspectRatio: 1, // 1:1 square ratio
      onFilesChange: (files) => {
        console.log('Brand image changed:', files);
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
    const imageUploadContainer = document.getElementById('brandImageUpload');
    if (imageUploadContainer) {
      imageUploadContainer.innerHTML = this.imageUpload.createHTML('brandImageUpload');
      this.imageUpload.initialize('brandImageUpload');
      // Add single image class
      imageUploadContainer.classList.add('single-image');
    }
  }

  async loadBrands() {
    try {
      const response = await this.apiService.get('/brands');
      this.brands = response.data || [];
      this.renderBrandsGrid();
    } catch (error) {
      console.error('Error loading brands:', error);
      this.notificationService.error('Error', 'Failed to load brands');
      this.renderError();
    }
  }

  renderBrandsGrid() {
    const container = document.getElementById('brandsGrid');
    if (!container) return;

    if (this.brands.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-tags"></i>
          <h3>No Brands Found</h3>
          <p>Start by adding your first brand to organize your products.</p>
        </div>
      `;
      return;
    }

    const cardsHTML = this.brands.map(brand => `
      <div class="brand-card">
        <div class="brand-image">
          ${brand.brand_photo ?
            `<img src="${this.apiService.getStaticURL(brand.brand_photo)}" alt="${this.escapeHtml(brand.name)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
             <div class="placeholder" style="display: none;"><i class="fas fa-image"></i></div>` :
            `<div class="placeholder"><i class="fas fa-image"></i></div>`
          }
        </div>
        <div class="brand-content">
          <h3 class="brand-name">${this.escapeHtml(brand.name)}</h3>
          <div class="brand-meta">
            Created: ${new Date(brand.created_at).toLocaleDateString()}
          </div>
          <div class="brand-actions">
            <button class="btn-icon btn-edit" onclick="window.brandsPage.editBrand(${brand.id})">
              <i class="fas fa-edit"></i>
              Edit
            </button>
            <button class="btn-icon btn-delete" onclick="window.brandsPage.deleteBrand(${brand.id})">
              <i class="fas fa-trash"></i>
              Delete
            </button>
          </div>
        </div>
      </div>
    `).join('');

    container.innerHTML = cardsHTML;
    
    // Make this instance globally accessible for onclick handlers
    window.brandsPage = this;
  }

  renderError() {
    const container = document.getElementById('brandsGrid');
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Error Loading Brands</h3>
          <p>There was an error loading the brands. Please try again.</p>
          <button class="btn btn-primary" onclick="window.location.reload()">Retry</button>
        </div>
      `;
    }
  }

  showBrandForm(brand = null) {
    this.editingBrand = brand;
    const modal = document.getElementById('brandFormModal');
    const form = document.getElementById('brandForm');
    const title = document.getElementById('formTitle');

    // Clear image upload component first to prevent image persistence
    if (this.imageUpload) {
      this.imageUpload.clear();
    }

    if (brand) {
      title.textContent = 'Edit Brand';
      this.populateForm(brand);
    } else {
      title.textContent = 'Add New Brand';
      form.reset();
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  hideBrandForm() {
    const modal = document.getElementById('brandFormModal');
    modal.style.display = 'none';
    document.body.style.overflow = '';

    // Clear image upload component to prevent persistence across brands
    if (this.imageUpload) {
      this.imageUpload.clear();
    }

    // Reset form
    const form = document.getElementById('brandForm');
    if (form) {
      form.reset();
    }

    this.editingBrand = null;
  }

  populateForm(brand) {
    // Populate basic form fields
    document.getElementById('brandName').value = brand.name || '';

    const descriptionField = document.getElementById('brandDescription');
    if (descriptionField) {
      descriptionField.value = brand.description || '';
    }

    // Populate legacy photo field if it exists
    const photoField = document.getElementById('brandPhoto');
    if (photoField) {
      photoField.value = brand.brand_photo || '';
    }

    // Load existing brand image
    if (this.imageUpload && brand.brand_photo) {
      this.imageUpload.setExistingFiles([this.apiService.getStaticURL(brand.brand_photo)]);
    }
  }

  async handleFormSubmit(e) {
    e.preventDefault();

    const saveBtn = document.getElementById('saveBrandBtn');
    const btnText = saveBtn.querySelector('.btn-text');
    const btnLoading = saveBtn.querySelector('.btn-loading');

    const formData = new FormData(e.target);
    const brandData = {
      name: formData.get('name'),
      description: formData.get('description') || null
    };

    saveBtn.disabled = true;
    btnText.classList.add('d-none');
    btnLoading.classList.remove('d-none');

    try {
      let brandId;

      if (this.editingBrand) {
        await this.apiService.put(`/brands/${this.editingBrand.id}`, brandData);
        brandId = this.editingBrand.id;
        this.notificationService.success('Success', 'Brand updated successfully');
      } else {
        const response = await this.apiService.post('/brands', brandData);
        brandId = response.id;
        this.notificationService.success('Success', 'Brand created successfully');
      }

      // Upload image if any
      const images = this.imageUpload?.getFiles();
      if (images && images.length > 0 && brandId) {
        await this.uploadBrandImage(brandId, images[0]);
      }

      this.hideBrandForm();
      await this.loadBrands();

    } catch (error) {
      console.error('Error saving brand:', error);
      this.notificationService.error('Error', error.message || 'Failed to save brand');
    } finally {
      saveBtn.disabled = false;
      btnText.classList.remove('d-none');
      btnLoading.classList.add('d-none');
    }
  }

  async uploadBrandImage(brandId, image) {
    try {
      const formData = new FormData();
      formData.append('image', image, `brand_${brandId}.webp`);

      const response = await this.apiService.uploadFile(`/brands/${brandId}/upload-image`, formData);

      this.notificationService.success('Success', 'Brand image uploaded successfully');

      // Refresh the brand data to get the updated image URL
      if (this.editingBrand && this.editingBrand.id === brandId) {
        const brandResponse = await this.apiService.get(`/brands/${brandId}`);
        if (brandResponse.data && this.imageUpload) {
          this.imageUpload.setExistingFiles([this.apiService.getStaticURL(brandResponse.data.brand_photo)]);
        }
      }

      return response;
    } catch (error) {
      console.error('Error uploading brand image:', error);
      this.notificationService.error('Warning', 'Brand saved but failed to upload image');
      throw error;
    }
  }

  editBrand(id) {
    const brand = this.brands.find(b => b.id === id);
    if (brand) {
      this.showBrandForm(brand);
    }
  }

  async deleteBrand(id) {
    const brand = this.brands.find(b => b.id === id);
    if (!brand) return;

    if (!confirm(`Are you sure you want to delete "${brand.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await this.apiService.delete(`/brands/${id}`);
      this.notificationService.success('Success', 'Brand deleted successfully');
      await this.loadBrands();
    } catch (error) {
      console.error('Error deleting brand:', error);
      this.notificationService.error('Error', error.message || 'Failed to delete brand');
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export default BrandsPage;
