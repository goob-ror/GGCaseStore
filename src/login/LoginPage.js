import { AuthService } from '../lib/AuthService.js';
import { NotificationService } from '../components/NotificationService.js';

class LoginPage {
  constructor() {
    this.authService = new AuthService();
    this.notificationService = new NotificationService();
    this.showPassword = false;
    this.isLoading = false;
  }

  async render(container) {
    container.innerHTML = this.getHTML();
    this.bindEvents();
    this.updateLoginAttempts();
  }

  getHTML() {
    return `
      <div class="login-container">
        <div class="login-card">
          <div class="login-header">
            <h1>GG Case Catalogs</h1>
            <h2>Admin Dashboard</h2>
            <p>Sign in to manage your catalog</p>
          </div>
          
          <form class="login-form" id="loginForm">
            <div class="form-group">
              <label for="username" class="form-label">Username</label>
              <input 
                type="text" 
                id="username" 
                name="username" 
                class="form-control" 
                required 
                autocomplete="username"
                placeholder="Enter your username"
              >
            </div>
            
            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <div class="password-input-container">
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  class="form-control password-input" 
                  required 
                  autocomplete="current-password"
                  placeholder="Enter your password"
                >
                <button 
                  type="button" 
                  class="password-toggle" 
                  id="passwordToggle"
                  title="Toggle password visibility"
                >
                  <i class="fas fa-eye" id="passwordToggleIcon"></i>
                </button>
              </div>
            </div>
            
            <div class="login-attempts" id="loginAttempts"></div>
            
            <button 
              type="submit" 
              class="btn btn-primary btn-lg login-submit" 
              id="loginSubmit"
            >
              <span class="submit-text">Sign In</span>
              <span class="submit-loading d-none">
                <i class="fas fa-spinner fa-spin"></i>
                Signing in...
              </span>
            </button>
          </form>
          
          <div class="login-footer">
            <p class="text-center">
              <small>Secure admin access for authorized personnel only</small>
            </p>
          </div>
        </div>
      </div>
      
      <style>
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #E6B120 0%, #FFCD29 100%);
          padding: 2rem;
        }
        
        .login-card {
          background: #FFFFFF;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          padding: 3rem;
          width: 100%;
          max-width: 400px;
          border: 2px solid #E6B120;
        }
        
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .login-header h1 {
          color: #000000;
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
        }

        .login-header h2 {
          color: #E6B120;
          font-size: 1.25rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .login-header p {
          color: #000000;
          font-size: 0.875rem;
          margin-bottom: 0;
          opacity: 0.7;
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
          color: #E6B120;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 0.25rem;
          transition: color 0.2s;
        }

        .password-toggle:hover {
          color: #FFCD29;
        }
        
        .login-submit {
          width: 100%;
          margin-top: 1rem;
        }
        
        .login-attempts {
          margin-bottom: 1rem;
          padding: 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          text-align: center;
        }
        
        .login-attempts.warning {
          background-color: #fef3c7;
          color: #92400e;
          border: 1px solid #fcd34d;
        }
        
        .login-attempts.error {
          background-color: #fee2e2;
          color: #991b1b;
          border: 1px solid #fca5a5;
        }
        
        .login-attempts.hidden {
          display: none;
        }
        
        .login-footer {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }
        
        @media (max-width: 480px) {
          .login-container {
            padding: 1rem;
          }
          
          .login-card {
            padding: 2rem;
          }
        }
      </style>
    `;
  }

  bindEvents() {
    const form = document.getElementById('loginForm');
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('password');
    const passwordToggleIcon = document.getElementById('passwordToggleIcon');

    // Handle form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    // Handle password visibility toggle
    passwordToggle.addEventListener('click', () => {
      this.showPassword = !this.showPassword;
      passwordInput.type = this.showPassword ? 'text' : 'password';
      passwordToggleIcon.className = this.showPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
    });

    // Handle Enter key in password field
    passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleLogin();
      }
    });
  }

  async handleLogin() {
    if (this.isLoading) return;

    const form = document.getElementById('loginForm');
    const submitBtn = document.getElementById('loginSubmit');
    const submitText = submitBtn.querySelector('.submit-text');
    const submitLoading = submitBtn.querySelector('.submit-loading');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
      this.notificationService.error('Validation Error', 'Please enter both username and password');
      return;
    }

    this.isLoading = true;
    submitBtn.disabled = true;
    submitText.classList.add('d-none');
    submitLoading.classList.remove('d-none');

    try {
      await this.authService.login(username, password);
      this.notificationService.success('Login Successful', 'Welcome to the admin dashboard');
      
      // Redirect will be handled by the router
      setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 1000);
      
    } catch (error) {
      console.error('Login error:', error);
      this.notificationService.error('Login Failed', error.message);
      this.updateLoginAttempts();
      
      // Clear password field on failed login
      passwordInput.value = '';
      passwordInput.focus();
      
    } finally {
      this.isLoading = false;
      submitBtn.disabled = false;
      submitText.classList.remove('d-none');
      submitLoading.classList.add('d-none');
    }
  }

  updateLoginAttempts() {
    const attemptsContainer = document.getElementById('loginAttempts');
    if (!attemptsContainer) return;

    const remainingAttempts = this.authService.getRemainingAttempts();
    const isLocked = this.authService.isAccountLocked();
    const lockoutTime = this.authService.getLockoutTimeRemaining();

    if (isLocked) {
      const minutes = Math.ceil(lockoutTime / 1000 / 60);
      attemptsContainer.innerHTML = `
        <i class="fas fa-lock"></i>
        Account locked. Try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.
      `;
      attemptsContainer.className = 'login-attempts error';
    } else if (remainingAttempts < 5 && remainingAttempts > 0) {
      attemptsContainer.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        ${remainingAttempts} login attempt${remainingAttempts !== 1 ? 's' : ''} remaining
      `;
      attemptsContainer.className = 'login-attempts warning';
    } else {
      attemptsContainer.className = 'login-attempts hidden';
    }
  }
}

export default LoginPage;
