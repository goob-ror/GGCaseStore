import { UserApiService } from '../../lib/UserApiService.js';
import { TopNavigationBar, initializeTopNavigationSearch } from '../../components/TopNavigationBar.js';
import { BottomNavigationBar } from '../../components/BottomNavigationBar.js';
import { Footer } from '../../components/Footer.js';
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import '../../styles/components/katalog.css'; 

class KatalogPage {
    constructor() {
        this.UserApiService = new UserApiService();
        this.products = [];
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.isLoading = false;
        this.hasMoreProducts = true;
        this.filters = {
            minPrice: null,
            maxPrice: null,
            minRating: null,
            sortBy: 'newest'
        };
    }

    async render(container) {
        container.innerHTML = this.getHTML();
        this.setUpNavigation();
        this.bindEvents();
        this.setupInfiniteScroll();
        await this.loadProducts();
    }

    setUpNavigation() {
        document.getElementById('top-bar').innerHTML = TopNavigationBar();
        document.getElementById('bottom-bar').innerHTML = BottomNavigationBar();
        document.getElementById('footer').innerHTML = Footer();

        // Initialize product search functionality
        initializeTopNavigationSearch();
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
                            <div class="catalog-filter__group">
                                <label class="catalog-filter__label">Rating & Urutan</label>
                                <select id="rating-filter" class="catalog-filter__select">
                                    <option value="">Semua Rating</option>
                                    <option value="4">4+ Bintang</option>
                                    <option value="3">3+ Bintang</option>
                                    <option value="2">2+ Bintang</option>
                                    <option value="1">1+ Bintang</option>
                                </select>
                                <select id="sort-filter" class="catalog-filter__select">
                                    <option value="newest">Terbaru</option>
                                    <option value="price-low">Harga Terendah</option>
                                    <option value="price-high">Harga Tertinggi</option>
                                    <option value="rating">Rating Tertinggi</option>
                                    <option value="popular">Terpopuler</option>
                                </select>
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
                                <i class="fas fa-spinner fa-spin"></i> Memuat produk...
                            </div>
                        </div>
                    </div>
                </div>
                <div id="footer"></div>
            </div>
            <div id="bottom-bar"></div>
        `;
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
        const ratingSelect = document.getElementById('rating-filter');
        const sortSelect = document.getElementById('sort-filter');

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

        if (ratingSelect) {
            ratingSelect.addEventListener('change', () => {
                this.filters.minRating = ratingSelect.value || null;
                this.resetAndReload();
            });
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.filters.sortBy = sortSelect.value;
                this.resetAndReload();
            });
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

    setupInfiniteScroll() {
        window.addEventListener('scroll', this.debounce(() => {
            if (this.isLoading || !this.hasMoreProducts) return;

            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            // Load more when user is 200px from bottom
            if (scrollTop + windowHeight >= documentHeight - 200) {
                this.loadMoreProducts();
            }
        }, 100));
    }

    async loadProducts() {
        this.currentPage = 1;
        this.products = [];
        this.hasMoreProducts = true;
        const container = document.getElementById('product-grid');
        if (container) {
            container.innerHTML = '';
        }
        await this.loadMoreProducts();
    }

    async loadMoreProducts() {
        if (this.isLoading || !this.hasMoreProducts) return;

        this.isLoading = true;
        this.showLoadingIndicator();

        try {
            let allProducts = [];

            // Determine which API endpoint to use based on filters
            if (this.filters.minPrice && this.filters.maxPrice) {
                // Use price filtering endpoint
                const response = await this.UserApiService.get('/products/price', {
                    min_price: this.filters.minPrice,
                    max_price: this.filters.maxPrice
                });
                allProducts = response.data || [];
            } else if (this.filters.minRating) {
                // Use high rating endpoint for rating filter
                const response = await this.UserApiService.get('/products/high-rating');
                allProducts = (response.data || []).filter(product =>
                    product.avg_rating >= parseFloat(this.filters.minRating)
                );
            } else {
                // Use regular pagination endpoint
                const params = {
                    page: this.currentPage,
                    limit: this.itemsPerPage
                };
                const response = await this.UserApiService.get('/products', params);
                allProducts = response.data || [];

                // For regular pagination, handle it normally
                if (response.pagination) {
                    this.hasMoreProducts = this.currentPage < response.pagination.totalPages;
                } else {
                    this.hasMoreProducts = allProducts.length === this.itemsPerPage;
                }

                // Apply client-side sorting
                allProducts = this.sortProducts(allProducts);
                this.appendProducts(allProducts);
                this.currentPage++;
                return;
            }

            // For filtered results, apply additional client-side filtering and sorting
            allProducts = this.applyClientSideFilters(allProducts);
            allProducts = this.sortProducts(allProducts);

            // Handle pagination for filtered results
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;
            const pageProducts = allProducts.slice(startIndex, endIndex);

            this.hasMoreProducts = endIndex < allProducts.length;
            this.appendProducts(pageProducts);
            this.currentPage++;

        } catch (err) {
            console.error('Error loading products:', err);
            if (this.products.length === 0) {
                const container = document.getElementById('product-grid');
                if (container) {
                    container.innerHTML = `<p>Gagal memuat produk.</p>`;
                }
            }
        } finally {
            this.isLoading = false;
            this.hideLoadingIndicator();
        }
    }

    applyClientSideFilters(products) {
        return products.filter(product => {
            // Rating filter
            if (this.filters.minRating && product.avg_rating < parseFloat(this.filters.minRating)) {
                return false;
            }

            // Price filter (if not already applied by API)
            if (this.filters.minPrice && product.price < parseFloat(this.filters.minPrice)) {
                return false;
            }
            if (this.filters.maxPrice && product.price > parseFloat(this.filters.maxPrice)) {
                return false;
            }

            return true;
        });
    }

    sortProducts(products) {
        const sortedProducts = [...products];

        switch (this.filters.sortBy) {
            case 'price-low':
                return sortedProducts.sort((a, b) => a.price - b.price);
            case 'price-high':
                return sortedProducts.sort((a, b) => b.price - a.price);
            case 'rating':
                return sortedProducts.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
            case 'popular':
                return sortedProducts.sort((a, b) => (b.total_sold || 0) - (a.total_sold || 0));
            case 'newest':
            default:
                return sortedProducts.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
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
            const productElement = document.createElement('div');
            productElement.className = 'catalog-product-card';
            productElement.setAttribute('data-product-id', product.id);
            productElement.addEventListener('click', () => this.navigateToDetail(product.id));
            productElement.innerHTML = `
                <img src="${this.getProductImage(product)}" alt="${product.name}" class="catalog-product-card__image"/>
                <div class="catalog-product-card__content">
                    <h3 class="catalog-product-card__name">${product.name}</h3>
                    <p class="catalog-product-card__price">${this.formatRupiah(product.price)}</p>
                    <div class="catalog-product-card__rating">
                        <span><i class="fas fa-star"></i>${product.avg_rating ? product.avg_rating.toFixed(1) : 'Belum ada rating'}</span>
                        <span>${product.total_sold ?? 0}+ Terjual</span>
                    </div>
                </div>
            `;
            container.appendChild(productElement);
        });

        this.updateProductCount();
    }

    navigateToDetail(productId) {
        // Navigate to detail page using query parameter
        window.location.href = `/detail?id=${productId}`;
    }

    updateProductCount() {
        const countElement = document.getElementById('product-count');
        if (countElement) {
            const count = this.products.length;
            countElement.textContent = `Menampilkan ${count} produk`;
        }
    }

    resetAndReload() {
        this.currentPage = 1;
        this.products = [];
        this.hasMoreProducts = true;
        const container = document.getElementById('product-grid');
        container.innerHTML = '';

        // Update count display
        const countElement = document.getElementById('product-count');
        if (countElement) {
            countElement.textContent = 'Memuat produk...';
        }

        this.loadMoreProducts();
    }

    showLoadingIndicator() {
        const indicator = document.getElementById('loading-indicator');
        if (indicator) {
            indicator.classList.remove('hidden');
        }
    }

    hideLoadingIndicator() {
        const indicator = document.getElementById('loading-indicator');
        if (indicator) {
            indicator.classList.add('hidden');
        }
    }

    formatRupiah(angka) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(angka);
    }

    getProductImage(product) {
        // Return the first image from the photos array, or a placeholder if no images
        if (product.photos && product.photos.length > 0) {
            return product.photos[0].photo_url;
        }
        // Return a placeholder image if no photos available
        return '/public/uploads/products/product_1_1753842813929_6xc3sp2s8un.webp';
    }
}

export default KatalogPage;
