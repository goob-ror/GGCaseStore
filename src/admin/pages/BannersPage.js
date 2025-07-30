import { ApiService } from '../../lib/ApiService.js';
import { NotificationService } from '../../components/NotificationService.js';
import { ImageUpload } from '../../components/ImageUpload.js';

class BannersPage {
  constructor() {
    this.apiService = new ApiService();
    this.notificationService = new NotificationService();
    this.banners = [];
    this.showForm = false;
    this.editingBanner = null;

    // Initialize components
    this.imageUpload1 = null;
    this.imageUpload2 = null;
  }

  async render(container) {
    container.innerHTML = this.getHTML();
    this.bindEvents();
    await this.loadBanners();
  }

  getHTML() {
    return `
      <div class="banners-page">
        <div class="page-header">
          <div class="header-content">
            <h1>Banners Management</h1>
            <p>Manage website banners and promotional content</p>
          </div>
          <button class="btn btn-primary" id="addBannerBtn">
            <i class="fas fa-plus"></i>
            Add Banner
          </button>
        </div>

        <div class="banners-content">
          <div class="banners-list" id="bannersList">
            <div class="loading-state">
              <i class="fas fa-spinner fa-spin"></i>
              Loading banners...
            </div>
          </div>

          <div class="banner-form-modal" id="bannerFormModal" style="display: none;">
            <div class="modal-backdrop"></div>
            <div class="modal-content modal-large">
              <div class="modal-header">
                <h3 id="formTitle">Add New Banner</h3>
                <button class="modal-close" id="closeFormBtn">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <form class="banner-form" id="bannerForm">
                <div class="form-columns-4">
                  <!-- Column 1: Primary Banner Image -->
                  <div class="form-column column-image">
                    <div class="column-header">
                      <h4><i class="fas fa-image"></i> Primary Banner</h4>
                    </div>
                    <div class="column-content">
                      <div id="bannerImageUpload1"></div>
                      <small class="form-text text-muted">Main banner image (1200x400px recommended)</small>
                    </div>
                  </div>

                  <!-- Column 2: Spacing/Empty -->
                  <div class="form-column column-spacer">
                    <div class="column-header">
                      <h4><i class="fas fa-arrows-alt-h"></i> Layout</h4>
                    </div>
                    <div class="column-content">
                      <div class="layout-preview">
                        <div class="preview-box primary">Primary</div>
                        <div class="preview-arrow">→</div>
                        <div class="preview-box secondary">Secondary</div>
                      </div>
                      <small class="form-text text-muted">Banner layout preview</small>
                    </div>
                  </div>

                  <!-- Column 3: Secondary Banner Image -->
                  <div class="form-column column-image">
                    <div class="column-header">
                      <h4><i class="fas fa-image"></i> Secondary Banner</h4>
                    </div>
                    <div class="column-content">
                      <div id="bannerImageUpload2"></div>
                      <small class="form-text text-muted">Optional secondary banner image</small>
                    </div>
                  </div>

                  <!-- Column 4: Banner Details -->
                  <div class="form-column column-details">
                    <div class="column-header">
                      <h4><i class="fas fa-info-circle"></i> Banner Information</h4>
                    </div>
                    <div class="column-content">
                      <div class="form-group">
                        <label for="bannerTitle" class="form-label">Banner Title *</label>
                        <input type="text" id="bannerTitle" name="title" class="form-control" required>
                      </div>

                      <div class="form-group">
                        <label for="bannerRedirect" class="form-label">Redirect URL</label>
                        <input type="url" id="bannerRedirect" name="redirect_url" class="form-control" placeholder="https://example.com/page">
                        <small class="form-text text-muted">URL to redirect when banner is clicked (optional)</small>
                      </div>

                      <div class="form-group">
                        <label class="form-label checkbox-label">
                          <input type="checkbox" id="bannerActive" name="active" checked>
                          <span class="checkmark"></span>
                          Active Banner
                        </label>
                        <small class="form-text text-muted">Only active banners will be displayed on the website</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn btn-secondary" id="cancelFormBtn">Cancel</button>
                  <button type="submit" class="btn btn-primary" id="saveBannerBtn">
                    <span class="btn-text">Save Banner</span>
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
        .banners-page {
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

        .banners-list {
          display: grid;
          gap: 1.5rem;
        }

        .loading-state {
          padding: 3rem;
          text-align: center;
          color: #64748b;
        }

        .banner-card {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .banner-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .banner-preview {
          height: 200px;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
        }

        .banner-preview img {
          max-width: 100%;
          max-height: 100%;
          object-fit: cover;
          width: 100%;
          height: 100%;
        }

        .banner-preview .placeholder {
          color: #94a3b8;
          font-size: 3rem;
        }

        .banner-status {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .banner-status.active {
          background: #dcfce7;
          color: #166534;
        }

        .banner-status.inactive {
          background: #fee2e2;
          color: #991b1b;
        }

        .banner-content {
          padding: 1.5rem;
        }

        .banner-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .banner-meta {
          color: #64748b;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .banner-url {
          color: #3b82f6;
          font-size: 0.875rem;
          text-decoration: none;
          margin-bottom: 1rem;
          display: block;
          word-break: break-all;
        }

        .banner-url:hover {
          text-decoration: underline;
        }

        .banner-actions {
          display: flex;
          gap: 0.5rem;
          min-width: 90px;
        }

        .btn-icon {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          min-width: 90px;
          font-size: 0.875rem;
        }

        .btn-edit {
          background: #3b82f6;
          color: white;
        }

        .btn-edit:hover {
          background: #2563eb;
        }

        .btn-toggle {
          background: #f59e0b;
          color: white;
        }

        .btn-toggle:hover {
          background: #d97706;
        }

        .btn-delete {
          background: #ef4444;
          color: white;
        }

        .btn-delete:hover {
          background: #dc2626;
        }

        .banner-form-modal {
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
          max-width: 1400px;
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

        .banner-form {
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
          padding: 3rem;
          text-align: center;
          color: #64748b;
        }

        .empty-state i {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: #d1d5db;
        }

        /* 4-Column Form Layout */
        .form-columns-4 {
          display: grid;
          grid-template-columns: 1fr 0.5fr 1fr 1fr;
          gap: 1.5rem;
          padding: 1.5rem;
        }

        .form-column {
          display: flex;
          flex-direction: column;
          min-height: 350px;
        }

        .column-header {
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .column-header h4 {
          margin: 0;
          font-size: 0.95rem;
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
          min-height: 280px;
        }

        .column-spacer {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .layout-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 2rem 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          border: 2px dashed #e5e7eb;
        }

        .preview-box {
          width: 80px;
          height: 40px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 500;
          color: white;
        }

        .preview-box.primary {
          background: #3b82f6;
        }

        .preview-box.secondary {
          background: #6b7280;
        }

        .preview-arrow {
          font-size: 1.5rem;
          color: #6b7280;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          font-weight: 500;
        }

        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: #3b82f6;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .form-columns-4 {
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }

          .column-spacer {
            display: none;
          }

          .column-details {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 768px) {
          .form-columns-4 {
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

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: stretch;
          }

          .modal-content {
            margin: 1rem;
            max-width: none;
          }

          .banner-actions {
            flex-wrap: wrap;
          }

          .btn-icon {
            flex: 1;
            min-width: 120px;
          }
        }
      </style>
    `;
  }

  bindEvents() {
    const addBannerBtn = document.getElementById('addBannerBtn');
    const closeFormBtn = document.getElementById('closeFormBtn');
    const cancelFormBtn = document.getElementById('cancelFormBtn');
    const bannerForm = document.getElementById('bannerForm');
    const modal = document.getElementById('bannerFormModal');
    const modalBackdrop = modal?.querySelector('.modal-backdrop');

    addBannerBtn?.addEventListener('click', () => this.showBannerForm());
    closeFormBtn?.addEventListener('click', () => this.hideBannerForm());
    cancelFormBtn?.addEventListener('click', () => this.hideBannerForm());
    modalBackdrop?.addEventListener('click', () => this.hideBannerForm());
    bannerForm?.addEventListener('submit', (e) => this.handleFormSubmit(e));

    // Initialize form components
    this.initializeFormComponents();
  }

  initializeFormComponents() {
    // Initialize Primary Image Upload
    this.imageUpload1 = new ImageUpload({
      multiple: false,
      maxFiles: 1,
      onFilesChange: (files) => {
        console.log('Primary banner image changed:', files);
      },
      onError: (error) => {
        this.notificationService.error('Image Upload Error', error);
      }
    });

    // Initialize Secondary Image Upload
    this.imageUpload2 = new ImageUpload({
      multiple: false,
      maxFiles: 1,
      onFilesChange: (files) => {
        console.log('Secondary banner image changed:', files);
      },
      onError: (error) => {
        this.notificationService.error('Image Upload Error', error);
      }
    });

    // Insert HTML and initialize components
    this.insertComponentHTML();
  }

  insertComponentHTML() {
    // Insert Primary Image Upload HTML
    const imageUpload1Container = document.getElementById('bannerImageUpload1');
    if (imageUpload1Container) {
      imageUpload1Container.innerHTML = this.imageUpload1.createHTML('bannerImageUpload1');
      this.imageUpload1.initialize('bannerImageUpload1');
      imageUpload1Container.classList.add('single-image');
    }

    // Insert Secondary Image Upload HTML
    const imageUpload2Container = document.getElementById('bannerImageUpload2');
    if (imageUpload2Container) {
      imageUpload2Container.innerHTML = this.imageUpload2.createHTML('bannerImageUpload2');
      this.imageUpload2.initialize('bannerImageUpload2');
      imageUpload2Container.classList.add('single-image');
    }
  }

  async loadBanners() {
    try {
      const response = await this.apiService.get('/banners');
      this.banners = response.data || [];
      this.renderBannersList();
    } catch (error) {
      console.error('Error loading banners:', error);
      this.notificationService.error('Error', 'Failed to load banners');
      this.renderError();
    }
  }

  renderBannersList() {
    const container = document.getElementById('bannersList');
    if (!container) return;

    if (this.banners.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-image"></i>
          <h3>No Banners Found</h3>
          <p>Start by adding your first banner to promote content on your website.</p>
        </div>
      `;
      return;
    }

    const cardsHTML = this.banners.map(banner => `
      <div class="banner-card">
        <div class="banner-preview">
          ${banner.banner_image_url ?
            `<img src="${this.apiService.getStaticURL(banner.banner_image_url)}" alt="${this.escapeHtml(banner.title)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
             <div class="placeholder" style="display: none;"><i class="fas fa-image"></i></div>` :
            `<div class="placeholder"><i class="fas fa-image"></i></div>`
          }
          <div class="banner-status ${banner.active ? 'active' : 'inactive'}">
            ${banner.active ? 'Active' : 'Inactive'}
          </div>
        </div>
        <div class="banner-content">
          <h3 class="banner-title">${this.escapeHtml(banner.title)}</h3>
          <div class="banner-meta">
            Created: ${new Date(banner.created_at).toLocaleDateString()}
          </div>
          ${banner.redirect_url ? 
            `<a href="${banner.redirect_url}" target="_blank" class="banner-url">${banner.redirect_url}</a>` : 
            ''
          }
          <div class="banner-actions">
            <button class="btn-icon btn-edit" data-action="edit" data-banner-id="${banner.id}" title="Edit banner">
              <i class="fas fa-edit"></i>
              Edit
            </button>
            <button class="btn-icon btn-toggle" data-action="toggle" data-banner-id="${banner.id}" title="${banner.active ? 'Deactivate' : 'Activate'} banner">
              <i class="fas fa-${banner.active ? 'eye-slash' : 'eye'}"></i>
              ${banner.active ? 'Deactivate' : 'Activate'}
            </button>
            <button class="btn-icon btn-delete" data-action="delete" data-banner-id="${banner.id}" title="Delete banner">
              <i class="fas fa-trash"></i>
              Delete
            </button>
          </div>
        </div>
      </div>
    `).join('');

    container.innerHTML = cardsHTML;

    // Add event delegation for banner action buttons
    this.bindBannerActions(container);

    // Make this instance globally accessible for onclick handlers (fallback)
    window.bannersPage = this;
  }

  bindBannerActions(container) {
    container.addEventListener('click', (e) => {
      const button = e.target.closest('[data-action]');
      if (!button) return;

      const action = button.dataset.action;
      const bannerId = parseInt(button.dataset.bannerId);

      if (!bannerId) return;

      switch (action) {
        case 'edit':
          this.editBanner(bannerId);
          break;
        case 'toggle':
          this.toggleBanner(bannerId);
          break;
        case 'delete':
          this.deleteBanner(bannerId);
          break;
      }
    });
  }

  renderError() {
    const container = document.getElementById('bannersList');
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Error Loading Banners</h3>
          <p>There was an error loading the banners. Please try again.</p>
          <button class="btn btn-primary" onclick="window.location.reload()">Retry</button>
        </div>
      `;
    }
  }

  showBannerForm(banner = null) {
    this.editingBanner = banner;
    const modal = document.getElementById('bannerFormModal');
    const form = document.getElementById('bannerForm');
    const title = document.getElementById('formTitle');

    if (banner) {
      title.textContent = 'Edit Banner';
      this.populateForm(banner);
    } else {
      title.textContent = 'Add New Banner';
      form.reset();
      document.getElementById('bannerActive').checked = true;
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  hideBannerForm() {
    const modal = document.getElementById('bannerFormModal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
    this.editingBanner = null;
  }

  populateForm(banner) {
    // Populate basic form fields
    document.getElementById('bannerTitle').value = banner.title || '';
    document.getElementById('bannerRedirect').value = banner.redirect_url || '';
    document.getElementById('bannerActive').checked = banner.active;

    // Populate legacy image field if it exists
    const imageField = document.getElementById('bannerImage');
    if (imageField) {
      imageField.value = banner.banner_image_url || '';
    }

    // Load existing banner images
    if (banner.banner_image_url) {
      if (this.imageUpload1) {
        this.imageUpload1.setExistingFiles([banner.banner_image_url]);
      }

      // If there are multiple images, load the second one too
      // This would need to be extended based on your banner data structure
      // For now, we'll just load the primary image
    }
  }

  async handleFormSubmit(e) {
    e.preventDefault();

    const saveBtn = document.getElementById('saveBannerBtn');
    const btnText = saveBtn.querySelector('.btn-text');
    const btnLoading = saveBtn.querySelector('.btn-loading');

    const formData = new FormData(e.target);
    const bannerData = {
      title: formData.get('title'),
      redirect_url: formData.get('redirect_url') || null,
      active: formData.has('active')
    };

    saveBtn.disabled = true;
    btnText.classList.add('d-none');
    btnLoading.classList.remove('d-none');

    try {
      let bannerId;

      if (this.editingBanner) {
        await this.apiService.put(`/banners/${this.editingBanner.id}`, bannerData);
        bannerId = this.editingBanner.id;
        this.notificationService.success('Success', 'Banner updated successfully');
      } else {
        const response = await this.apiService.post('/banners', bannerData);
        bannerId = response.id;
        this.notificationService.success('Success', 'Banner created successfully');
      }

      // Upload images if any
      const images = [];
      const image1 = this.imageUpload1?.getFiles();
      const image2 = this.imageUpload2?.getFiles();

      if (image1 && image1.length > 0) images.push(image1[0]);
      if (image2 && image2.length > 0) images.push(image2[0]);

      if (images.length > 0 && bannerId) {
        await this.uploadBannerImages(bannerId, images);
      }

      this.hideBannerForm();
      await this.loadBanners();

    } catch (error) {
      console.error('Error saving banner:', error);
      this.notificationService.error('Error', error.message || 'Failed to save banner');
    } finally {
      saveBtn.disabled = false;
      btnText.classList.remove('d-none');
      btnLoading.classList.add('d-none');
    }
  }

  async uploadBannerImages(bannerId, images) {
    try {
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append('images', image, `banner_${bannerId}_${index + 1}.webp`);
      });

      await this.apiService.uploadFile(`/banners/${bannerId}/upload-images`, formData);

      this.notificationService.success('Success', 'Banner images uploaded successfully');
    } catch (error) {
      console.error('Error uploading banner images:', error);
      this.notificationService.error('Warning', 'Banner saved but failed to upload some images');
    }
  }

  editBanner(id) {
    const banner = this.banners.find(b => b.id === id);
    if (banner) {
      this.showBannerForm(banner);
    }
  }

  async toggleBanner(id) {
    const banner = this.banners.find(b => b.id === id);
    if (!banner) return;

    try {
      await this.apiService.put(`/banners/${id}`, {
        ...banner,
        active: !banner.active
      });
      
      this.notificationService.success('Success', `Banner ${banner.active ? 'deactivated' : 'activated'} successfully`);
      await this.loadBanners();
    } catch (error) {
      console.error('Error toggling banner:', error);
      this.notificationService.error('Error', error.message || 'Failed to toggle banner status');
    }
  }

  async deleteBanner(id) {
    const banner = this.banners.find(b => b.id === id);
    if (!banner) return;

    if (!confirm(`Are you sure you want to delete "${banner.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await this.apiService.delete(`/banners/${id}`);
      this.notificationService.success('Success', 'Banner deleted successfully');
      await this.loadBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      this.notificationService.error('Error', error.message || 'Failed to delete banner');
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export default BannersPage;
