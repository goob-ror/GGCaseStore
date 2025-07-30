/**
 * Dynamic Variants Input Component
 * Allows adding, editing, and removing product variants dynamically
 */
export class DynamicVariants {
  constructor(options = {}) {
    this.options = {
      maxVariants: 20,
      placeholder: 'Enter variant name (e.g., Size M - Red, 128GB - Black)',
      ...options
    };
    
    this.variants = [];
    this.containerId = null;
    this.onVariantsChange = options.onVariantsChange || (() => {});
  }

  /**
   * Create the HTML structure for the dynamic variants input
   */
  createHTML(containerId) {
    this.containerId = containerId;
    
    return `
      <div class="dynamic-variants" id="${containerId}">
        <div class="variants-header">
          <label class="form-label">Product Variants</label>
          <button type="button" class="btn btn-sm btn-outline-primary add-variant-btn" id="${containerId}-add">
            <i class="fas fa-plus"></i> Add Variant
          </button>
        </div>
        <div class="variants-list" id="${containerId}-list">
          <!-- Variants will be dynamically added here -->
        </div>
        <small class="form-text text-muted">
          Add different variants of your product (e.g., sizes, colors, storage options). Maximum ${this.options.maxVariants} variants.
        </small>
      </div>

      <style>
        .dynamic-variants {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
          background: #f9fafb;
        }

        .variants-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .variants-header .form-label {
          margin: 0;
          font-weight: 600;
          color: #374151;
        }

        .add-variant-btn {
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
          border: 1px solid #3b82f6;
          background: transparent;
          color: #3b82f6;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-variant-btn:hover {
          background: #3b82f6;
          color: white;
        }

        .add-variant-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .variants-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .variant-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .variant-item:hover {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .variant-input {
          flex: 1;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 0.875rem;
          transition: border-color 0.2s;
        }

        .variant-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .variant-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: #3b82f6;
          color: white;
          border-radius: 50%;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .remove-variant-btn {
          padding: 0.375rem;
          border: 1px solid #ef4444;
          background: transparent;
          color: #ef4444;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
        }

        .remove-variant-btn:hover {
          background: #ef4444;
          color: white;
        }

        .variants-empty {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
          font-style: italic;
        }

        .variants-count {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.5rem;
        }
      </style>
    `;
  }

  /**
   * Initialize the component after HTML is inserted
   */
  initialize(containerId) {
    this.containerId = containerId;
    this.bindEvents();
    this.render();
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    const addBtn = document.getElementById(`${this.containerId}-add`);
    if (addBtn) {
      addBtn.addEventListener('click', () => this.addVariant());
    }
  }

  /**
   * Add a new variant
   */
  addVariant(variantName = '') {
    if (this.variants.length >= this.options.maxVariants) {
      return;
    }

    const variant = {
      id: Date.now() + Math.random(),
      variant_name: variantName
    };

    this.variants.push(variant);
    this.render();
    this.onVariantsChange(this.variants);

    // Focus on the new input
    setTimeout(() => {
      const newInput = document.querySelector(`[data-variant-id="${variant.id}"]`);
      if (newInput) {
        newInput.focus();
      }
    }, 100);
  }

  /**
   * Remove a variant
   */
  removeVariant(variantId) {
    this.variants = this.variants.filter(v => v.id !== variantId);
    this.render();
    this.onVariantsChange(this.variants);
  }

  /**
   * Update a variant
   */
  updateVariant(variantId, variantName) {
    const variant = this.variants.find(v => v.id === variantId);
    if (variant) {
      variant.variant_name = variantName;
      this.onVariantsChange(this.variants);
    }
  }

  /**
   * Render the variants list
   */
  render() {
    const listContainer = document.getElementById(`${this.containerId}-list`);
    const addBtn = document.getElementById(`${this.containerId}-add`);
    
    if (!listContainer) return;

    if (this.variants.length === 0) {
      listContainer.innerHTML = `
        <div class="variants-empty">
          <i class="fas fa-tags"></i>
          <p>No variants added yet. Click "Add Variant" to get started.</p>
        </div>
      `;
    } else {
      listContainer.innerHTML = this.variants.map((variant, index) => `
        <div class="variant-item">
          <div class="variant-number">${index + 1}</div>
          <input 
            type="text" 
            class="variant-input" 
            placeholder="${this.options.placeholder}"
            value="${variant.variant_name || ''}"
            data-variant-id="${variant.id}"
          >
          <button 
            type="button" 
            class="remove-variant-btn" 
            data-variant-id="${variant.id}"
            title="Remove variant"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      `).join('');

      // Bind events for the new elements
      this.bindVariantEvents();
    }

    // Update add button state
    if (addBtn) {
      addBtn.disabled = this.variants.length >= this.options.maxVariants;
    }

    // Update count display
    this.updateCountDisplay();
  }

  /**
   * Bind events for variant items
   */
  bindVariantEvents() {
    const listContainer = document.getElementById(`${this.containerId}-list`);
    if (!listContainer) return;

    // Handle input changes
    listContainer.addEventListener('input', (e) => {
      if (e.target.classList.contains('variant-input')) {
        const variantId = parseFloat(e.target.dataset.variantId);
        this.updateVariant(variantId, e.target.value);
      }
    });

    // Handle remove buttons
    listContainer.addEventListener('click', (e) => {
      if (e.target.closest('.remove-variant-btn')) {
        const btn = e.target.closest('.remove-variant-btn');
        const variantId = parseFloat(btn.dataset.variantId);
        this.removeVariant(variantId);
      }
    });
  }

  /**
   * Update the count display
   */
  updateCountDisplay() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    let countElement = container.querySelector('.variants-count');
    if (!countElement) {
      countElement = document.createElement('div');
      countElement.className = 'variants-count';
      container.appendChild(countElement);
    }

    countElement.textContent = `${this.variants.length} of ${this.options.maxVariants} variants`;
  }

  /**
   * Set variants from external data
   */
  setVariants(variants) {
    this.variants = variants.map(variant => ({
      id: variant.id || Date.now() + Math.random(),
      variant_name: variant.variant_name || ''
    }));
    this.render();
  }

  /**
   * Get current variants
   */
  getVariants() {
    return this.variants.filter(v => v.variant_name && v.variant_name.trim());
  }

  /**
   * Clear all variants
   */
  clear() {
    this.variants = [];
    this.render();
    this.onVariantsChange(this.variants);
  }

  /**
   * Validate variants
   */
  validate() {
    const validVariants = this.getVariants();
    const errors = [];

    // Check for duplicate variant names
    const names = validVariants.map(v => v.variant_name.toLowerCase().trim());
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
    
    if (duplicates.length > 0) {
      errors.push('Duplicate variant names are not allowed');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
