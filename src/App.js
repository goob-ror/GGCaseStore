import Router from './route/Router.js';
import { AuthService } from './lib/AuthService.js';
import { NotificationService } from './components/NotificationService.js';

class App {
  constructor() {
    this.router = new Router();
    this.authService = new AuthService();
    this.notificationService = new NotificationService();
    this.init();
  }

  init() {
    // Initialize notification service
    this.notificationService.init();

    // Set up global error handling
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.notificationService.error('An unexpected error occurred');
    });

    // Set up auth state change listener
    this.authService.onAuthStateChange((isAuthenticated) => {
      if (!isAuthenticated && window.location.pathname.startsWith('/admin')) {
        this.router.navigate('/login');
      }
    });
  }

  mount(container) {
    this.container = container;
    this.router.init(container);
  }
}

export default App;