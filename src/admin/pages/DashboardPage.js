import { ApiService } from '../../lib/ApiService.js';
import { NotificationService } from '../../components/NotificationService.js';

class DashboardPage {
  constructor() {
    this.apiService = new ApiService();
    this.notificationService = new NotificationService();
    this.stats = {
      products: 0,
      brands: 0,
      categories: 0,
      banners: 0
    };
  }

  async render(container) {
    container.innerHTML = this.getHTML();
    await this.loadStats();
  }

  getHTML() {
    return `
      <div class="dashboard-page">
        <div class="dashboard-header">
          <h1>Dashboard Overview</h1>
          <p>Welcome to the GG Case Catalogs admin dashboard</p>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon products">
              <i class="fas fa-box"></i>
            </div>
            <div class="stat-content">
              <h3 id="productsCount">-</h3>
              <p>Total Products</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon brands">
              <i class="fas fa-tags"></i>
            </div>
            <div class="stat-content">
              <h3 id="brandsCount">-</h3>
              <p>Total Brands</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon categories">
              <i class="fas fa-list"></i>
            </div>
            <div class="stat-content">
              <h3 id="categoriesCount">-</h3>
              <p>Total Categories</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon banners">
              <i class="fas fa-image"></i>
            </div>
            <div class="stat-content">
              <h3 id="bannersCount">-</h3>
              <p>Active Banners</p>
            </div>
          </div>
        </div>
        
        <div class="dashboard-content">
          <div class="dashboard-row">
            <div class="dashboard-col">
              <div class="card">
                <div class="card-header">
                  <h3>Quick Actions</h3>
                </div>
                <div class="card-body">
                  <div class="quick-actions">
                    <a href="/admin/products" class="quick-action-btn">
                      <i class="fas fa-plus"></i>
                      Add Product
                    </a>
                    <a href="/admin/brands" class="quick-action-btn">
                      <i class="fas fa-plus"></i>
                      Add Brand
                    </a>
                    <a href="/admin/categories" class="quick-action-btn">
                      <i class="fas fa-plus"></i>
                      Add Category
                    </a>
                    <a href="/admin/banners" class="quick-action-btn">
                      <i class="fas fa-plus"></i>
                      Add Banner
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="dashboard-col">
              <div class="card">
                <div class="card-header">
                  <h3>System Status</h3>
                </div>
                <div class="card-body">
                  <div class="status-item">
                    <span class="status-label">Database</span>
                    <span class="status-indicator online" id="dbStatus">
                      <i class="fas fa-circle"></i>
                      Online
                    </span>
                  </div>
                  <div class="status-item">
                    <span class="status-label">API Server</span>
                    <span class="status-indicator online">
                      <i class="fas fa-circle"></i>
                      Running
                    </span>
                  </div>
                  <div class="status-item">
                    <span class="status-label">File Uploads</span>
                    <span class="status-indicator online">
                      <i class="fas fa-circle"></i>
                      Available
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>
        .dashboard-page {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .dashboard-header {
          margin-bottom: 2rem;
        }
        
        .dashboard-header h1 {
          font-size: 2rem;
          color: #000000;
          margin-bottom: 0.5rem;
        }

        .dashboard-header p {
          color: #000000;
          font-size: 1rem;
          opacity: 0.7;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .stat-card {
          background: #FFFFFF;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(230, 177, 32, 0.2);
          border: 1px solid #E6B120;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 205, 41, 0.3);
        }
        
        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
        }
        
        .stat-icon.products { background: linear-gradient(135deg, #E6B120 0%, #FFCD29 100%); }
        .stat-icon.brands { background: linear-gradient(135deg, #000000 0%, #333333 100%); }
        .stat-icon.categories { background: linear-gradient(135deg, #FFCD29 0%, #E6B120 100%); }
        .stat-icon.banners { background: linear-gradient(135deg, #000000 0%, #E6B120 100%); }
        
        .stat-content h3 {
          font-size: 2rem;
          font-weight: 700;
          color: #000000;
          margin-bottom: 0.25rem;
        }

        .stat-content p {
          color: #000000;
          font-size: 0.875rem;
          margin: 0;
          opacity: 0.7;
        }
        
        .dashboard-content {
          margin-top: 2rem;
        }
        
        .dashboard-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1.5rem;
        }
        
        .card {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .card-header {
          padding: 1.5rem 1.5rem 0;
        }
        
        .card-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }
        
        .card-body {
          padding: 1.5rem;
        }
        
        .quick-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }
        
        .quick-action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          text-decoration: none;
          color: #475569;
          transition: all 0.2s;
        }
        
        .quick-action-btn:hover {
          background: #3b82f6;
          color: white;
          text-decoration: none;
          transform: translateY(-1px);
        }
        
        .quick-action-btn i {
          font-size: 1.25rem;
        }
        
        .status-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #f1f5f9;
        }
        
        .status-item:last-child {
          border-bottom: none;
        }
        
        .status-label {
          font-weight: 500;
          color: #374151;
        }
        
        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .status-indicator.online {
          color: #059669;
        }
        
        .status-indicator.offline {
          color: #dc2626;
        }
        
        .status-indicator i {
          font-size: 0.5rem;
        }
        
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .dashboard-row {
            grid-template-columns: 1fr;
          }
          
          .quick-actions {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      </style>
    `;
  }

  async loadStats() {
    try {
      // Load all stats in parallel
      const [products, brands, categories, banners] = await Promise.all([
        this.apiService.get('/products').catch(() => ({ data: [] })),
        this.apiService.get('/brands').catch(() => ({ data: [] })),
        this.apiService.get('/categories').catch(() => ({ data: [] })),
        this.apiService.get('/banners/active').catch(() => ({ data: [] }))
      ]);

      // Update stats
      this.stats.products = products.data?.length || 0;
      this.stats.brands = brands.data?.length || 0;
      this.stats.categories = categories.data?.length || 0;
      this.stats.banners = banners.data?.length || 0;

      // Update UI
      this.updateStatsDisplay();

      // Test database connection
      await this.testDatabaseConnection();

    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      this.notificationService.error('Error', 'Failed to load dashboard statistics');
    }
  }

  updateStatsDisplay() {
    const elements = {
      productsCount: document.getElementById('productsCount'),
      brandsCount: document.getElementById('brandsCount'),
      categoriesCount: document.getElementById('categoriesCount'),
      bannersCount: document.getElementById('bannersCount')
    };

    if (elements.productsCount) elements.productsCount.textContent = this.stats.products;
    if (elements.brandsCount) elements.brandsCount.textContent = this.stats.brands;
    if (elements.categoriesCount) elements.categoriesCount.textContent = this.stats.categories;
    if (elements.bannersCount) elements.bannersCount.textContent = this.stats.banners;
  }

  async testDatabaseConnection() {
    try {
      await this.apiService.get('/test-db');
      const dbStatus = document.getElementById('dbStatus');
      if (dbStatus) {
        dbStatus.className = 'status-indicator online';
        dbStatus.innerHTML = '<i class="fas fa-circle"></i> Online';
      }
    } catch (error) {
      const dbStatus = document.getElementById('dbStatus');
      if (dbStatus) {
        dbStatus.className = 'status-indicator offline';
        dbStatus.innerHTML = '<i class="fas fa-circle"></i> Offline';
      }
    }
  }
}

export default DashboardPage;
