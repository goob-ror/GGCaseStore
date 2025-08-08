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
      banners: 0,
      totalPromoSales: 0,
      avgRating: 0,
      recentProducts: [],
      topRatedProducts: []
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

          <div class="stat-card">
            <div class="stat-icon promos">
              <i class="fas fa-percentage"></i>
            </div>
            <div class="stat-content">
              <h3 id="totalPromoSales">-</h3>
              <p>Active Promos</p>
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

          <div class="dashboard-row">
            <div class="dashboard-col">
              <div class="card">
                <div class="card-header">
                  <h3>Recent Products</h3>
                  <a href="/admin/products" class="view-all-link">View All</a>
                </div>
                <div class="card-body">
                  <div id="recentProductsList" class="recent-products-list">
                    <div class="loading-placeholder">Loading recent products...</div>
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
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
        .stat-icon.promos { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); }
        .stat-icon.sales { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
        .stat-icon.rating { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
        
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
          width: 100% !important;
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

        /* New Dashboard Components */
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .view-all-link {
          font-size: 0.875rem;
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
        }

        .view-all-link:hover {
          text-decoration: underline;
        }

        .recent-products-list,
        .top-rated-products-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .product-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: #f8fafc;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }

        .product-image {
          width: 40px;
          height: 40px;
          border-radius: 6px;
          background: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .product-info {
          flex: 1;
        }

        .product-name {
          font-weight: 500;
          color: #1f2937;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .product-meta {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .product-rating {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: #f59e0b;
        }

        .sales-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1.5rem;
        }

        .sales-metric {
          text-align: center;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .metric-label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .loading-placeholder {
          text-align: center;
          color: #6b7280;
          font-style: italic;
          padding: 1rem;
        }

        .full-width {
          grid-column: 1 / -1;
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

          .sales-overview {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      </style>
    `;
  }

  // <div class="stat-card">
  //   <div class="stat-icon rating">
  //     <i class="fas fa-star"></i>
  //   </div>
  //   <div class="stat-content">
  //     <h3 id="avgRating">-</h3>
  //     <p>Average Rating</p>
  //   </div>
  // </div>

  // <div class="dashboard-col">
  //   <div class="card">
  //     <div class="card-header">
  //       <h3>Top Rated Products</h3>
  //       <a href="/admin/products" class="view-all-link">View All</a>
  //     </div>
  //     <div class="card-body">
  //       <div id="topRatedProductsList" class="top-rated-products-list">
  //         <div class="loading-placeholder">Loading top rated products...</div>
  //       </div>
  //     </div>
  //   </div>
  // </div>

  // <div class="dashboard-row">
  //   <div class="dashboard-col full-width">
  //     <div class="card">
  //       <div class="card-header">
  //         <h3>Sales Overview</h3>
  //       </div>
  //       <div class="card-body">
  //         <div class="sales-overview">
  //           <div class="sales-metric">
  //             <div class="metric-value" id="totalRevenue">Rp 0</div>
  //             <div class="metric-label">Total Revenue</div>
  //           </div>
  //           <div class="sales-metric">
  //             <div class="metric-value" id="totalOrders">0</div>
  //             <div class="metric-label">Total Orders</div>
  //           </div>
  //           <div class="sales-metric">
  //             <div class="metric-value" id="avgOrderValue">Rp 0</div>
  //             <div class="metric-label">Avg Order Value</div>
  //           </div>
  //           <div class="sales-metric">
  //             <div class="metric-value" id="topSellingCategory">-</div>
  //             <div class="metric-label">Top Category</div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // </div>

  async loadStats() {
    try {
      // Load all stats in parallel
      const [products, brands, categories, banners] = await Promise.all([
        this.apiService.get('/products?limit=100').catch(() => ({ data: [], pagination: { totalProducts: 0 } })),
        this.apiService.get('/brands').catch(() => ({ data: [] })),
        this.apiService.get('/categories').catch(() => ({ data: [] })),
        this.apiService.get('/banners/active').catch(() => ({ data: [] }))
      ]);

      // Update basic stats
      this.stats.products = products.pagination?.totalProducts || products.data?.length || 0;
      this.stats.brands = brands.data?.length || 0;
      this.stats.categories = categories.data?.length || 0;
      this.stats.banners = banners.data?.length || 0;

      // Calculate additional stats from products
      const productData = products.data || [];

      // Count only currently active promos (not just products with isPromo flag)
      const now = new Date();
      this.stats.totalPromoSales = productData.filter(product => {
        // First check if the backend has already calculated this for us
        if (product.is_promo_active !== undefined) {
          return Boolean(product.is_promo_active);
        }

        // Fallback to manual calculation if is_promo_active is not provided
        // Check if product has promo enabled
        if (!product.isPromo && !product.is_promo) return false;

        // Check if promo has valid pricing
        const hasValidPromoPrice = (product.current_price || product.promo_price) &&
                                   (product.current_price || product.promo_price) < (product.base_price || product.price);
        if (!hasValidPromoPrice) return false;

        // Check start date
        if (product.promo_price_start_date) {
          const startDate = new Date(product.promo_price_start_date);
          if (startDate > now) return false;
        }

        // Check end date
        if (product.promo_price_end_date) {
          const endDate = new Date(product.promo_price_end_date);
          if (endDate < now) return false;
        }

        return true;
      }).length;

      const ratedProducts = productData.filter(p => p.avg_rating > 0);
      this.stats.avgRating = ratedProducts.length > 0
        ? (ratedProducts.reduce((sum, p) => sum + p.avg_rating, 0) / ratedProducts.length).toFixed(1)
        : 0;

      // Get recent products (last 5)
      this.stats.recentProducts = productData
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      // Get top rated products (top 5)
      this.stats.topRatedProducts = productData
        .filter(p => p.avg_rating > 0)
        .sort((a, b) => b.avg_rating - a.avg_rating)
        .slice(0, 5);

      // Update UI
      this.updateStatsDisplay();
      this.renderRecentProducts();
      this.renderTopRatedProducts();
      this.renderSalesOverview();

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
      bannersCount: document.getElementById('bannersCount'),
      totalPromoSales: document.getElementById('totalPromoSales'),
      avgRating: document.getElementById('avgRating')
    };

    if (elements.productsCount) elements.productsCount.textContent = this.stats.products.toLocaleString();
    if (elements.brandsCount) elements.brandsCount.textContent = this.stats.brands.toLocaleString();
    if (elements.categoriesCount) elements.categoriesCount.textContent = this.stats.categories.toLocaleString();
    if (elements.bannersCount) elements.bannersCount.textContent = this.stats.banners.toLocaleString();
    if (elements.totalPromoSales) elements.totalPromoSales.textContent = this.stats.totalPromoSales.toLocaleString();
    if (elements.avgRating) elements.avgRating.textContent = this.stats.avgRating + ' ★';
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

  renderRecentProducts() {
    const container = document.getElementById('recentProductsList');
    if (!container) return;

    if (this.stats.recentProducts.length === 0) {
      container.innerHTML = '<div class="loading-placeholder">No recent products found</div>';
      return;
    }

    const productsHTML = this.stats.recentProducts.map(product => `
      <div class="product-item">
        <div class="product-image">
          <i class="fas fa-box"></i>
        </div>
        <div class="product-info">
          <div class="product-name">${this.escapeHtml(product.name)}</div>
          <div class="product-meta">
            ${product.brand_name || 'No Brand'} • ${product.category_name || 'No Category'}
          </div>
        </div>
      </div>
    `).join('');

    container.innerHTML = productsHTML;
  }

  // <div class="product-rating">
  //   ${product.avg_rating > 0 ? `★ ${product.avg_rating.toFixed(1)}` : 'No rating'}
  // </div>

  renderTopRatedProducts() {
    const container = document.getElementById('topRatedProductsList');
    if (!container) return;

    if (this.stats.topRatedProducts.length === 0) {
      container.innerHTML = '<div class="loading-placeholder">No rated products found</div>';
      return;
    }

    const productsHTML = this.stats.topRatedProducts.map(product => `
      <div class="product-item">
        <div class="product-image">
          <i class="fas fa-star"></i>
        </div>
        <div class="product-info">
          <div class="product-name">${this.escapeHtml(product.name)}</div>
          <div class="product-meta">
            ${product.total_raters || 0} reviews • Sold: ${product.total_sold || 0}
          </div>
        </div>
        <div class="product-rating">
          ★ ${product.avg_rating.toFixed(1)}
        </div>
      </div>
    `).join('');

    container.innerHTML = productsHTML;
  }

  renderSalesOverview() {
    const totalRevenue = this.stats.recentProducts.reduce((sum, product) =>
      sum + ((product.base_price || 0) * (product.total_sold || 0)), 0);

    const totalOrders = this.stats.recentProducts.reduce((sum, product) => sum + (product.total_sold || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Find top selling category
    const categoryStats = {};
    this.stats.recentProducts.forEach(product => {
      const category = product.category_name || 'Uncategorized';
      categoryStats[category] = (categoryStats[category] || 0) + (product.total_sold || 0);
    });

    const topCategory = Object.keys(categoryStats).reduce((a, b) =>
      categoryStats[a] > categoryStats[b] ? a : b, 'None');

    const elements = {
      totalRevenue: document.getElementById('totalRevenue'),
      totalOrders: document.getElementById('totalOrders'),
      avgOrderValue: document.getElementById('avgOrderValue'),
      topSellingCategory: document.getElementById('topSellingCategory')
    };

    if (elements.totalRevenue) elements.totalRevenue.textContent = `Rp ${totalRevenue.toLocaleString('id-ID')}`;
    if (elements.totalOrders) elements.totalOrders.textContent = totalOrders.toLocaleString();
    if (elements.avgOrderValue) elements.avgOrderValue.textContent = `Rp ${Math.round(avgOrderValue).toLocaleString('id-ID')}`;
    if (elements.topSellingCategory) elements.topSellingCategory.textContent = topCategory;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export default DashboardPage;
