import { ApiService } from './ApiService.js';

class AuthService {
  constructor() {
    this.apiService = new ApiService();
    this.isAuthenticated = false;
    this.user = null;
    this.authStateListeners = [];
    this.loginAttempts = 0;
    this.maxLoginAttempts = 5;
    this.lockoutTime = 15 * 60 * 1000; // 15 minutes
    this.lockoutUntil = null;
  }

  async checkAuth() {
    try {
      const response = await this.apiService.get('/admin/session');
      if (response.success && response.data) {
        this.isAuthenticated = true;
        this.user = {
          id: response.data.id,
          username: response.data.username
        };
        this.notifyAuthStateChange(true);
        return true;
      } else {
        this.isAuthenticated = false;
        this.user = null;
        this.notifyAuthStateChange(false);
        return false;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      this.isAuthenticated = false;
      this.user = null;
      this.notifyAuthStateChange(false);
      return false;
    }
  }

  async login(username, password) {
    // Check if account is locked
    if (this.isAccountLocked()) {
      const remainingTime = Math.ceil((this.lockoutUntil - Date.now()) / 1000 / 60);
      throw new Error(`Account locked. Try again in ${remainingTime} minutes.`);
    }

    try {
      const response = await this.apiService.post('/admin/login', {
        username,
        password
      });

      if (response.success) {
        // Login successful, now get user session data
        const sessionResponse = await this.apiService.get('/admin/session');

        if (sessionResponse.success && sessionResponse.data) {
          this.isAuthenticated = true;
          this.user = {
            id: sessionResponse.data.id,
            username: sessionResponse.data.username
          };
          this.loginAttempts = 0; // Reset attempts on successful login
          this.lockoutUntil = null;
          this.notifyAuthStateChange(true);
          return response;
        } else {
          throw new Error('Failed to retrieve user session after login');
        }
      } else {
        this.handleFailedLogin();
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      this.handleFailedLogin();
      throw error;
    }
  }

  async logout() {
    try {
      await this.apiService.post('/admin/logout');
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      this.isAuthenticated = false;
      this.user = null;
      this.notifyAuthStateChange(false);
    }
  }

  handleFailedLogin() {
    this.loginAttempts++;
    
    if (this.loginAttempts >= this.maxLoginAttempts) {
      this.lockoutUntil = Date.now() + this.lockoutTime;
      localStorage.setItem('lockoutUntil', this.lockoutUntil.toString());
    }
  }

  isAccountLocked() {
    const storedLockout = localStorage.getItem('lockoutUntil');
    if (storedLockout) {
      this.lockoutUntil = parseInt(storedLockout);
      if (Date.now() < this.lockoutUntil) {
        return true;
      } else {
        // Lockout expired
        localStorage.removeItem('lockoutUntil');
        this.lockoutUntil = null;
        this.loginAttempts = 0;
      }
    }
    return false;
  }

  getRemainingAttempts() {
    return Math.max(0, this.maxLoginAttempts - this.loginAttempts);
  }

  getLockoutTimeRemaining() {
    if (!this.isAccountLocked()) return 0;
    return Math.max(0, this.lockoutUntil - Date.now());
  }

  onAuthStateChange(callback) {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  notifyAuthStateChange(isAuthenticated) {
    this.authStateListeners.forEach(callback => {
      try {
        callback(isAuthenticated, this.user);
      } catch (error) {
        console.error('Error in auth state listener:', error);
      }
    });
  }

  getUser() {
    return this.user;
  }

  isLoggedIn() {
    return this.isAuthenticated;
  }
}

export { AuthService };
