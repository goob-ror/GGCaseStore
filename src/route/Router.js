import LoginPage from '../login/LoginPage.js';
import AdminDashboard from '../admin/AdminDashboard.js';
import DashboardPage from '../admin/pages/DashboardPage.js';
import ProductsPage from '../admin/pages/ProductsPage.js';
import BrandsPage from '../admin/pages/BrandsPage.js';
import CategoriesPage from '../admin/pages/CategoriesPage.js';
import BannersPage from '../admin/pages/BannersPage.js';
import AdminManagementPage from '../admin/pages/AdminManagementPage.js';
import { AuthService } from '../lib/AuthService.js';

// User

import HomePage from '../pages/home/index.js';
import KatalogPage from '../pages/katalog/index.js';
import WishListPage from '../pages/wishlist/index.js';
import UserBrandsPage from '../pages/brands/index.js';
import UserSearchResult from '../pages/searchResult/index.js';
import DetailPage from '../pages/detail/DetailPage.js';

class Router {
  constructor() {
    this.routes = new Map();
    this.container = null;
    this.currentRoute = null;
    this.authService = new AuthService();
    this.setupRoutes();
  }
  setupRoutes() {
    // Public routes
    this.routes.set('/', { component: HomePage, requiresAuth: false });
    this.routes.set('/katalog', { component: KatalogPage, requiresAuth: false });
    this.routes.set('/wishlist', { component: WishListPage, requiresAuth: false });
    this.routes.set('/brands', { component: UserBrandsPage, requiresAuth: false });
    this.routes.set('/detail', { component: DetailPage, requiresAuth: false });
    this.routes.set('/search', { component: UserSearchResult, requiresAuth: false });
    this.routes.set('/login', { component: LoginPage, requiresAuth: false });

    // Admin routes (protected)
    this.routes.set('/admin', { component: AdminDashboard, requiresAuth: true, defaultChild: '/admin/dashboard' });
    this.routes.set('/admin/dashboard', { component: DashboardPage, requiresAuth: true, parent: '/admin' });
    this.routes.set('/admin/products', { component: ProductsPage, requiresAuth: true, parent: '/admin' });
    this.routes.set('/admin/brands', { component: BrandsPage, requiresAuth: true, parent: '/admin' });
    this.routes.set('/admin/categories', { component: CategoriesPage, requiresAuth: true, parent: '/admin' });
    this.routes.set('/admin/banners', { component: BannersPage, requiresAuth: true, parent: '/admin' });
    this.routes.set('/admin/admins', { component: AdminManagementPage, requiresAuth: true, parent: '/admin' });
  }

  init(container) {
    this.container = container;

    // Handle browser navigation
    window.addEventListener('popstate', () => {
      this.handleRoute();
    });

    // Handle hash changes (if needed for other functionality)
    window.addEventListener('hashchange', () => {
      this.handleHashRoute();
    });

    // Handle initial route
    this.handleRoute();
  }

  navigate(path, replace = false) {
    if (replace) {
      window.history.replaceState({}, '', path);
    } else {
      window.history.pushState({}, '', path);
    }
    this.handleRoute();
  }

  async handleHashRoute() {
    // Handle hash-based routing by converting to regular URLs
    const hash = window.location.hash;

    if (hash.startsWith('#/')) {
      // Extract the path from hash
      const hashPath = hash.substring(1); // Remove the #

      // If it's a detail page with query params, convert to regular URL
      if (hashPath.includes('/detail?')) {
        const [path, query] = hashPath.split('?');
        if (path === '/detail' && query) {
          // Redirect to regular URL format
          window.location.href = `/detail?${query}`;
          return;
        }
      }

      // For other hash routes, convert to regular URLs
      if (hashPath.startsWith('/detail/')) {
        const productId = hashPath.split('/detail/')[1];
        if (productId) {
          window.location.href = `/detail?id=${productId}`;
          return;
        }
      }

      // For any other hash routes, redirect to regular URL
      window.location.href = hashPath;
      return;
    }

    // If no hash routing needed, handle normal routing
    this.handleRoute();
  }

  async handleRoute() {
    const path = window.location.pathname;
    let route = this.routes.get(path);

    // If no exact match, try to find parent route
    if (!route) {
      for (const [routePath, routeConfig] of this.routes) {
        if (path.startsWith(routePath) && routeConfig.defaultChild) {
          route = routeConfig;
          break;
        }
      }
    }

    // Default to home if no route found (changed from login for user pages)
    if (!route) {
      this.navigate('/', true);
      return;
    }

    // Check authentication
    const isAuthenticated = await this.authService.checkAuth();

    if (route.requiresAuth && !isAuthenticated) {
      this.navigate('/login', true);
      return;
    }

    // Redirect authenticated users away from login/root pages
    if (!route.requiresAuth && isAuthenticated && (path === '/login')) {
      this.navigate('/admin/dashboard', true);
      return;
    }

    // Handle default child routes
    if (route.defaultChild && path === Object.keys(Object.fromEntries(this.routes)).find(key => this.routes.get(key) === route)) {
      this.navigate(route.defaultChild, true);
      return;
    }

    // Render the route
    await this.renderRoute(route, path);
  }

  async renderRoute(route, path) {
    if (!this.container) return;

    try {
      // Add exit animation to current content if it exists
      const existingContent = this.container.querySelector('.route-transition');
      if (existingContent) {
        existingContent.classList.add('exiting');
        await new Promise(resolve => setTimeout(resolve, 300)); // Wait for exit animation
      }

      // Create new route container with transition
      const routeContainer = document.createElement('div');
      routeContainer.className = 'route-transition entering';

      // Clear container and add new route container
      this.container.innerHTML = '';
      this.container.appendChild(routeContainer);

      // Create component instance
      const ComponentClass = route.component;
      const component = new ComponentClass();

      // Handle parent-child relationship for admin routes
      if (route.parent) {
        const parentRoute = this.routes.get(route.parent);
        if (parentRoute) {
          const parentComponent = new parentRoute.component();
          await parentComponent.render(routeContainer);

          // Find the content area in the parent component
          const contentArea = routeContainer.querySelector('.admin-content');
          if (contentArea) {
            await component.render(contentArea);
          } else {
            await component.render(routeContainer);
          }
        } else {
          await component.render(routeContainer);
        }
      } else {
        await component.render(routeContainer);
      }

      // Add page container class for additional animations
      const pageContent = routeContainer.firstElementChild;
      if (pageContent) {
        pageContent.classList.add('page-container');
        // Trigger enter animation after a small delay
        setTimeout(() => {
          pageContent.classList.add('page-enter');
        }, 50);
      }

      // Remove entering class after animation completes
      setTimeout(() => {
        routeContainer.classList.remove('entering');
      }, 400);

      this.currentRoute = { route, path, component };

    } catch (error) {
      console.error('Error rendering route:', error);
      this.container.innerHTML = `
        <div class="route-transition" style="padding: 2rem; text-align: center;">
          <h2>Error Loading Page</h2>
          <p>There was an error loading this page. Please try again.</p>
          <button onclick="window.location.reload()" class="btn btn-primary">Reload Page</button>
        </div>
      `;
    }
  }

  getCurrentRoute() {
    return this.currentRoute;
  }
}

export default Router;
