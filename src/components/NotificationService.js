class NotificationService {
  constructor() {
    this.container = null;
    this.notifications = [];
    this.nextId = 1;
  }

  init() {
    this.container = document.getElementById('notification-root');
    if (!this.container) {
      console.error('Notification root element not found');
      return;
    }
    
    // Add notification styles
    this.addStyles();
  }

  addStyles() {
    if (document.getElementById('notification-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      .notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 400px;
        pointer-events: none;
      }
      
      .notification {
        background: white;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        margin-bottom: 12px;
        padding: 16px;
        border-left: 4px solid;
        pointer-events: auto;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s ease;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        max-width: 100%;
        word-wrap: break-word;
      }
      
      .notification.show {
        transform: translateX(0);
        opacity: 1;
      }
      
      .notification.success {
        border-left-color: #10b981;
      }
      
      .notification.error {
        border-left-color: #ef4444;
      }
      
      .notification.warning {
        border-left-color: #f59e0b;
      }
      
      .notification.info {
        border-left-color: #3b82f6;
      }
      
      .notification-icon {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        margin-top: 2px;
      }
      
      .notification-content {
        flex: 1;
        min-width: 0;
      }
      
      .notification-title {
        font-weight: 600;
        font-size: 14px;
        margin-bottom: 4px;
        color: #1f2937;
      }
      
      .notification-message {
        font-size: 13px;
        color: #6b7280;
        line-height: 1.4;
      }
      
      .notification-close {
        background: none;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s;
        flex-shrink: 0;
      }
      
      .notification-close:hover {
        background-color: #f3f4f6;
        color: #6b7280;
      }
      
      @media (max-width: 640px) {
        .notification-container {
          left: 20px;
          right: 20px;
          max-width: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  show(type, title, message, duration = 5000) {
    const notification = {
      id: this.nextId++,
      type,
      title,
      message,
      duration
    };

    this.notifications.push(notification);
    this.render();

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(notification.id);
      }, duration);
    }

    return notification.id;
  }

  success(title, message, duration) {
    return this.show('success', title, message, duration);
  }

  error(title, message, duration) {
    return this.show('error', title, message, duration);
  }

  warning(title, message, duration) {
    return this.show('warning', title, message, duration);
  }

  info(title, message, duration) {
    return this.show('info', title, message, duration);
  }

  remove(id) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index > -1) {
      this.notifications.splice(index, 1);
      this.render();
    }
  }

  clear() {
    this.notifications = [];
    this.render();
  }

  render() {
    if (!this.container) return;

    // Create or get container
    let notificationContainer = this.container.querySelector('.notification-container');
    if (!notificationContainer) {
      notificationContainer = document.createElement('div');
      notificationContainer.className = 'notification-container';
      this.container.appendChild(notificationContainer);
    }

    // Clear existing notifications
    notificationContainer.innerHTML = '';

    // Render notifications
    this.notifications.forEach(notification => {
      const element = this.createNotificationElement(notification);
      notificationContainer.appendChild(element);
      
      // Trigger animation
      setTimeout(() => {
        element.classList.add('show');
      }, 10);
    });
  }

  createNotificationElement(notification) {
    const element = document.createElement('div');
    element.className = `notification ${notification.type}`;
    element.dataset.id = notification.id;

    const icon = this.getIcon(notification.type);
    
    element.innerHTML = `
      <div class="notification-icon">${icon}</div>
      <div class="notification-content">
        <div class="notification-title">${this.escapeHtml(notification.title)}</div>
        <div class="notification-message">${this.escapeHtml(notification.message)}</div>
      </div>
      <button class="notification-close" type="button">
        <i class="fas fa-times"></i>
      </button>
    `;

    // Add close handler
    const closeBtn = element.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      this.remove(notification.id);
    });

    return element;
  }

  getIcon(type) {
    const icons = {
      success: '<i class="fas fa-check-circle" style="color: #10b981;"></i>',
      error: '<i class="fas fa-exclamation-circle" style="color: #ef4444;"></i>',
      warning: '<i class="fas fa-exclamation-triangle" style="color: #f59e0b;"></i>',
      info: '<i class="fas fa-info-circle" style="color: #3b82f6;"></i>'
    };
    return icons[type] || icons.info;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export { NotificationService };
