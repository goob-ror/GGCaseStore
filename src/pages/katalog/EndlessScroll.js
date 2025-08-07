/**
 * EndlessScroll utility class for handling infinite scroll functionality
 */
export class EndlessScroll {
    constructor(options = {}) {
        this.isLoading = false;
        this.hasMoreItems = true;
        this.threshold = options.threshold || 200; // Distance from bottom to trigger load
        this.debounceDelay = options.debounceDelay || 100;
        this.onLoadMore = options.onLoadMore || (() => {});
        this.loadingIndicatorId = options.loadingIndicatorId || 'loading-indicator';
        
        // Bind methods to preserve context
        this.handleScroll = this.handleScroll.bind(this);
        this.debouncedScrollHandler = this.debounce(this.handleScroll, this.debounceDelay);
    }

    /**
     * Initialize the endless scroll functionality
     */
    initialize() {
        this.attachScrollListener();
    }

    /**
     * Destroy the endless scroll functionality
     */
    destroy() {
        this.detachScrollListener();
    }

    /**
     * Attach scroll event listener
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

        this.setLoading(true);
        
        try {
            await this.onLoadMore();
        } catch (error) {
            console.error('Error loading more items:', error);
        } finally {
            this.setLoading(false);
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
            } else {
                indicator.classList.add('hidden');
            }
        }
    }

    /**
     * Set whether there are more items to load
     * @param {boolean} hasMore - Whether there are more items
     */
    setHasMore(hasMore) {
        this.hasMoreItems = hasMore;
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
     * Debounce utility function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
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
}
