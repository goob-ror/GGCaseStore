/**
 * ProductFormatter utility class for handling product display formatting
 */
export class ProductFormatter {
    constructor() {
        // Default placeholder image
        this.defaultImage = '/public/uploads/products/product_1_1753842813929_6xc3sp2s8un.webp';
    }

    /**
     * Format currency to Indonesian Rupiah
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency string
     */
    formatRupiah(amount) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    }

    /**
     * Get product image URL with fallback
     * @param {Object} product - Product object
     * @returns {string} Image URL
     */
    getProductImage(product) {
        // Return the first image from the photos array, or a placeholder if no images
        if (product.photos && product.photos.length > 0) {
            return product.photos[0].photo_url;
        }
        return this.defaultImage;
    }

    /**
     * Check if promo is currently active for a product
     * @param {Object} product - Product object
     * @returns {boolean} Whether promo is active
     */
    isPromoActive(product) {
        // First check if the backend has already calculated this for us
        if (product.is_promo_active !== undefined) {
            return Boolean(product.is_promo_active);
        }

        // Fallback to manual calculation if is_promo_active is not provided
        if (!product.is_promo && !product.isPromo) {
            return false;
        }

        const now = new Date();

        // Check if promo has valid pricing
        const hasValidPromoPrice = (product.current_price || product.promo_price) &&
                                   (product.current_price || product.promo_price) < (product.base_price || product.price);

        if (!hasValidPromoPrice) {
            return false;
        }

        // Check start date
        if (product.promo_price_start_date) {
            const startDate = new Date(product.promo_price_start_date);
            if (startDate > now) {
                return false;
            }
        }

        // Check end date
        if (product.promo_price_end_date) {
            const endDate = new Date(product.promo_price_end_date);
            if (endDate < now) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get the current effective price for a product
     * @param {Object} product - Product object
     * @returns {number} Current price
     */
    getCurrentPrice(product) {
        // If the backend provides current_price, use it (it already factors in promo status)
        if (product.current_price !== undefined) {
            return Number(product.current_price);
        }

        // Fallback to manual calculation
        if (this.isPromoActive(product)) {
            return Number(product.promo_price || product.price || 0);
        }
        return Number(product.base_price || product.price || 0);
    }

    /**
     * Format product price with promo display
     * @param {Object} product - Product object
     * @param {boolean} isPromoActive - Whether promo is active
     * @returns {string} HTML string for price display
     */
    formatProductPrice(product, isPromoActive) {
        const basePrice = Number(product.base_price || product.price || 0);
        const promoPrice = Number(product.current_price || product.promo_price || 0);

        if (isPromoActive && promoPrice < basePrice) {
            const discountPercentage = Math.round(((basePrice - promoPrice) / basePrice) * 100);

            return `
                <div class="catalog-product-card__price-container">
                    <p class="catalog-product-card__price-original">${this.formatRupiah(basePrice)}</p>
                    <p class="catalog-product-card__price-promo">${this.formatRupiah(promoPrice)}</p>
                    <span class="catalog-product-card__discount">${discountPercentage}% OFF</span>
                </div>
            `;
        } else {
            return `<p class="catalog-product-card__price">${this.formatRupiah(basePrice)}</p>`;
        }
    }

    /**
     * Create HTML for a single product card
     * @param {Object} product - Product object
     * @param {Function} onProductClick - Click handler for product
     * @returns {HTMLElement} Product card element
     */
    createProductCard(product, onProductClick) {
        const productElement = document.createElement('div');
        productElement.className = 'catalog-product-card';
        productElement.setAttribute('data-product-id', product.id);
        
        if (onProductClick) {
            productElement.addEventListener('click', () => onProductClick(product.id));
        }

        // Check if promo is active
        const isPromoActive = this.isPromoActive(product);
        const priceHTML = this.formatProductPrice(product, isPromoActive);

        productElement.innerHTML = `
            <img src="${this.getProductImage(product)}" alt="${product.name}" class="catalog-product-card__image"/>
            ${isPromoActive ? '<span class="promo-badge" style="position: absolute; top: 10px;">PROMO</span>' : ''}

            <div class="catalog-product-card__content">
                <h3 class="catalog-product-card__name ellipsis-3">
                    ${product.name}
                </h3>
                ${priceHTML}
            </div>
        `;

        return productElement;
    }

    /**
     * Create HTML for product rating display (commented out in original)
     * @param {Object} product - Product object
     * @returns {string} HTML string for rating display
     */
    formatProductRating(product) {
        return `
            <div class="catalog-product-card__rating">
                <span><i class="fas fa-star"></i>${product.avg_rating ? product.avg_rating.toFixed(1) : 'Belum ada rating'}</span>
                <span>${product.total_sold ?? 0}+ Terjual</span>
            </div>
        `;
    }

    /**
     * Set default placeholder image
     * @param {string} imagePath - Path to default image
     */
    setDefaultImage(imagePath) {
        this.defaultImage = imagePath;
    }
}
