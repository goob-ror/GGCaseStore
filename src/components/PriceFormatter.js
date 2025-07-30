/**
 * IDR Price Formatter Component
 * Handles automatic formatting of price inputs to Indonesian Rupiah format
 */
export class PriceFormatter {
  constructor(options = {}) {
    this.options = {
      currency: 'IDR',
      locale: 'id-ID',
      allowNegative: false,
      maxValue: 999999999999, // 999 billion
      minValue: 0,
      placeholder: 'Rp 0',
      ...options
    };
    
    this.onValueChange = options.onValueChange || (() => {});
    this.onError = options.onError || (() => {});
  }

  /**
   * Create the HTML structure for the price input
   */
  createHTML(containerId, inputName = 'price', required = false) {
    return `
      <div class="price-formatter-container" id="${containerId}">
        <div class="price-input-wrapper">
          <div class="currency-prefix">Rp</div>
          <input 
            type="text" 
            id="${containerId}-input" 
            name="${inputName}"
            class="price-input form-control" 
            placeholder="0"
            autocomplete="off"
            ${required ? 'required' : ''}
          >
          <input 
            type="hidden" 
            id="${containerId}-value" 
            name="${inputName}_value"
            value="0"
          >
        </div>
        <div class="price-info" id="${containerId}-info">
          <small class="text-muted">Enter amount in Indonesian Rupiah</small>
        </div>
      </div>
    `;
  }

  /**
   * Initialize the component after HTML is inserted
   */
  initialize(containerId) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.input = document.getElementById(`${containerId}-input`);
    this.hiddenInput = document.getElementById(`${containerId}-value`);
    this.info = document.getElementById(`${containerId}-info`);

    this.bindEvents();
    this.formatValue(0); // Initialize with 0
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Format on input
    this.input.addEventListener('input', (e) => {
      this.handleInput(e);
    });

    // Handle paste
    this.input.addEventListener('paste', (e) => {
      setTimeout(() => {
        this.handleInput(e);
      }, 10);
    });

    // Handle focus
    this.input.addEventListener('focus', (e) => {
      this.handleFocus(e);
    });

    // Handle blur
    this.input.addEventListener('blur', (e) => {
      this.handleBlur(e);
    });

    // Prevent invalid characters
    this.input.addEventListener('keypress', (e) => {
      this.handleKeyPress(e);
    });
  }

  /**
   * Handle input changes
   */
  handleInput(e) {
    const rawValue = this.extractNumbers(e.target.value);
    const numericValue = this.parseNumber(rawValue);
    
    // Validate value
    if (numericValue > this.options.maxValue) {
      this.showError(`Maximum value is ${this.formatCurrency(this.options.maxValue)}`);
      return;
    }

    if (numericValue < this.options.minValue && numericValue !== 0) {
      this.showError(`Minimum value is ${this.formatCurrency(this.options.minValue)}`);
      return;
    }

    this.clearError();
    this.formatValue(numericValue);
    this.onValueChange(numericValue);
  }

  /**
   * Handle focus event
   */
  handleFocus(e) {
    // Select all text for easy editing
    setTimeout(() => {
      e.target.select();
    }, 10);
  }

  /**
   * Handle blur event
   */
  handleBlur(e) {
    const currentValue = this.getValue();
    this.formatValue(currentValue);
  }

  /**
   * Handle key press to prevent invalid characters
   */
  handleKeyPress(e) {
    const char = String.fromCharCode(e.which);
    const allowedChars = '0123456789';
    
    // Allow control keys (backspace, delete, etc.)
    if (e.which <= 32) return;
    
    // Allow only numbers
    if (allowedChars.indexOf(char) === -1) {
      e.preventDefault();
    }
  }

  /**
   * Extract numbers from string
   */
  extractNumbers(str) {
    return str.replace(/[^\d]/g, '');
  }

  /**
   * Parse number from string
   */
  parseNumber(str) {
    const num = parseInt(str) || 0;
    return Math.max(0, num);
  }

  /**
   * Format value and update inputs
   */
  formatValue(value) {
    const formattedValue = this.formatCurrency(value);
    const displayValue = value === 0 ? '' : formattedValue.replace('Rp ', '');
    
    this.input.value = displayValue;
    this.hiddenInput.value = value;
  }

  /**
   * Format number as Indonesian Rupiah
   */
  formatCurrency(value) {
    if (value === 0 || value === null || value === undefined) {
      return 'Rp 0';
    }

    try {
      return new Intl.NumberFormat(this.options.locale, {
        style: 'currency',
        currency: this.options.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    } catch (error) {
      // Fallback formatting
      return 'Rp ' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
  }

  /**
   * Get the numeric value
   */
  getValue() {
    return parseInt(this.hiddenInput.value) || 0;
  }

  /**
   * Set the value
   */
  setValue(value) {
    const numericValue = this.parseNumber(value.toString());
    this.formatValue(numericValue);
    this.onValueChange(numericValue);
  }

  /**
   * Clear the value
   */
  clear() {
    this.setValue(0);
  }

  /**
   * Show error message
   */
  showError(message) {
    this.container.classList.add('error');
    this.info.innerHTML = `<small class="text-danger"><i class="fas fa-exclamation-triangle"></i> ${message}</small>`;
    this.onError(message);
  }

  /**
   * Clear error message
   */
  clearError() {
    this.container.classList.remove('error');
    this.info.innerHTML = '<small class="text-muted">Enter amount in Indonesian Rupiah</small>';
  }

  /**
   * Validate current value
   */
  isValid() {
    const value = this.getValue();
    return value >= this.options.minValue && value <= this.options.maxValue;
  }

  /**
   * Get formatted display value
   */
  getFormattedValue() {
    return this.formatCurrency(this.getValue());
  }

  /**
   * Enable/disable the input
   */
  setEnabled(enabled) {
    this.input.disabled = !enabled;
    this.container.classList.toggle('disabled', !enabled);
  }

  /**
   * Set placeholder text
   */
  setPlaceholder(placeholder) {
    this.input.placeholder = placeholder;
  }

  /**
   * Focus the input
   */
  focus() {
    this.input.focus();
  }

  /**
   * Destroy the component
   */
  destroy() {
    if (this.container) {
      this.container.remove();
    }
  }
}

/**
 * Utility function to format price for display
 */
export function formatIDR(value) {
  if (value === 0 || value === null || value === undefined) {
    return 'Rp 0';
  }

  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  } catch (error) {
    // Fallback formatting
    return 'Rp ' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
}

/**
 * Utility function to parse IDR string to number
 */
export function parseIDR(str) {
  if (!str) return 0;
  const numbers = str.replace(/[^\d]/g, '');
  return parseInt(numbers) || 0;
}
