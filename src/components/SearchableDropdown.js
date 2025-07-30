/**
 * Searchable Dropdown Component
 * Provides a dropdown with search functionality for categories and brands
 */
export class SearchableDropdown {
  constructor(options = {}) {
    this.options = {
      placeholder: 'Select an option...',
      searchPlaceholder: 'Search...',
      noResultsText: 'No results found',
      allowClear: true,
      ...options
    };
    
    this.items = [];
    this.filteredItems = [];
    this.selectedItem = null;
    this.isOpen = false;
    
    this.onSelect = options.onSelect || (() => {});
    this.onClear = options.onClear || (() => {});
  }

  /**
   * Create the HTML structure for the searchable dropdown
   */
  createHTML(containerId) {
    return `
      <div class="searchable-dropdown" id="${containerId}">
        <div class="dropdown-trigger" id="${containerId}-trigger">
          <div class="selected-value" id="${containerId}-selected">
            <span class="selected-text">${this.options.placeholder}</span>
            <div class="dropdown-icons">
              <button type="button" class="clear-btn" id="${containerId}-clear" style="display: none;">
                <i class="fas fa-times"></i>
              </button>
              <div class="dropdown-arrow">
                <i class="fas fa-chevron-down"></i>
              </div>
            </div>
          </div>
        </div>
        
        <div class="dropdown-menu" id="${containerId}-menu" style="display: none;">
          <div class="dropdown-search">
            <div class="search-input-wrapper">
              <i class="fas fa-search search-icon"></i>
              <input 
                type="text" 
                class="search-input" 
                id="${containerId}-search"
                placeholder="${this.options.searchPlaceholder}"
                autocomplete="off"
              >
            </div>
          </div>
          
          <div class="dropdown-options" id="${containerId}-options">
            <div class="loading-state">
              <i class="fas fa-spinner fa-spin"></i>
              Loading...
            </div>
          </div>
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
    this.trigger = document.getElementById(`${containerId}-trigger`);
    this.selected = document.getElementById(`${containerId}-selected`);
    this.selectedText = this.selected.querySelector('.selected-text');
    this.clearBtn = document.getElementById(`${containerId}-clear`);
    this.menu = document.getElementById(`${containerId}-menu`);
    this.searchInput = document.getElementById(`${containerId}-search`);
    this.optionsContainer = document.getElementById(`${containerId}-options`);
    this.arrow = this.selected.querySelector('.dropdown-arrow i');

    this.bindEvents();
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Toggle dropdown
    this.trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    // Clear selection
    this.clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.clear();
    });

    // Search input
    this.searchInput.addEventListener('input', (e) => {
      this.filterItems(e.target.value);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        this.close();
      }
    });

    // Keyboard navigation
    this.searchInput.addEventListener('keydown', (e) => {
      this.handleKeyNavigation(e);
    });
  }

  /**
   * Set items for the dropdown
   */
  setItems(items) {
    this.items = items.map(item => ({
      id: item.id,
      name: item.name,
      ...item
    }));
    this.filteredItems = [...this.items];
    this.renderOptions();
  }

  /**
   * Filter items based on search query
   */
  filterItems(query) {
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) {
      this.filteredItems = [...this.items];
    } else {
      this.filteredItems = this.items.filter(item =>
        item.name.toLowerCase().includes(searchTerm)
      );
    }
    
    this.renderOptions();
  }

  /**
   * Render dropdown options
   */
  renderOptions() {
    if (this.filteredItems.length === 0) {
      this.optionsContainer.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search"></i>
          ${this.options.noResultsText}
        </div>
      `;
      return;
    }

    const optionsHTML = this.filteredItems.map(item => `
      <div class="dropdown-option" data-id="${item.id}" data-name="${item.name}">
        <div class="option-content">
          <div class="option-name">${this.escapeHtml(item.name)}</div>
          ${item.description ? `<div class="option-description">${this.escapeHtml(item.description)}</div>` : ''}
        </div>
      </div>
    `).join('');

    this.optionsContainer.innerHTML = optionsHTML;

    // Bind option click events
    this.optionsContainer.querySelectorAll('.dropdown-option').forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(option.dataset.id);
        const name = option.dataset.name;
        this.selectItem({ id, name });
      });
    });
  }

  /**
   * Select an item
   */
  selectItem(item) {
    this.selectedItem = item;
    this.selectedText.textContent = item.name;
    this.selected.classList.add('has-value');
    
    if (this.options.allowClear) {
      this.clearBtn.style.display = 'block';
    }
    
    this.close();
    this.onSelect(item);
  }

  /**
   * Clear selection
   */
  clear() {
    this.selectedItem = null;
    this.selectedText.textContent = this.options.placeholder;
    this.selected.classList.remove('has-value');
    this.clearBtn.style.display = 'none';
    this.onClear();
  }

  /**
   * Open dropdown
   */
  open() {
    if (this.isOpen) return;
    
    this.isOpen = true;
    this.menu.style.display = 'block';
    this.container.classList.add('open');
    this.arrow.style.transform = 'rotate(180deg)';
    
    // Focus search input
    setTimeout(() => {
      this.searchInput.focus();
    }, 100);
    
    // Position dropdown
    this.positionDropdown();
  }

  /**
   * Close dropdown
   */
  close() {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    this.menu.style.display = 'none';
    this.container.classList.remove('open');
    this.arrow.style.transform = 'rotate(0deg)';
    this.searchInput.value = '';
    this.filteredItems = [...this.items];
    this.renderOptions();
  }

  /**
   * Toggle dropdown
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Position dropdown menu
   */
  positionDropdown() {
    const rect = this.trigger.getBoundingClientRect();
    const menuHeight = this.menu.offsetHeight;
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Position dropdown above if not enough space below
    if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
      this.menu.style.top = 'auto';
      this.menu.style.bottom = '100%';
      this.menu.style.marginBottom = '4px';
      this.menu.style.marginTop = '0';
    } else {
      this.menu.style.top = '100%';
      this.menu.style.bottom = 'auto';
      this.menu.style.marginTop = '4px';
      this.menu.style.marginBottom = '0';
    }
  }

  /**
   * Handle keyboard navigation
   */
  handleKeyNavigation(e) {
    const options = this.optionsContainer.querySelectorAll('.dropdown-option');
    const currentFocused = this.optionsContainer.querySelector('.dropdown-option.focused');
    let focusIndex = -1;

    if (currentFocused) {
      focusIndex = Array.from(options).indexOf(currentFocused);
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusIndex = Math.min(focusIndex + 1, options.length - 1);
        this.focusOption(options[focusIndex]);
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        focusIndex = Math.max(focusIndex - 1, 0);
        this.focusOption(options[focusIndex]);
        break;
        
      case 'Enter':
        e.preventDefault();
        if (currentFocused) {
          currentFocused.click();
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        this.close();
        break;
    }
  }

  /**
   * Focus an option
   */
  focusOption(option) {
    // Remove previous focus
    this.optionsContainer.querySelectorAll('.dropdown-option.focused').forEach(opt => {
      opt.classList.remove('focused');
    });
    
    // Add focus to new option
    if (option) {
      option.classList.add('focused');
      option.scrollIntoView({ block: 'nearest' });
    }
  }

  /**
   * Get selected value
   */
  getValue() {
    return this.selectedItem ? this.selectedItem.id : null;
  }

  /**
   * Set selected value
   */
  setValue(id) {
    const item = this.items.find(item => item.id === id);
    if (item) {
      this.selectItem(item);
    }
  }

  /**
   * Escape HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
