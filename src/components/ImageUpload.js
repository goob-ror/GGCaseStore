/**
 * Reusable Image Upload Component
 * Handles file selection, preview, compression, and WebP conversion
 */
import { ImageCropper } from './ImageCropper.js';

export class ImageUpload {
  constructor(options = {}) {
    this.options = {
      multiple: false,
      maxFiles: 1,
      maxSize: 10 * 1024 * 1024, // 10MB
      quality: 0.85,
      maxWidth: 800,
      maxHeight: 800,
      acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      enableCropping: false, // Enable 1:1 cropping for products, brands, categories
      cropAspectRatio: 1, // 1:1 for square images
      ...options
    };

    this.files = [];
    this.cropper = null;
    this.onFilesChange = options.onFilesChange || (() => {});
    this.onError = options.onError || ((error) => console.error(error));
    this.onExistingFileRemove = options.onExistingFileRemove || (() => {});
  }

  /**
   * Create the HTML structure for the image upload component
   */
  createHTML(containerId) {
    const isMultiple = this.options.multiple;
    const containerClass = isMultiple ? 'image-upload-container multiple-images' : 'image-upload-container single-image';

    return `
      <div class="${containerClass}" id="${containerId}">
        <div class="image-upload-area" id="${containerId}-upload-area">
          <input
            type="file"
            id="${containerId}-input"
            class="image-upload-input"
            accept="image/*"
            ${isMultiple ? 'multiple' : ''}
            style="display: none;"
          >
          <div class="upload-placeholder" id="${containerId}-placeholder">
            <div class="upload-icon">
              <i class="fas fa-images"></i>
            </div>
            <div class="upload-text">
              <p class="upload-title">
                ${isMultiple ? 'Upload Product Images' : 'Upload Image'}
              </p>
              <p class="upload-subtitle">
                ${isMultiple ? 'Select multiple images or drag and drop' : 'Click to browse or drag and drop'}
              </p>
              <p class="upload-info">
                ${isMultiple ? `Up to ${this.options.maxFiles} images` : 'Single image'} •
                Max ${Math.round(this.options.maxSize / (1024 * 1024))}MB each •
                JPG, PNG, WebP, GIF
              </p>
              ${isMultiple ? `
                <div class="upload-stats">
                  <span class="files-count">0 / ${this.options.maxFiles} images</span>
                </div>
              ` : ''}
            </div>
          </div>
          <div class="image-previews" id="${containerId}-previews" style="display: none;">
            <!-- Image previews will be inserted here -->
          </div>
          ${isMultiple ? `
            <div class="upload-actions" id="${containerId}-actions" style="display: none;">
              <button type="button" class="btn btn-outline-primary btn-sm add-more-btn" id="${containerId}-add-more">
                <i class="fas fa-plus"></i> Add More Images
              </button>
              <button type="button" class="btn btn-outline-danger btn-sm clear-all-btn" id="${containerId}-clear-all">
                <i class="fas fa-trash"></i> Clear All
              </button>
            </div>
          ` : ''}
        </div>
        <div class="upload-progress" id="${containerId}-progress" style="display: none;">
          <div class="progress-bar">
            <div class="progress-fill" id="${containerId}-progress-fill"></div>
          </div>
          <div class="progress-text" id="${containerId}-progress-text">Processing...</div>
        </div>
        ${this.options.enableCropping ? `
          <div id="${containerId}-cropper"></div>
        ` : ''}
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
    this.uploadArea = document.getElementById(`${containerId}-upload-area`);
    this.placeholder = document.getElementById(`${containerId}-placeholder`);
    this.previews = document.getElementById(`${containerId}-previews`);
    this.progress = document.getElementById(`${containerId}-progress`);
    this.progressFill = document.getElementById(`${containerId}-progress-fill`);
    this.progressText = document.getElementById(`${containerId}-progress-text`);

    // Multiple image specific elements
    if (this.options.multiple) {
      this.actions = document.getElementById(`${containerId}-actions`);
      this.addMoreBtn = document.getElementById(`${containerId}-add-more`);
      this.clearAllBtn = document.getElementById(`${containerId}-clear-all`);
      this.filesCount = this.placeholder.querySelector('.files-count');
    }

    // Initialize cropper if enabled
    if (this.options.enableCropping) {
      this.cropper = new ImageCropper({
        aspectRatio: this.options.cropAspectRatio,
        maxWidth: this.options.maxWidth,
        maxHeight: this.options.maxHeight,
        quality: this.options.quality
      });

      const cropperContainer = document.getElementById(`${containerId}-cropper`);
      if (cropperContainer) {
        cropperContainer.innerHTML = this.cropper.createHTML(`${containerId}-cropper-modal`);
        this.cropper.initialize(`${containerId}-cropper-modal`);
      }
    }

    this.bindEvents();
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Click to upload
    this.uploadArea.addEventListener('click', (e) => {
      if (e.target.closest('.remove-image')) return;
      if (e.target.closest('.add-more-btn')) return;
      if (e.target.closest('.clear-all-btn')) return;
      this.input.click();
    });

    // File input change
    this.input.addEventListener('change', (e) => {
      this.handleFiles(Array.from(e.target.files));
    });

    // Multiple image specific events
    if (this.options.multiple) {
      // Add more images button
      if (this.addMoreBtn) {
        this.addMoreBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.input.click();
        });
      }

      // Clear all images button
      if (this.clearAllBtn) {
        this.clearAllBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.clearAllFiles();
        });
      }
    }

    // Drag and drop
    this.uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.uploadArea.classList.add('drag-over');
    });

    this.uploadArea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      this.uploadArea.classList.remove('drag-over');
    });

    this.uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      this.uploadArea.classList.remove('drag-over');
      const files = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('image/')
      );
      this.handleFiles(files);
    });
  }

  /**
   * Handle selected files
   */
  async handleFiles(fileList) {
    if (!fileList.length) return;

    // Validate file count
    const totalFiles = this.files.length + fileList.length;
    if (totalFiles > this.options.maxFiles) {
      this.onError(`Maximum ${this.options.maxFiles} files allowed`);
      return;
    }

    this.showProgress();

    try {
      const processedFiles = [];
      
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        
        // Update progress
        const progress = ((i + 1) / fileList.length) * 100;
        this.updateProgress(progress, `Processing ${file.name}...`);

        // Validate file
        if (!this.validateFile(file)) continue;

        // Process file
        const processedFile = await this.processFile(file);
        if (processedFile) {
          processedFiles.push(processedFile);
        }
      }

      // Add processed files
      this.files.push(...processedFiles);
      this.updatePreviews();
      this.onFilesChange(this.files);

    } catch (error) {
      this.onError(`Error processing files: ${error.message}`);
    } finally {
      this.hideProgress();
    }
  }

  /**
   * Validate individual file
   */
  validateFile(file) {
    // Check file type
    if (!this.options.acceptedTypes.includes(file.type)) {
      this.onError(`${file.name}: Unsupported file type`);
      return false;
    }

    // Check file size
    if (file.size > this.options.maxSize) {
      this.onError(`${file.name}: File too large (max ${Math.round(this.options.maxSize / (1024 * 1024))}MB)`);
      return false;
    }

    return true;
  }

  /**
   * Process file: compress and convert to WebP
   */
  async processFile(file) {
    // If cropping is enabled, show cropper first
    if (this.options.enableCropping && this.cropper) {
      try {
        const croppedBlob = await this.cropper.show(file);
        if (!croppedBlob) {
          // User cancelled cropping
          return null;
        }

        // Create a new file from the cropped blob
        const croppedFile = new File([croppedBlob],
          file.name.replace(/\.[^/.]+$/, '.webp'),
          { type: 'image/webp' }
        );

        // Create preview URL
        const previewUrl = URL.createObjectURL(croppedBlob);

        return {
          file: croppedFile,
          originalFile: file,
          previewUrl: previewUrl,
          name: file.name,
          size: croppedBlob.size
        };
      } catch (error) {
        throw new Error(`Cropping failed: ${error.message}`);
      }
    }

    // Standard processing without cropping
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          // Calculate new dimensions
          let { width, height } = this.calculateDimensions(img.width, img.height);

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              const processedFile = new File([blob],
                file.name.replace(/\.[^/.]+$/, '.webp'),
                { type: 'image/webp' }
              );

              // Create preview URL
              const previewUrl = URL.createObjectURL(blob);

              resolve({
                file: processedFile,
                originalFile: file,
                previewUrl: previewUrl,
                name: file.name,
                size: blob.size
              });
            } else {
              reject(new Error('Failed to compress image'));
            }
          }, 'image/webp', this.options.quality);

        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Calculate new dimensions maintaining aspect ratio
   */
  calculateDimensions(originalWidth, originalHeight) {
    const { maxWidth, maxHeight } = this.options;
    
    if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
      return { width: originalWidth, height: originalHeight };
    }

    const aspectRatio = originalWidth / originalHeight;
    
    if (originalWidth > originalHeight) {
      return {
        width: Math.min(maxWidth, originalWidth),
        height: Math.min(maxWidth / aspectRatio, originalHeight)
      };
    } else {
      return {
        width: Math.min(maxHeight * aspectRatio, originalWidth),
        height: Math.min(maxHeight, originalHeight)
      };
    }
  }

  /**
   * Update image previews
   */
  updatePreviews() {
    // Update file count for multiple images
    if (this.options.multiple && this.filesCount) {
      this.filesCount.textContent = `${this.files.length} / ${this.options.maxFiles} images`;
    }

    if (this.files.length === 0) {
      this.placeholder.style.display = 'block';
      this.previews.style.display = 'none';
      if (this.actions) {
        this.actions.style.display = 'none';
      }
      return;
    }

    this.placeholder.style.display = 'none';
    this.previews.style.display = 'block';
    if (this.actions) {
      this.actions.style.display = 'flex';
    }

    const previewsHTML = this.files.map((fileData, index) => `
      <div class="image-preview" data-index="${index}">
        <div class="preview-image">
          <img src="${fileData.previewUrl}" alt="${fileData.name}">
          <button type="button" class="remove-image" data-index="${index}" title="Remove image">
            <i class="fas fa-times"></i>
          </button>
          ${this.options.multiple ? `
            <div class="image-index">${index + 1}</div>
          ` : ''}
        </div>
        <div class="preview-info">
          <div class="preview-name" title="${fileData.name}">${fileData.name}</div>
          <div class="preview-size">${this.formatFileSize(fileData.size)}</div>
        </div>
      </div>
    `).join('');

    this.previews.innerHTML = previewsHTML;

    // Bind remove buttons
    this.previews.querySelectorAll('.remove-image').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        this.removeFile(index);
      });
    });

    // Update add more button state
    if (this.addMoreBtn) {
      if (this.files.length >= this.options.maxFiles) {
        this.addMoreBtn.disabled = true;
        this.addMoreBtn.innerHTML = '<i class="fas fa-check"></i> Maximum Reached';
      } else {
        this.addMoreBtn.disabled = false;
        this.addMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Add More Images';
      }
    }
  }

  /**
   * Remove file by index
   */
  async removeFile(index) {
    if (this.files[index]) {
      const fileData = this.files[index];

      // If it's an existing file, call the removal callback
      if (fileData.isExisting && fileData.id) {
        try {
          await this.onExistingFileRemove(fileData.id, fileData);
        } catch (error) {
          console.error('Error removing existing file:', error);
          this.onError('Failed to delete image from server');
          return; // Don't remove from UI if server deletion failed
        }
      }

      // Revoke object URL to free memory
      if (fileData.previewUrl && !fileData.isExisting) {
        URL.revokeObjectURL(fileData.previewUrl);
      }

      this.files.splice(index, 1);
      this.updatePreviews();
      this.onFilesChange(this.files);
    }
  }

  /**
   * Clear all files
   */
  clearAllFiles() {
    // Revoke all object URLs to free memory
    this.files.forEach(fileData => {
      if (fileData.previewUrl && !fileData.isExisting) {
        URL.revokeObjectURL(fileData.previewUrl);
      }
    });

    this.files = [];
    this.updatePreviews();
    this.onFilesChange(this.files);
  }

  /**
   * Show progress indicator
   */
  showProgress() {
    this.progress.style.display = 'block';
  }

  /**
   * Hide progress indicator
   */
  hideProgress() {
    this.progress.style.display = 'none';
  }

  /**
   * Update progress
   */
  updateProgress(percent, text) {
    this.progressFill.style.width = `${percent}%`;
    this.progressText.textContent = text;
  }

  /**
   * Format file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get processed files (only new files, not existing ones)
   */
  getFiles() {
    return this.files
      .filter(fileData => !fileData.isExisting && fileData.file)
      .map(fileData => fileData.file);
  }

  /**
   * Get all files including existing ones (for display purposes)
   */
  getAllFiles() {
    return this.files;
  }

  /**
   * Get only new files that need to be uploaded
   */
  getNewFiles() {
    return this.getFiles(); // Same as getFiles() now
  }

  /**
   * Clear all files
   */
  clear() {
    this.files.forEach(fileData => {
      URL.revokeObjectURL(fileData.previewUrl);
    });
    this.files = [];
    this.updatePreviews();
    this.onFilesChange(this.files);
  }

  /**
   * Set existing files (for edit mode)
   * @param {Array} data - Array of URLs (strings) or objects with {id, url, isExisting}
   */
  setExistingFiles(data) {
    this.files = data.map((item, index) => {
      if (typeof item === 'string') {
        // Legacy support for URL strings
        return {
          previewUrl: item,
          name: `existing-${index}.webp`,
          size: 0,
          isExisting: true,
          url: item
        };
      } else {
        // New format with ID for deletion
        return {
          id: item.id,
          previewUrl: item.url,
          name: `existing-${index}.webp`,
          size: 0,
          isExisting: true,
          url: item.url
        };
      }
    });
    this.updatePreviews();
  }
}
