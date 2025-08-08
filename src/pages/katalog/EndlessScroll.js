/**
 * EndlessScroll utility class for handling infinite scroll functionality
 * Improved version with better error handling and cleanup
 */
export class EndlessScroll {
    constructor(options = {}) {
        this.isLoading = false;
        this.hasMoreItems = true;
        this.threshold = options.threshold || 200; // Distance from bottom to trigger load
        this.debounceDelay = options.debounceDelay || 100;
        this.onLoadMore = options.onLoadMore || (() => {});
        this.loadingIndicatorId = options.loadingIndicatorId || 'loading-indicator';
        this.scrollContainer = options.scrollContainer || window; // Allow custom scroll container
        this.useIntersectionObserver = options.useIntersectionObserver || false;

        // Track if we're initialized to prevent duplicate listeners
        this.isInitialized = false;

        // Bind methods to preserve context
        this.handleScroll = this.handleScroll.bind(this);
        this.debouncedScrollHandler = this.debounce(this.handleScroll, this.debounceDelay);
    }

    /**
     * Initialize the endless scroll functionality
     */
    initialize() {
        if (this.isInitialized) {
            return;
        }

        if (this.useIntersectionObserver) {
            this.setupIntersectionObserver();
        } else {
            this.attachScrollListener();
        }

        this.isInitialized = true;
    }

    /**
     * Destroy the endless scroll functionality
     */
    destroy() {
        this.detachScrollListener();

        // Clean up intersection observer
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

        // Remove sentinel element
        if (this.sentinel && this.sentinel.parentElement) {
            this.sentinel.parentElement.removeChild(this.sentinel);
            this.sentinel = null;
        }

        // Cancel any pending debounced calls
        if (this.debouncedScrollHandler && this.debouncedScrollHandler.cancel) {
            this.debouncedScrollHandler.cancel();
        }

        this.isInitialized = false;
    }

    /**
     * Setup Intersection Observer for better scroll detection
     */
    setupIntersectionObserver() {
        // Create a sentinel element at the bottom of the content
        this.sentinel = document.createElement('div');
        this.sentinel.id = 'endless-scroll-sentinel';
        this.sentinel.style.cssText = 'height: 1px; width: 100%; position: absolute; bottom: 200px;';

        // Find the product grid container and add sentinel
        setTimeout(() => {
            const productGrid = document.getElementById('product-grid');
            if (productGrid && productGrid.parentElement) {
                productGrid.parentElement.style.position = 'relative';
                productGrid.parentElement.appendChild(this.sentinel);

                // Create intersection observer
                this.observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && !this.isLoading && this.hasMoreItems) {
                            this.loadMore();
                        }
                    });
                }, {
                    rootMargin: `${this.threshold}px`
                });

                this.observer.observe(this.sentinel);
            } else {
                // Fallback to scroll listener if product grid not found
                this.attachScrollListener();
            }
        }, 500);
    }

    /**
     * Attach scroll event listener (fallback method)
     */
    attachScrollListener() {
        window.addEventListener('scroll', this.debouncedScrollHandler, { passive: true });
    }

    /**
     * Detach scroll event listener
     */
    detachScrollListener() {
        window.removeEventListener('scroll', this.debouncedScrollHandler);
    }

    /**
     * Handle scroll events
     */
    handleScroll() {
        if (this.isLoading || !this.hasMoreItems) {
            return;
        }

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // Check if user has scrolled near the bottom
        if (scrollTop + windowHeight >= documentHeight - this.threshold) {
            this.loadMore();
        }
    }

    /**
     * Trigger loading more items
     */
    async loadMore() {
        if (this.isLoading || !this.hasMoreItems) {
            return;
        }

        try {
            // Let the callback handle its own loading state management
            await this.onLoadMore();
        } catch (error) {
            console.error('Error loading more items:', error);
            // Don't disable endless scroll on error - allow retry
        }
    }

    /**
     * Set loading state
     * @param {boolean} loading - Whether currently loading
     */
    setLoading(loading) {
        this.isLoading = loading;
        
        const indicator = document.getElementById(this.loadingIndicatorId);
        if (indicator) {
            if (loading) {
                indicator.classList.remove('hidden');
                indicator.style.display = 'block';
            } else {
                indicator.classList.add('hidden');
                indicator.style.display = 'none';
            }
        }
    }

    /**
     * Set whether there are more items to load
     * @param {boolean} hasMore - Whether there are more items
     */
    setHasMore(hasMore) {
        this.hasMoreItems = hasMore;
        
        // Hide loading indicator if no more items
        if (!hasMore) {
            this.setLoading(false);
        }
    }

    /**
     * Reset the endless scroll state
     */
    reset() {
        this.isLoading = false;
        this.hasMoreItems = true;
        this.setLoading(false);
    }

    /**
     * Improved debounce utility function with cancellation support
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function with cancel method
     */
    debounce(func, wait) {
        let timeout;
        
        const debounced = function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                timeout = null;
                func.apply(this, args);
            };
            
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(later, wait);
        };
        
        // Add cancel method for cleanup
        debounced.cancel = () => {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
        };
        
        return debounced;
    }

    /**
     * Get current loading state
     * @returns {boolean} Current loading state
     */
    getLoadingState() {
        return this.isLoading;
    }

    /**
     * Get whether there are more items
     * @returns {boolean} Whether there are more items
     */
    getHasMore() {
        return this.hasMoreItems;
    }

    /**
     * Manually trigger a load (useful for retry scenarios)
     */
    triggerLoad() {
        if (!this.isLoading && this.hasMoreItems) {
            this.loadMore();
        }
    }

    /**
     * Update the threshold dynamically
     * @param {number} newThreshold - New threshold value
     */
    setThreshold(newThreshold) {
        this.threshold = newThreshold;
    }

    /**
     * Get current scroll position information (useful for debugging)
     * @returns {Object} Scroll position information
     */
    getScrollInfo() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const distanceFromBottom = documentHeight - (scrollTop + windowHeight);
        
        return {
            scrollTop,
            windowHeight,
            documentHeight,
            distanceFromBottom,
            shouldTrigger: distanceFromBottom <= this.threshold,
            isLoading: this.isLoading,
            hasMoreItems: this.hasMoreItems
        };
    }
}