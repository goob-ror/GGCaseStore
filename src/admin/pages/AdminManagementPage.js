import { ApiService } from '../../lib/ApiService.js';
import { NotificationService } from '../../components/NotificationService.js';

class AdminManagementPage {
  constructor() {
    this.apiService = new ApiService();
    this.notificationService = new NotificationService();
    this.admins = [];
    this.showForm = false;
    this.editingAdmin = null;
  }

  async render(container) {
    container.innerHTML = this.getHTML();
    this.bindEvents();
    await this.loadAdmins();
  }

  getHTML() {
    return `
      <div class="admin-management-page">
        <div class="page-header">
          <div class="header-content">
            <h1>Admin Users Management</h1>
            <p>Manage administrator accounts and permissions</p>
          </div>
          <button class="btn btn-primary" id="addAdminBtn">
            <i class="fas fa-plus"></i>
            Add Admin User
          </button>
        </div>

        <div class="admin-content">
          <div class="admin-list" id="adminList">
            <div class="loading-state">
              <i class="fas fa-spinner fa-spin"></i>
              Loading admin users...
            </div>
          </div>

          <div class="admin-form-modal" id="adminFormModal" style="display: none;">
            <div class="modal-backdrop"></div>
            <div class="modal-content">
              <div class="modal-header">
                <h3 id="formTitle">Add New Admin User</h3>
                <button class="modal-close" id="closeFormBtn">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <form class="admin-form" id="adminForm">
                <div class="form-group">
                  <label for="adminUsername" class="form-label">Username *</label>
                  <input type="text" id="adminUsername" name="username" class="form-control" required>
                  <small class="form-text">Username must be unique and contain only letters, numbers, and underscores</small>
                </div>
                
                <div class="form-group">
                  <label for="adminPassword" class="form-label">Password *</label>
                  <div class="password-input-container">
                    <input type="password" id="adminPassword" name="password" class="form-control password-input" required>
                    <button type="button" class="password-toggle" id="passwordToggle">
                      <i class="fas fa-eye" id="passwordToggleIcon"></i>
                    </button>
                  </div>
                  <small class="form-text">Password must be at least 8 characters long</small>
                </div>
                
                <div class="form-group">
                  <label for="adminPasswordConfirm" class="form-label">Confirm Password *</label>
                  <input type="password" id="adminPasswordConfirm" name="passwordConfirm" class="form-control" required>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn btn-secondary" id="cancelFormBtn">Cancel</button>
                  <button type="submit" class="btn btn-primary" id="saveAdminBtn">
                    <span class="btn-text">Save Admin User</span>
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
        .admin-management-page {
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

        .admin-list {
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

        .admin-table {
          width: 100%;
          border-collapse: collapse;
        }

        .admin-table th,
        .admin-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #f1f5f9;
        }

        .admin-table th {
          background: #f8fafc;
          font-weight: 600;
          color: #374151;
        }

        .admin-table tr:hover {
          background: #f9fafb;
        }

        .admin-avatar {
          width: 40px;
          height: 40px;
          background: #3b82f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          margin-right: 1rem;
        }

        .admin-info {
          display: flex;
          align-items: center;
        }

        .admin-details h4 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .admin-details p {
          margin: 0;
          font-size: 0.875rem;
          color: #64748b;
        }

        .admin-actions {
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

        .btn-delete {
          background: #ef4444;
          color: white;
        }

        .btn-delete:hover {
          background: #dc2626;
        }

        .btn-delete:disabled {
          background: #d1d5db;
          cursor: not-allowed;
        }

        .admin-form-modal {
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

        .admin-form {
          padding: 1.5rem;
        }

        .password-input-container {
          position: relative;
        }

        .password-input {
          padding-right: 3rem;
        }

        .password-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 0.25rem;
          transition: color 0.2s;
        }

        .password-toggle:hover {
          color: #374151;
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

        .current-user {
          background: #fef3c7;
          color: #92400e;
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

          .admin-table {
            font-size: 0.875rem;
          }

          .admin-table th,
          .admin-table td {
            padding: 0.75rem 0.5rem;
          }

          .admin-info {
            flex-direction: column;
            align-items: flex-start;
          }

          .admin-avatar {
            margin-right: 0;
            margin-bottom: 0.5rem;
          }
        }

        /* Session Information Styles */
        .session-info {
          font-size: 0.875rem;
        }

        .session-ip, .session-time {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }

        .session-ip i {
          color: #10b981;
          width: 14px;
        }

        .session-time i {
          color: #6b7280;
          width: 14px;
        }

        .session-info.offline {
          display: flex;
          align-items: center;
        }

        .offline-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          font-style: italic;
        }

        .offline-status i {
          color: #9ca3af;
          font-size: 0.5rem;
        }
      </style>
    `;
  }

  bindEvents() {
    const addAdminBtn = document.getElementById('addAdminBtn');
    const closeFormBtn = document.getElementById('closeFormBtn');
    const cancelFormBtn = document.getElementById('cancelFormBtn');
    const adminForm = document.getElementById('adminForm');
    const modal = document.getElementById('adminFormModal');
    const modalBackdrop = modal?.querySelector('.modal-backdrop');
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('adminPassword');
    const passwordToggleIcon = document.getElementById('passwordToggleIcon');

    addAdminBtn?.addEventListener('click', () => this.showAdminForm());
    closeFormBtn?.addEventListener('click', () => this.hideAdminForm());
    cancelFormBtn?.addEventListener('click', () => this.hideAdminForm());
    modalBackdrop?.addEventListener('click', () => this.hideAdminForm());
    adminForm?.addEventListener('submit', (e) => this.handleFormSubmit(e));

    // Password visibility toggle
    passwordToggle?.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      passwordToggleIcon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
    });
  }

  async loadAdmins() {
    try {
      const response = await this.apiService.get('/admins');
      this.admins = response.data || [];
      this.renderAdminList();
    } catch (error) {
      console.error('Error loading admins:', error);
      this.notificationService.error('Error', 'Failed to load admin users');
      this.renderError();
    }
  }

  renderAdminList() {
    const container = document.getElementById('adminList');
    if (!container) return;

    if (this.admins.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-users-cog"></i>
          <h3>No Admin Users Found</h3>
          <p>Start by adding your first admin user to manage the system.</p>
        </div>
      `;
      return;
    }

    const currentUser = this.getCurrentUser();
    const tableHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Admin User</th>
            <th>Current Session</th>
            <th>Created</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${this.admins.map(admin => `
            <tr class="${currentUser && currentUser.username === admin.username ? 'current-user' : ''}">
              <td>
                <div class="admin-info">
                  <div class="admin-avatar">
                    ${admin.username.charAt(0).toUpperCase()}
                  </div>
                  <div class="admin-details">
                    <h4>${this.escapeHtml(admin.username)}</h4>
                    <p>${currentUser && currentUser.username === admin.username ? 'Current User' : 'Administrator'}</p>
                  </div>
                </div>
              </td>
              <td>
                ${currentUser && currentUser.username === admin.username ? `
                  <div class="session-info">
                    <div class="session-ip">
                      <i class="fas fa-globe"></i>
                      <span>${currentUser.currentIP || 'Unknown'}</span>
                    </div>
                    <div class="session-time">
                      <i class="fas fa-clock"></i>
                      <span>Since ${currentUser.loginTime ? new Date(currentUser.loginTime).toLocaleString() : 'Unknown'}</span>
                    </div>
                  </div>
                ` : `
                  <div class="session-info offline">
                    <span class="offline-status">
                      <i class="fas fa-circle"></i>
                      Offline
                    </span>
                  </div>
                `}
              </td>
              <td>${new Date(admin.created_at).toLocaleDateString()}</td>
              <td>${new Date(admin.updated_at).toLocaleDateString()}</td>
              <td>
                <div class="admin-actions">
                  <button
                    class="btn-icon btn-delete"
                    onclick="window.adminManagementPage.deleteAdmin(${admin.id})"
                    ${currentUser && currentUser.username === admin.username ? 'disabled title="Cannot delete current user"' : 'title="Delete Admin"'}
                  >
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
    window.adminManagementPage = this;
  }

  renderError() {
    const container = document.getElementById('adminList');
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Error Loading Admin Users</h3>
          <p>There was an error loading the admin users. Please try again.</p>
          <button class="btn btn-primary" onclick="window.location.reload()">Retry</button>
        </div>
      `;
    }
  }

  showAdminForm() {
    const modal = document.getElementById('adminFormModal');
    const form = document.getElementById('adminForm');
    
    form.reset();
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  hideAdminForm() {
    const modal = document.getElementById('adminFormModal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  async handleFormSubmit(e) {
    e.preventDefault();
    
    const saveBtn = document.getElementById('saveAdminBtn');
    const btnText = saveBtn.querySelector('.btn-text');
    const btnLoading = saveBtn.querySelector('.btn-loading');
    
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');
    const passwordConfirm = formData.get('passwordConfirm');

    // Validation
    if (password !== passwordConfirm) {
      this.notificationService.error('Validation Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      this.notificationService.error('Validation Error', 'Password must be at least 8 characters long');
      return;
    }

    const adminData = {
      username,
      password
    };

    saveBtn.disabled = true;
    btnText.classList.add('d-none');
    btnLoading.classList.remove('d-none');

    try {
      await this.apiService.post('/admins', adminData);
      this.notificationService.success('Success', 'Admin user created successfully');
      this.hideAdminForm();
      await this.loadAdmins();

    } catch (error) {
      console.error('Error saving admin:', error);
      this.notificationService.error('Error', error.message || 'Failed to create admin user');
    } finally {
      saveBtn.disabled = false;
      btnText.classList.remove('d-none');
      btnLoading.classList.add('d-none');
    }
  }

  async deleteAdmin(id) {
    const admin = this.admins.find(a => a.id === id);
    if (!admin) return;

    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.username === admin.username) {
      this.notificationService.error('Error', 'Cannot delete your own admin account');
      return;
    }

    if (!confirm(`Are you sure you want to delete admin user "${admin.username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await this.apiService.delete(`/admins/${id}`);
      this.notificationService.success('Success', 'Admin user deleted successfully');
      await this.loadAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
      this.notificationService.error('Error', error.message || 'Failed to delete admin user');
    }
  }

  getCurrentUser() {
    // This would typically come from the auth service
    // For now, we'll try to get it from the auth service if available
    if (window.authService && window.authService.getUser) {
      return window.authService.getUser();
    }
    return null;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export default AdminManagementPage;
