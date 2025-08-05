/**
 * Image Cropper Component
 * Provides 1:1 aspect ratio cropping functionality for images
 */
export class ImageCropper {
  constructor(options = {}) {
    this.options = {
      aspectRatio: 1, // 1:1 for square images
      quality: 0.85,
      outputFormat: 'webp',
      maxWidth: 800,
      maxHeight: 800,
      ...options
    };
    
    this.canvas = null;
    this.ctx = null;
    this.image = null;
    this.cropArea = {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };
    this.isDragging = false;
    this.isResizing = false;
    this.resizeHandle = null;
    this.dragStart = { x: 0, y: 0 };
    this.onCropComplete = options.onCropComplete || (() => {});
    this.onCancel = options.onCancel || (() => {});
  }

  /**
   * Create the HTML structure for the image cropper
   */
  createHTML(containerId) {
    const aspectRatioText = this.options.aspectRatio === 1 ? '1:1 square ratio' :
                           this.options.aspectRatio === 3 ? '3:1 banner ratio' :
                           `${this.options.aspectRatio}:1 ratio`;

    return `
      <div class="image-cropper-modal" id="${containerId}" style="display: none;">
        <div class="cropper-backdrop"></div>
        <div class="cropper-content">
          <div class="cropper-header">
            <h3>Crop Image</h3>
            <p>Drag to adjust the crop area. Images will be cropped to a ${aspectRatioText}.</p>
          </div>
          <div class="cropper-body">
            <div class="cropper-canvas-container">
              <canvas id="${containerId}-canvas" class="cropper-canvas"></canvas>
              <div class="crop-overlay" id="${containerId}-overlay">
                <div class="crop-area" id="${containerId}-crop-area">
                  <div class="crop-handle crop-handle-nw"></div>
                  <div class="crop-handle crop-handle-ne"></div>
                  <div class="crop-handle crop-handle-sw"></div>
                  <div class="crop-handle crop-handle-se"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="cropper-footer">
            <button type="button" class="btn btn-secondary" id="${containerId}-cancel">
              <i class="fas fa-times"></i> Cancel
            </button>
            <button type="button" class="btn btn-primary" id="${containerId}-crop">
              <i class="fas fa-crop"></i> Crop Image
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Initialize the cropper after HTML is inserted
   */
  initialize(containerId) {
    this.containerId = containerId;
    this.modal = document.getElementById(containerId);
    this.canvas = document.getElementById(`${containerId}-canvas`);
    this.ctx = this.canvas.getContext('2d');
    this.overlay = document.getElementById(`${containerId}-overlay`);
    this.cropAreaEl = document.getElementById(`${containerId}-crop-area`);
    this.cancelBtn = document.getElementById(`${containerId}-cancel`);
    this.cropBtn = document.getElementById(`${containerId}-crop`);

    this.bindEvents();
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Cancel button
    this.cancelBtn.addEventListener('click', () => {
      this.hide();
      this.onCancel();
    });

    // Crop button
    this.cropBtn.addEventListener('click', () => {
      this.performCrop();
    });

    // Backdrop click to cancel
    this.modal.querySelector('.cropper-backdrop').addEventListener('click', () => {
      this.hide();
      this.onCancel();
    });

    // Crop area dragging
    this.cropAreaEl.addEventListener('mousedown', this.startDrag.bind(this));
    document.addEventListener('mousemove', this.drag.bind(this));
    document.addEventListener('mouseup', this.endDrag.bind(this));

    // Crop handles resizing
    const handles = this.modal.querySelectorAll('.crop-handle');
    handles.forEach(handle => {
      handle.addEventListener('mousedown', this.startResize.bind(this));
    });

    // Prevent context menu on canvas
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  /**
   * Show the cropper with an image
   */
  show(imageFile) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          this.image = img;
          this.setupCanvas();
          this.modal.style.display = 'block';
          document.body.style.overflow = 'hidden';
          
          // Set up promise resolution
          this.onCropComplete = resolve;
          this.onCancel = () => resolve(null);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });
  }

  /**
   * Hide the cropper
   */
  hide() {
    this.modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  /**
   * Setup canvas and initial crop area
   */
  setupCanvas() {
    const containerWidth = 600;
    const containerHeight = 400;
    
    // Calculate display size maintaining aspect ratio
    const imgAspect = this.image.width / this.image.height;
    let displayWidth, displayHeight;
    
    if (imgAspect > containerWidth / containerHeight) {
      displayWidth = containerWidth;
      displayHeight = containerWidth / imgAspect;
    } else {
      displayHeight = containerHeight;
      displayWidth = containerHeight * imgAspect;
    }

    this.canvas.width = displayWidth;
    this.canvas.height = displayHeight;
    this.canvas.style.width = displayWidth + 'px';
    this.canvas.style.height = displayHeight + 'px';

    // Draw image
    this.ctx.drawImage(this.image, 0, 0, displayWidth, displayHeight);

    // Setup initial crop area based on aspect ratio
    let cropWidth, cropHeight;

    if (this.options.aspectRatio === 1) {
      // Square crop (1:1)
      const cropSize = Math.min(displayWidth, displayHeight) * 0.8;
      cropWidth = cropSize;
      cropHeight = cropSize;
    } else {
      // Rectangular crop (e.g., 3:1 for banners)
      const maxWidth = displayWidth * 0.9;
      const maxHeight = displayHeight * 0.8;

      // Calculate dimensions maintaining aspect ratio
      if (maxWidth / this.options.aspectRatio <= maxHeight) {
        cropWidth = maxWidth;
        cropHeight = maxWidth / this.options.aspectRatio;
      } else {
        cropHeight = maxHeight;
        cropWidth = maxHeight * this.options.aspectRatio;
      }
    }

    this.cropArea = {
      x: (displayWidth - cropWidth) / 2,
      y: (displayHeight - cropHeight) / 2,
      width: cropWidth,
      height: cropHeight
    };

    this.updateCropAreaDisplay();
  }

  /**
   * Update crop area display
   */
  updateCropAreaDisplay() {
    this.cropAreaEl.style.left = this.cropArea.x + 'px';
    this.cropAreaEl.style.top = this.cropArea.y + 'px';
    this.cropAreaEl.style.width = this.cropArea.width + 'px';
    this.cropAreaEl.style.height = this.cropArea.height + 'px';
  }

  /**
   * Constrain crop area to canvas bounds
   */
  constrainCropArea() {
    // Ensure crop area doesn't go beyond canvas boundaries
    this.cropArea.x = Math.max(0, Math.min(this.cropArea.x, this.canvas.width - this.cropArea.width));
    this.cropArea.y = Math.max(0, Math.min(this.cropArea.y, this.canvas.height - this.cropArea.height));
    
    // If crop area is too large for canvas, resize it
    if (this.cropArea.width > this.canvas.width) {
      this.cropArea.width = this.canvas.width;
      this.cropArea.height = this.cropArea.width / this.options.aspectRatio;
      this.cropArea.x = 0;
    }
    
    if (this.cropArea.height > this.canvas.height) {
      this.cropArea.height = this.canvas.height;
      this.cropArea.width = this.cropArea.height * this.options.aspectRatio;
      this.cropArea.y = 0;
    }
    
    // Final constraint check after potential resizing
    this.cropArea.x = Math.max(0, Math.min(this.cropArea.x, this.canvas.width - this.cropArea.width));
    this.cropArea.y = Math.max(0, Math.min(this.cropArea.y, this.canvas.height - this.cropArea.height));
  }

  /**
   * Start dragging crop area
   */
  startDrag(e) {
    // Only start dragging if not clicking on a resize handle
    if (e.target.classList.contains('crop-handle')) {
      return;
    }
    
    this.isDragging = true;
    const rect = this.canvas.getBoundingClientRect();
    this.dragStart = {
      x: e.clientX - rect.left - this.cropArea.x,
      y: e.clientY - rect.top - this.cropArea.y
    };
    e.preventDefault();
  }

  /**
   * Drag crop area
   */
  drag(e) {
    if (this.isDragging) {
      const rect = this.canvas.getBoundingClientRect();
      const newX = e.clientX - rect.left - this.dragStart.x;
      const newY = e.clientY - rect.top - this.dragStart.y;

      // Apply constraints immediately
      this.cropArea.x = Math.max(0, Math.min(newX, this.canvas.width - this.cropArea.width));
      this.cropArea.y = Math.max(0, Math.min(newY, this.canvas.height - this.cropArea.height));

      this.updateCropAreaDisplay();
    } else if (this.isResizing) {
      this.resize(e);
    }
  }

  /**
   * End dragging
   */
  endDrag() {
    this.isDragging = false;
    this.isResizing = false;
    this.resizeHandle = null;
  }

  /**
   * Start resizing crop area
   */
  startResize(e) {
    this.isResizing = true;
    this.resizeHandle = e.target.className.split(' ').find(cls => cls.startsWith('crop-handle-'));
    
    const rect = this.canvas.getBoundingClientRect();
    this.dragStart = {
      x: e.clientX,
      y: e.clientY,
      canvasX: e.clientX - rect.left,
      canvasY: e.clientY - rect.top,
      cropX: this.cropArea.x,
      cropY: this.cropArea.y,
      cropWidth: this.cropArea.width,
      cropHeight: this.cropArea.height
    };
    e.preventDefault();
    e.stopPropagation();
  }

  /**
   * Resize crop area with proper boundary constraints
   */
  resize(e) {
    if (!this.isResizing || !this.resizeHandle) return;

    const rect = this.canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    const deltaX = e.clientX - this.dragStart.x;
    const deltaY = e.clientY - this.dragStart.y;

    let newX = this.dragStart.cropX;
    let newY = this.dragStart.cropY;
    let newWidth = this.dragStart.cropWidth;
    let newHeight = this.dragStart.cropHeight;

    // Calculate new dimensions based on handle and constrain to canvas bounds
    switch (this.resizeHandle) {
      case 'crop-handle-nw':
        // Northwest handle: constrain to canvas bounds
        newX = Math.max(0, Math.min(currentX, this.dragStart.cropX + this.dragStart.cropWidth - 20));
        newY = Math.max(0, Math.min(currentY, this.dragStart.cropY + this.dragStart.cropHeight - 20));
        newWidth = this.dragStart.cropX + this.dragStart.cropWidth - newX;
        newHeight = this.dragStart.cropY + this.dragStart.cropHeight - newY;
        break;
        
      case 'crop-handle-ne':
        // Northeast handle
        newY = Math.max(0, Math.min(currentY, this.dragStart.cropY + this.dragStart.cropHeight - 20));
        newWidth = Math.max(20, Math.min(currentX - this.dragStart.cropX, this.canvas.width - this.dragStart.cropX));
        newHeight = this.dragStart.cropY + this.dragStart.cropHeight - newY;
        break;
        
      case 'crop-handle-sw':
        // Southwest handle
        newX = Math.max(0, Math.min(currentX, this.dragStart.cropX + this.dragStart.cropWidth - 20));
        newWidth = this.dragStart.cropX + this.dragStart.cropWidth - newX;
        newHeight = Math.max(20, Math.min(currentY - this.dragStart.cropY, this.canvas.height - this.dragStart.cropY));
        break;
        
      case 'crop-handle-se':
        // Southeast handle
        newWidth = Math.max(20, Math.min(currentX - this.dragStart.cropX, this.canvas.width - this.dragStart.cropX));
        newHeight = Math.max(20, Math.min(currentY - this.dragStart.cropY, this.canvas.height - this.dragStart.cropY));
        break;
    }

    // Maintain aspect ratio while respecting canvas bounds
    if (this.options.aspectRatio === 1) {
      // Square aspect ratio (1:1)
      const size = Math.min(newWidth, newHeight);
      
      // Ensure the square fits within canvas bounds from current position
      const maxSizeFromX = this.canvas.width - newX;
      const maxSizeFromY = this.canvas.height - newY;
      const constrainedSize = Math.min(size, maxSizeFromX, maxSizeFromY);
      
      newWidth = Math.max(20, constrainedSize);
      newHeight = Math.max(20, constrainedSize);
    } else {
      // Rectangular aspect ratio (e.g., 3:1)
      const widthBasedHeight = newWidth / this.options.aspectRatio;
      const heightBasedWidth = newHeight * this.options.aspectRatio;

      // Choose the dimension that keeps us within bounds
      if (widthBasedHeight <= newHeight && newY + widthBasedHeight <= this.canvas.height) {
        newHeight = widthBasedHeight;
      } else if (heightBasedWidth <= newWidth && newX + heightBasedWidth <= this.canvas.width) {
        newWidth = heightBasedWidth;
      } else {
        // If neither fits perfectly, use the smaller constraint
        if (widthBasedHeight < heightBasedWidth) {
          newHeight = Math.min(widthBasedHeight, this.canvas.height - newY);
          newWidth = newHeight * this.options.aspectRatio;
        } else {
          newWidth = Math.min(heightBasedWidth, this.canvas.width - newX);
          newHeight = newWidth / this.options.aspectRatio;
        }
      }
    }

    // Apply minimum size constraints
    const minWidth = this.options.aspectRatio === 1 ? 50 : 150;
    const minHeight = this.options.aspectRatio === 1 ? 50 : 50;

    if (newWidth < minWidth || newHeight < minHeight) {
      if (this.options.aspectRatio === 1) {
        const minSize = Math.max(minWidth, minHeight);
        // Check if minimum size fits in remaining canvas space
        if (newX + minSize <= this.canvas.width && newY + minSize <= this.canvas.height) {
          newWidth = minSize;
          newHeight = minSize;
        } else {
          // If minimum size doesn't fit, don't resize
          return;
        }
      } else {
        // Maintain aspect ratio for minimum size
        const minWidthFromAspect = minHeight * this.options.aspectRatio;
        const minHeightFromAspect = minWidth / this.options.aspectRatio;
        
        if (minWidthFromAspect >= minWidth) {
          newWidth = minWidthFromAspect;
          newHeight = minHeight;
        } else {
          newWidth = minWidth;
          newHeight = minHeightFromAspect;
        }
        
        // Check if minimum size fits in canvas
        if (newX + newWidth > this.canvas.width || newY + newHeight > this.canvas.height) {
          return; // Don't resize if it would exceed bounds
        }
      }
    }

    // Final boundary check - ensure the crop area fits completely within canvas
    if (newX + newWidth > this.canvas.width) {
      const excess = (newX + newWidth) - this.canvas.width;
      if (this.resizeHandle.includes('w')) {
        // If resizing from west side, move the crop area
        newX = Math.max(0, newX + excess);
        newWidth = this.canvas.width - newX;
      } else {
        // If resizing from east side, limit the width
        newWidth = this.canvas.width - newX;
      }
      
      // Recalculate height to maintain aspect ratio
      if (this.options.aspectRatio !== 1) {
        newHeight = newWidth / this.options.aspectRatio;
      }
    }
    
    if (newY + newHeight > this.canvas.height) {
      const excess = (newY + newHeight) - this.canvas.height;
      if (this.resizeHandle.includes('n')) {
        // If resizing from north side, move the crop area
        newY = Math.max(0, newY + excess);
        newHeight = this.canvas.height - newY;
      } else {
        // If resizing from south side, limit the height
        newHeight = this.canvas.height - newY;
      }
      
      // Recalculate width to maintain aspect ratio
      if (this.options.aspectRatio !== 1) {
        newWidth = newHeight * this.options.aspectRatio;
      }
    }

    // Update crop area
    this.cropArea.x = newX;
    this.cropArea.y = newY;
    this.cropArea.width = newWidth;
    this.cropArea.height = newHeight;

    // Apply final constraints to ensure everything is within bounds
    this.constrainCropArea();
    this.updateCropAreaDisplay();
  }

  /**
   * Perform the actual crop operation
   */
  performCrop() {
    // Calculate scale factor between display and actual image
    const scaleX = this.image.width / this.canvas.width;
    const scaleY = this.image.height / this.canvas.height;

    // Calculate actual crop coordinates
    const actualCrop = {
      x: this.cropArea.x * scaleX,
      y: this.cropArea.y * scaleY,
      width: this.cropArea.width * scaleX,
      height: this.cropArea.height * scaleY
    };

    // Create output canvas
    const outputCanvas = document.createElement('canvas');
    const outputCtx = outputCanvas.getContext('2d');

    // Set output size based on aspect ratio
    let outputWidth, outputHeight;

    if (this.options.aspectRatio === 1) {
      // Square output
      const outputSize = Math.min(this.options.maxWidth, this.options.maxHeight);
      outputWidth = outputSize;
      outputHeight = outputSize;
    } else {
      // Rectangular output (e.g., 3:1 for banners)
      const maxWidth = this.options.maxWidth;
      const maxHeight = this.options.maxHeight;

      // Calculate output dimensions maintaining aspect ratio
      if (maxWidth / this.options.aspectRatio <= maxHeight) {
        outputWidth = maxWidth;
        outputHeight = maxWidth / this.options.aspectRatio;
      } else {
        outputHeight = maxHeight;
        outputWidth = maxHeight * this.options.aspectRatio;
      }
    }

    outputCanvas.width = outputWidth;
    outputCanvas.height = outputHeight;

    // Draw cropped image
    outputCtx.drawImage(
      this.image,
      actualCrop.x, actualCrop.y, actualCrop.width, actualCrop.height,
      0, 0, outputWidth, outputHeight
    );

    // Convert to blob
    outputCanvas.toBlob((blob) => {
      this.hide();
      this.onCropComplete(blob);
    }, `image/${this.options.outputFormat}`, this.options.quality);
  }
}