import { UserApiService } from '../../lib/UserApiService.js';
import { TopNavigationBar, initializeTopNavigationSearch } from '../../components/TopNavigationBar.js';
import { BottomNavigationBar } from '../../components/BottomNavigationBar.js';
import { Footer } from '../../components/Footer.js';
import { SearchableDropdown } from '../../components/SearchableDropdown.js';
import { EndlessScroll } from './EndlessScroll.js';
import { ProductFormatter } from './ProductFormatter.js';
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import '../../styles/components/katalog.css';
import '../../styles/components/searchable-dropdown.css';

class KatalogPage {
    constructor() {
        this.UserApiService = new UserApiService();
        this.products = [];
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.filters = {
            minPrice: null,
            maxPrice: null,
            minRating: null,
            categoryId: null,
            brandId: null,
            sortBy: 'newest'
        };
        this.categoryDropdown = null;
        this.brandDropdown = null;
        this.categories = [];
        this.brands = [];
        this.isInitialized = false;

        // Initialize utility classes
        this.productFormatter = new ProductFormatter();
        this.endlessScroll = new EndlessScroll({
            threshold: 200,
            debounceDelay: 150,
            onLoadMore: () => this.loadMoreProducts(),
            loadingIndicatorId: 'loading-indicator'
        });

        // Bind methods to preserve context
        this.loadMoreProducts = this.loadMoreProducts.bind(this);
        this.resetAndReload = this.resetAndReload.bind(this);
    }

    async render(container) {
        try {
            container.innerHTML = this.getHTML();
            this.setUpNavigation();

            // Initialize dropdowns first and wait for completion
            await Promise.all([
                this.initializeCategoryDropdown(),
                this.initializeBrandDropdown()
            ]);

            // Parse URL parameters after dropdowns are ready
            this.parseUrlParameters();

            // Bind events
            this.bindEvents();

            // Initialize endless scroll
            this.endlessScroll.initialize();

            // Mark as initialized
            this.isInitialized = true;

            // Load initial products
            await this.loadInitialProducts();

        } catch (error) {
            console.error('Error rendering katalog page:', error);
            this.showErrorMessage('Gagal memuat halaman katalog');
        }
    }

    setUpNavigation() {
        document.getElementById('top-bar').innerHTML = TopNavigationBar();
        document.getElementById('bottom-bar').innerHTML = BottomNavigationBar();
        if (window.innerWidth > 768) {
            document.getElementById('footer').innerHTML = Footer();
        }

        // Initialize product search functionality
        initializeTopNavigationSearch();
    }

    async initializeCategoryDropdown() {
        try {
            const response = await this.UserApiService.get('/categories');
            this.categories = response.data || [];

            this.categoryDropdown = new SearchableDropdown({
                placeholder: 'Pilih Kategori...',
                searchPlaceholder: 'Cari kategori...',
                noResultsText: 'Kategori tidak ditemukan',
                allowClear: true,
                onSelect: (category) => {
                    this.filters.categoryId = category.id;
                    this.resetAndReload();
                },
                onClear: () => {
                    this.filters.categoryId = null;
                    this.resetAndReload();
                }
            });

            const container = document.getElementById('category-dropdown-container');
            if (container) {
                container.innerHTML = this.categoryDropdown.createHTML('category-filter');
                this.categoryDropdown.initialize('category-filter');
                this.categoryDropdown.setItems(this.categories.map(cat => ({
                    id: cat.id,
                    name: cat.name,
                    value: cat.id
                })));
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    async initializeBrandDropdown() {
        try {
            const response = await this.UserApiService.get('/brands');
            this.brands = response.data || [];

            this.brandDropdown = new SearchableDropdown({
                placeholder: 'Pilih Brand...',
                searchPlaceholder: 'Cari brand...',
                noResultsText: 'Brand tidak ditemukan',
                allowClear: true,
                onSelect: (brand) => {
                    this.filters.brandId = brand.id;
                    this.resetAndReload();
                },
                onClear: () => {
                    this.filters.brandId = null;
                    this.resetAndReload();
                }
            });

            const container = document.getElementById('brand-dropdown-container');
            if (container) {
                container.innerHTML = this.brandDropdown.createHTML('brand-filter');
                this.brandDropdown.initialize('brand-filter');
                this.brandDropdown.setItems(this.brands.map(brand => ({
                    id: brand.id,
                    name: brand.name,
                    value: brand.id
                })));
            }
        } catch (error) {
            console.error('Error loading brands:', error);
        }
    }

    parseUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryId = urlParams.get('category');
        const brandId = urlParams.get('brand');

        if (categoryId) {
            this.filters.categoryId = categoryId;
        }

        if (brandId) {
            this.filters.brandId = brandId;
        }

        // Set dropdown values after a short delay to ensure dropdowns are ready
        setTimeout(() => {
            if (categoryId && this.categoryDropdown) {
                this.categoryDropdown.setValue(categoryId);
            }
            if (brandId && this.brandDropdown) {
                this.brandDropdown.setValue(brandId);
            }
        }, 100);
    }

    resetAndReload() {
        // Don't reset if not initialized yet
        if (!this.isInitialized) {
            return;
        }

        // Reset pagination state
        this.currentPage = 1;
        this.products = [];

        // Reset endless scroll state
        this.endlessScroll.reset();

        // Clear product grid
        const container = document.getElementById('product-grid');
        if (container) {
            container.innerHTML = '';
        }

        // Update count display
        this.updateProductCount('Memuat produk...');

        // Load new products
        this.loadMoreProducts();
    }

    async loadInitialProducts() {
        // Reset state for initial load
        this.currentPage = 1;
        this.products = [];
        this.endlessScroll.reset();

        // Clear container
        const container = document.getElementById('product-grid');
        if (container) {
            container.innerHTML = '';
        }

        // Update count display
        this.updateProductCount('Memuat produk...');

        // Load first batch
        await this.loadMoreProducts();
    }

    async loadMoreProducts() {
        // Prevent multiple simultaneous calls using EndlessScroll's state
        if (this.endlessScroll.getLoadingState() || !this.endlessScroll.getHasMore()) {
            console.log('⏳ Already loading or no more products, skipping...');
            return;
        }

        try {
            // Build API parameters
            const params = this.buildApiParams();

            console.log('🔄 Loading products - Page:', this.currentPage, 'Params:', params);

            // Make API call
            const response = await this.UserApiService.get('/products', params);
            const newProducts = response.data || [];

            console.log('✅ Received products:', newProducts.length);

            // Handle empty results
            if (newProducts.length === 0) {
                this.handleEmptyResults();
                return;
            }

            // Determine if there are more products
            const hasMoreProducts = this.determineHasMore(newProducts, response);

            // Update endless scroll state
            this.endlessScroll.setHasMore(hasMoreProducts);

            // Append new products
            this.appendProducts(newProducts);

            // Increment page for next load
            this.currentPage++;

            console.log('📊 Total products loaded:', this.products.length, 'Has more:', hasMoreProducts);

        } catch (error) {
            console.error('❌ Error loading products:', error);
            this.handleLoadError(error);
        }
    }

    buildApiParams() {
        const params = {
            page: this.currentPage,
            limit: this.itemsPerPage
        };

        // Add filter parameters
        if (this.filters.categoryId) {
            params.category_id = this.filters.categoryId;
        }

        if (this.filters.brandId) {
            params.brand_id = this.filters.brandId;
        }

        if (this.filters.minPrice) {
            params.min_price = this.filters.minPrice;
        }

        if (this.filters.maxPrice) {
            params.max_price = this.filters.maxPrice;
        }

        if (this.filters.minRating) {
            params.min_rating = this.filters.minRating;
        }

        if (this.filters.sortBy) {
            params.sort_by = this.filters.sortBy;
        }

        return params;
    }

    determineHasMore(products, response) {
        // Use pagination info from response if available
        if (response.pagination) {
            return this.currentPage < response.pagination.totalPages;
        }

        // Fallback: assume more products if we got a full page
        return products.length === this.itemsPerPage;
    }

    handleEmptyResults() {
        this.endlessScroll.setHasMore(false);

        if (this.products.length === 0) {
            // No products at all
            const container = document.getElementById('product-grid');
            if (container) {
                container.innerHTML = `
                    <div class="no-products-message">
                        <i class="fas fa-search fa-3x"></i>
                        <h3>Tidak ada produk ditemukan</h3>
                        <p>Coba ubah filter pencarian Anda</p>
                    </div>
                `;
            }
            this.updateProductCount('Tidak ada produk ditemukan');
        } else {
            // End of results
            console.log('📝 Reached end of results');
            this.updateProductCount();
        }
    }

    handleLoadError(error) {
        if (this.products.length === 0) {
            // Show error message if no products loaded yet
            this.showErrorMessage('Gagal memuat produk. Silakan coba lagi.');
        } else {
            // Just log the error if we already have some products
            console.error('Failed to load more products, but keeping existing ones');
        }

        // Don't disable endless scroll completely on error - allow retry
        // The user can try scrolling again later
    }

    showErrorMessage(message) {
        const container = document.getElementById('product-grid');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle fa-3x"></i>
                    <h3>Terjadi Kesalahan</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="retry-button">
                        <i class="fas fa-refresh"></i> Coba Lagi
                    </button>
                </div>
            `;
        }

        const countElement = document.getElementById('product-count');
        if (countElement) {
            countElement.textContent = 'Error memuat produk';
        }
    }

    appendProducts(newProducts) {
        const container = document.getElementById('product-grid');

        if (!container) {
            console.error('Product grid container not found');
            return;
        }

        newProducts.forEach(product => {
            this.products.push(product);
            const productElement = this.productFormatter.createProductCard(
                product,
                (productId) => this.navigateToDetail(productId)
            );
            container.appendChild(productElement);
        });

        this.updateProductCount();
    }

    navigateToDetail(productId) {
        window.location.href = `/detail?id=${productId}`;
    }

    updateProductCount(customText = null) {
        const countElement = document.getElementById('product-count');
        if (countElement) {
            if (customText) {
                countElement.textContent = customText;
            } else {
                const count = this.products.length;
                const hasMore = this.endlessScroll.getHasMore();
                countElement.textContent = `Menampilkan ${count} produk${hasMore ? ' (scroll untuk lebih banyak)' : ''}`;
            }
        }
    }

    getHTML() {
        return `
            <div id="top-bar"></div>
            <div class="catalog-main-layout">
                <div class="catalog-content-wrapper">
                    <div class="catalog-container">
                        <!-- Filter Sidebar -->
                        <div class="catalog-filter">
                            <h3 class="catalog-filter__title">Filter</h3>
                            <div class="catalog-filter__group">
                                <label class="catalog-filter__label">Kategori</label>
                                <div id="category-dropdown-container"></div>
                            </div>
                            <div class="catalog-filter__group">
                                <label class="catalog-filter__label">Brand</label>
                                <div id="brand-dropdown-container"></div>
                            </div>
                            <div class="catalog-filter__group">
                                <label class="catalog-filter__label">Harga</label>
                                <div class="catalog-filter__input-row">
                                    <span class="catalog-filter__input-prefix">Min</span>
                                    <input type="number" class="catalog-filter__input" placeholder="20000" id="min-price-input">
                                </div>
                                <div class="catalog-filter__input-row">
                                    <span class="catalog-filter__input-prefix">Maks</span>
                                    <input type="number" class="catalog-filter__input" placeholder="500000" id="max-price-input">
                                </div>
                            </div>
                        </div>

                        <!-- Main Content -->
                        <div class="catalog-main-content">
                            <div class="catalog-header">
                                <p class="catalog-header__count" id="product-count">Memuat produk...</p>
                            </div>

                            <div class="catalog-product-grid" id="product-grid">
                                <!-- Products will be loaded here -->
                            </div>
                            <div class="catalog-loading hidden" id="loading-indicator">
                                <i class="fas fa-spinner fa-spin"></i> Memuat produk lainnya...
                            </div>
                        </div>
                    </div>
                </div>
                <div id="footer"></div>
            </div>
            <div id="bottom-bar"></div>
        `;
        // <div class="catalog-filter__group">
        //     <label class="catalog-filter__label">Rating & Urutan</label>
        //     <select id="rating-filter" class="catalog-filter__select">
        //         <option value="">Semua Rating</option>
        //         <option value="4">4+ Bintang</option>
        //         <option value="3">3+ Bintang</option>
        //         <option value="2">2+ Bintang</option>
        //         <option value="1">1+ Bintang</option>
        //     </select>
        //     <select id="sort-filter" class="catalog-filter__select">
        //         <option value="newest">Terbaru</option>
        //         <option value="price-low">Harga Terendah</option>
        //         <option value="price-high">Harga Tertinggi</option>
        //         <option value="rating">Rating Tertinggi</option>
        //         <option value="popular">Terpopuler</option>
        //         <option value="best">Terbaik</option>
        //     </select>
        // </div>
    }

    bindEvents() {
        const navLinks = document.querySelectorAll('.nav-links a');
        const currentPath = window.location.pathname;

        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });

        const links = document.querySelectorAll(".bottom-nav a");
        links.forEach(link => {
            if (link.getAttribute("data-path").toLowerCase() === currentPath) {
                link.classList.add("active");
            }
        });

        // Bind filter events
        this.bindFilterEvents();
    }

    bindFilterEvents() {
        const minPriceInput = document.getElementById('min-price-input');
        const maxPriceInput = document.getElementById('max-price-input');

        if (minPriceInput) {
            minPriceInput.addEventListener('input', this.debounce(() => {
                this.filters.minPrice = minPriceInput.value || null;
                this.resetAndReload();
            }, 500));
        }

        if (maxPriceInput) {
            maxPriceInput.addEventListener('input', this.debounce(() => {
                this.filters.maxPrice = maxPriceInput.value || null;
                this.resetAndReload();
            }, 500));
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Cleanup method to destroy endless scroll when page is destroyed
     */
    destroy() {
        if (this.endlessScroll) {
            this.endlessScroll.destroy();
        }

        // Clean up any remaining timeouts or intervals
        this.isInitialized = false;
    }
}

export default KatalogPage;