/**
 * QR Code Generator Component
 * Generates QR codes for products with customizable options
 */
import QRCode from 'qrcode';

export class QRCodeGenerator {
  constructor(options = {}) {
    this.options = {
      size: 200,
      margin: 4,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M', // L, M, Q, H
      type: 'canvas', // canvas, svg
      ...options
    };

    this.qrCode = null;
    this.isGenerating = false; // Flag to prevent multiple simultaneous generations
    this.onGenerated = options.onGenerated || (() => {});
    this.onError = options.onError || ((error) => console.error(error));
  }

  /**
   * Create the HTML structure for the QR code generator
   */
  createHTML(containerId) {
    return `
      <div class="qr-generator-container" id="${containerId}">
        <div class="qr-header">
          <h4 class="qr-title">
            <i class="fas fa-qrcode"></i>
            Product QR Code
          </h4>
          <div class="qr-actions">
            <button type="button" class="btn-icon btn-refresh" id="${containerId}-refresh" title="Regenerate QR Code">
              <i class="fas fa-sync-alt"></i>
            </button>
            <button type="button" class="btn-icon btn-download" id="${containerId}-download" title="Download QR Code" style="display: none;">
              <i class="fas fa-download"></i>
            </button>
          </div>
        </div>
        
        <div class="qr-content">
          <div class="qr-display" id="${containerId}-display">
            <div class="qr-placeholder">
              <i class="fas fa-qrcode"></i>
              <p>QR Code will appear here</p>
              <small>Enter product details to generate</small>
            </div>
          </div>
          
          <div class="qr-info" id="${containerId}-info">
            <div class="info-item">
              <label>QR Code Data:</label>
              <div class="qr-data" id="${containerId}-data">Not generated</div>
            </div>
            <div class="info-item">
              <label>Size:</label>
              <div class="qr-size">${this.options.size}x${this.options.size}px</div>
            </div>
          </div>
        </div>
        
        <div class="qr-loading" id="${containerId}-loading" style="display: none;">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Generating QR Code...</span>
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
    this.display = document.getElementById(`${containerId}-display`);
    this.placeholder = this.display.querySelector('.qr-placeholder');
    this.refreshBtn = document.getElementById(`${containerId}-refresh`);
    this.downloadBtn = document.getElementById(`${containerId}-download`);
    this.info = document.getElementById(`${containerId}-info`);
    this.dataElement = document.getElementById(`${containerId}-data`);
    this.loading = document.getElementById(`${containerId}-loading`);

    this.bindEvents();
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Refresh QR code
    this.refreshBtn.addEventListener('click', () => {
      if (this.lastData) {
        this.generateQRCode(this.lastData);
      }
    });

    // Download QR code
    this.downloadBtn.addEventListener('click', () => {
      this.downloadQRCode();
    });
  }

  /**
   * Generate QR code from product data
   */
  async generateFromProduct(productData) {
    const qrData = this.createProductQRData(productData);
    await this.generateQRCode(qrData);
  }

  /**
   * Create QR data from product information
   */
  createProductQRData(productData) {
    const baseUrl = window.location.origin;
    const productUrl = `${baseUrl}/detail?id=${productData.id}`;

    // Create structured data for QR code
    const qrData = {
      type: 'product',
      id: productData.id,
      name: productData.name,
      url: productUrl,
      brand: productData.brand_name || '',
      category: productData.category_name || '',
      timestamp: new Date().toISOString()
    };

    // For simple QR codes, just use the URL
    // For more complex data, use JSON
    if (this.options.includeDetails) {
      return JSON.stringify(qrData);
    } else {
      return productUrl;
    }
  }

  /**
   * Generate QR code from data string
   */
  async generateQRCode(data) {
    if (!data) {
      this.showPlaceholder();
      return;
    }

    // Prevent multiple simultaneous generations
    if (this.isGenerating) {
      return;
    }

    this.isGenerating = true;
    this.lastData = data;
    this.showLoading();

    try {
      // Import QRCode library dynamically
      const QRCode = await this.loadQRCodeLibrary();

      // Clear previous QR code
      this.clearDisplay();

      // Generate QR code
      if (this.options.type === 'canvas') {
        await this.generateCanvasQR(QRCode, data);
      } else {
        await this.generateSVGQR(QRCode, data);
      }

      this.updateInfo(data);
      this.showDownloadButton();
      this.onGenerated(data);

    } catch (error) {
      console.error('Error generating QR code:', error);
      this.showError('Failed to generate QR code');
      this.onError(error);
    } finally {
      this.isGenerating = false;
      this.hideLoading();
    }
  }

  /**
   * Load QRCode library
   */
  async loadQRCodeLibrary() {
    // Return the imported QRCode library
    return QRCode;
  }

  /**
   * Generate canvas-based QR code
   */
  async generateCanvasQR(QRCode, data) {
    const canvas = document.createElement('canvas');
    canvas.className = 'qr-canvas';
    
    await QRCode.toCanvas(canvas, data, {
      width: this.options.size,
      margin: this.options.margin,
      color: this.options.color,
      errorCorrectionLevel: this.options.errorCorrectionLevel
    });

    this.display.appendChild(canvas);
    this.qrCode = canvas;
  }

  /**
   * Generate SVG-based QR code
   */
  async generateSVGQR(QRCode, data) {
    const svgString = await QRCode.toString(data, {
      type: 'svg',
      width: this.options.size,
      margin: this.options.margin,
      color: this.options.color,
      errorCorrectionLevel: this.options.errorCorrectionLevel
    });

    const div = document.createElement('div');
    div.className = 'qr-svg';
    div.innerHTML = svgString;
    
    this.display.appendChild(div);
    this.qrCode = div.querySelector('svg');
  }

  /**
   * Show loading state
   */
  showLoading() {
    this.loading.style.display = 'flex';
    this.display.style.opacity = '0.5';
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    this.loading.style.display = 'none';
    this.display.style.opacity = '1';
  }

  /**
   * Show placeholder
   */
  showPlaceholder() {
    this.clearDisplay();
    this.placeholder.style.display = 'block';
    this.hideDownloadButton();
    this.dataElement.textContent = 'Not generated';
  }

  /**
   * Clear display
   */
  clearDisplay() {
    const existingQR = this.display.querySelector('.qr-canvas, .qr-svg');
    if (existingQR) {
      existingQR.remove();
    }
    this.placeholder.style.display = 'none';
  }

  /**
   * Show error message
   */
  showError(message) {
    this.clearDisplay();
    const errorDiv = document.createElement('div');
    errorDiv.className = 'qr-error';
    errorDiv.innerHTML = `
      <i class="fas fa-exclamation-triangle"></i>
      <p>${message}</p>
    `;
    this.display.appendChild(errorDiv);
  }

  /**
   * Update info display
   */
  updateInfo(data) {
    const truncatedData = data.length > 50 ? data.substring(0, 50) + '...' : data;
    this.dataElement.textContent = truncatedData;
    this.dataElement.title = data;
  }

  /**
   * Show download button
   */
  showDownloadButton() {
    this.downloadBtn.style.display = 'block';
  }

  /**
   * Hide download button
   */
  hideDownloadButton() {
    this.downloadBtn.style.display = 'none';
  }

  /**
   * Download QR code
   */
  downloadQRCode() {
    if (!this.qrCode) return;

    try {
      let dataUrl;
      let filename = 'qr-code';

      if (this.qrCode.tagName === 'CANVAS') {
        dataUrl = this.qrCode.toDataURL('image/png');
        filename += '.png';
      } else if (this.qrCode.tagName === 'svg') {
        const svgData = new XMLSerializer().serializeToString(this.qrCode);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        dataUrl = URL.createObjectURL(svgBlob);
        filename += '.svg';
      }

      // Create download link
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up object URL if created
      if (this.qrCode.tagName === 'svg') {
        URL.revokeObjectURL(dataUrl);
      }

    } catch (error) {
      console.error('Error downloading QR code:', error);
      this.onError(error);
    }
  }

  /**
   * Get QR code as data URL
   */
  getDataURL() {
    if (!this.qrCode) return null;

    if (this.qrCode.tagName === 'CANVAS') {
      return this.qrCode.toDataURL('image/png');
    } else if (this.qrCode.tagName === 'svg') {
      const svgData = new XMLSerializer().serializeToString(this.qrCode);
      return 'data:image/svg+xml;base64,' + btoa(svgData);
    }

    return null;
  }

  /**
   * Clear QR code
   */
  clear() {
    this.isGenerating = false; // Reset generation flag
    this.showPlaceholder();
    this.lastData = null;
    this.qrCode = null;
  }

  /**
   * Set options
   */
  setOptions(options) {
    this.options = { ...this.options, ...options };
    
    // Update size display
    const sizeElement = this.container.querySelector('.qr-size');
    if (sizeElement) {
      sizeElement.textContent = `${this.options.size}x${this.options.size}px`;
    }
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
