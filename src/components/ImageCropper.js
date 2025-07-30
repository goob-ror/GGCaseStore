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
   * Start dragging crop area
   */
  startDrag(e) {
    this.isDragging = true;
    this.dragStart = {
      x: e.clientX - this.cropArea.x,
      y: e.clientY - this.cropArea.y
    };
    e.preventDefault();
  }

  /**
   * Drag crop area
   */
  drag(e) {
    if (this.isDragging) {
      const newX = e.clientX - this.dragStart.x;
      const newY = e.clientY - this.dragStart.y;

      // Constrain to canvas bounds
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
    this.dragStart = {
      x: e.clientX,
      y: e.clientY,
      cropX: this.cropArea.x,
      cropY: this.cropArea.y,
      cropWidth: this.cropArea.width,
      cropHeight: this.cropArea.height
    };
    e.preventDefault();
    e.stopPropagation();
  }

  /**
   * Resize crop area
   */
  resize(e) {
    if (!this.isResizing || !this.resizeHandle) return;

    const deltaX = e.clientX - this.dragStart.x;
    const deltaY = e.clientY - this.dragStart.y;

    let newX = this.dragStart.cropX;
    let newY = this.dragStart.cropY;
    let newWidth = this.dragStart.cropWidth;
    let newHeight = this.dragStart.cropHeight;

    // Calculate new dimensions based on handle
    switch (this.resizeHandle) {
      case 'crop-handle-nw':
        newX = this.dragStart.cropX + deltaX;
        newY = this.dragStart.cropY + deltaY;
        newWidth = this.dragStart.cropWidth - deltaX;
        newHeight = this.dragStart.cropHeight - deltaY;
        break;
      case 'crop-handle-ne':
        newY = this.dragStart.cropY + deltaY;
        newWidth = this.dragStart.cropWidth + deltaX;
        newHeight = this.dragStart.cropHeight - deltaY;
        break;
      case 'crop-handle-sw':
        newX = this.dragStart.cropX + deltaX;
        newWidth = this.dragStart.cropWidth - deltaX;
        newHeight = this.dragStart.cropHeight + deltaY;
        break;
      case 'crop-handle-se':
        newWidth = this.dragStart.cropWidth + deltaX;
        newHeight = this.dragStart.cropHeight + deltaY;
        break;
    }

    // Maintain aspect ratio
    if (this.options.aspectRatio === 1) {
      // Square aspect ratio (1:1)
      const size = Math.min(newWidth, newHeight);
      newWidth = size;
      newHeight = size;
    } else {
      // Rectangular aspect ratio (e.g., 3:1)
      // Determine which dimension to use as the base
      const widthBasedHeight = newWidth / this.options.aspectRatio;
      const heightBasedWidth = newHeight * this.options.aspectRatio;

      // Use the smaller result to ensure it fits
      if (widthBasedHeight <= newHeight) {
        newHeight = widthBasedHeight;
      } else {
        newWidth = heightBasedWidth;
      }
    }

    // Ensure minimum size
    const minWidth = this.options.aspectRatio === 1 ? 50 : 150; // Larger minimum for banners
    const minHeight = this.options.aspectRatio === 1 ? 50 : 50;

    if (newWidth < minWidth || newHeight < minHeight) {
      if (this.options.aspectRatio === 1) {
        newWidth = minWidth;
        newHeight = minHeight;
      } else {
        // Maintain aspect ratio for minimum size
        if (minWidth / this.options.aspectRatio >= minHeight) {
          newWidth = minWidth;
          newHeight = minWidth / this.options.aspectRatio;
        } else {
          newHeight = minHeight;
          newWidth = minHeight * this.options.aspectRatio;
        }
      }
    }

    // Constrain to canvas bounds
    newX = Math.max(0, Math.min(newX, this.canvas.width - newWidth));
    newY = Math.max(0, Math.min(newY, this.canvas.height - newHeight));

    // Update crop area
    this.cropArea.x = newX;
    this.cropArea.y = newY;
    this.cropArea.width = newWidth;
    this.cropArea.height = newHeight;

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
