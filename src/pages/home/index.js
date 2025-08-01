import { UserApiService } from '../../lib/UserApiService.js';
import { TopNavigationBar, initializeTopNavigationSearch } from '../../components/TopNavigationBar.js';
import { BottomNavigationBar } from '../../components/BottomNavigationBar.js';
import { Footer } from '../../components/Footer.js';
import Swiper from 'swiper';
import { Navigation, Pagination, Grid } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/grid';
import '../../styles/components/home.css';

class HomePage {
    constructor() {
        this.UserApiService = new UserApiService();
        this.currentBreakpoint = null;
        this.resizeTimeout = null;
    }

    async render(container) {
        container.innerHTML = this.getHTML();
        this.setUpNavigation();
        this.bindEvents();
        this.setupResponsiveHandler();
        await this.loadBanner();
        await this.loadCategories();
        await this.loadResponsiveProducts();
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
        <div class="page-container">
            <div id="top-bar"></div>
            <div class="home-main-layout">
                <!-- Banner Section -->
                <div class="home-banner-container swiper" id="banner">
                    <div class="swiper-wrapper"></div>
                    <div class="swiper-pagination home-swiper-pagination"></div>
                    <div class="swiper-button-prev home-swiper-prev"></div>
                    <div class="swiper-button-next home-swiper-next"></div>
                </div>

                <!-- Categories Section -->
                <div class="home-section-wrapper">
                    <h2 class="home-section-title">Kategori</h2>
                    <div class="home-categories-container">
                        <div class="home-categories-swiper swiper">
                            <div class="swiper-wrapper kategori"></div>
                            <div class="swiper-pagination home-categories-pagination"></div>
                        </div>
                    </div>
                </div>

                <!-- Best Products Section -->
                <div class="home-section-wrapper">
                    <div class="home-section-header">
                        <h2 class="home-section-title">Produk Terbaik</h2>
                        <div class="home-view-all">
                            <span class="home-view-all-text">Lihat Semua</span>
                            <span class="home-view-all-arrow">&rsaquo;</span>
                        </div>
                    </div>
                    <div class="home-products-grid produk-terbaik"></div>
                </div>

                <!-- Highest Rated Products Section -->
                <div class="home-section-wrapper">
                    <div class="home-section-header">
                        <h2 class="home-section-title">Produk dengan Rating Tertinggi</h2>
                        <div class="home-view-all">
                            <span class="home-view-all-text">Lihat Semua</span>
                            <span class="home-view-all-arrow">&rsaquo;</span>
                        </div>
                    </div>
                    <div class="home-products-grid produk-rating"></div>
                </div>

                <!-- Best Selling Products Section -->
                <div class="home-section-wrapper">
                    <div class="home-section-header">
                        <h2 class="home-section-title">Produk Terlaris</h2>
                        <div class="home-view-all">
                            <span class="home-view-all-text">lihat semua</span>
                            <span class="home-view-all-arrow">&rsaquo;</span>
                        </div>
                    </div>
                    <div class="home-products-grid produk-terlaris"></div>
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
    }

    // Setup responsive handler for window resize
    setupResponsiveHandler() {
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                const newBreakpoint = this.getCurrentBreakpoint();
                if (newBreakpoint !== this.currentBreakpoint) {
                    this.currentBreakpoint = newBreakpoint;
                    this.updateGridClasses();
                    this.updateProductDisplays();
                }
            }, 250);
        });
    }

    // Update product displays with new limits (without re-fetching)
    updateProductDisplays() {
        const config = this.getResponsiveConfig();

        // Update high rating products
        if (this.highRatingProducts) {
            this.renderProductSection('.produk-rating', this.highRatingProducts, config.displayLimit);
        }

        // Update best selling products
        if (this.bestSellingProducts) {
            this.renderProductSection('.produk-terlaris', this.bestSellingProducts, config.displayLimit);
        }

        // Update best products
        if (this.bestProducts) {
            this.renderProductSection('.produk-terbaik', this.bestProducts, config.displayLimit);
        }
    }

    // Helper method to render product section with given limit
    renderProductSection(containerSelector, allProducts, displayLimit) {
        const container = document.querySelector(containerSelector);
        if (!container || !allProducts) return;

        const displayProducts = allProducts.slice(0, displayLimit);
        
        container.innerHTML = displayProducts.map(product => `
            <div class="home-product-card loading-fade-in" data-product-id="${product.id}">
                <div class="home-product-img-wrapper">
                    <img src="${this.getProductImage(product)}" alt="${product.name}" class="home-product-img" />
                </div>
                <div class="home-product-content">
                    <h3 class="home-product-name">${product.name}</h3>
                    <p class="home-product-price">${this.formatRupiah(product.price)}</p>
                    <div class="home-product-rating">
                        <span class="home-rating-stars"><i class="fas fa-star"></i> ${product.avg_rating ? product.avg_rating.toFixed(1) : 'N/A'}</span>
                        <span class="home-rating-divider">|</span>
                        <span class="home-sales-count">${product.total_sold ?? 0}+ Terjual</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Re-bind click events
        this.bindProductCardEvents(container);
    }

    // Get current breakpoint based on window width
    getCurrentBreakpoint() {
        const width = window.innerWidth;
        if (width < 640) return 'mobile';
        if (width < 768) return 'tablet-sm';
        if (width < 1024) return 'tablet';
        if (width < 1280) return 'desktop';
        return 'desktop-lg';
    }

    // Get responsive configuration based on breakpoint
    getResponsiveConfig() {
        const breakpoint = this.getCurrentBreakpoint();
        
        const configs = {
            'mobile': {
                columns: 2,
                rows: 2,
                displayLimit: 6,
                gridClass: 'home-products-grid-mobile'
            },
            'tablet-sm': {
                columns: 3,
                rows: 2,
                displayLimit: 8,
                gridClass: 'home-products-grid-tablet-sm'
            },
            'tablet': {
                columns: 3,
                rows: 2,
                displayLimit: 8,
                gridClass: 'home-products-grid-tablet'
            },
            'desktop': {
                columns: 3,
                rows: 2,
                displayLimit: 9,
                gridClass: 'home-products-grid-desktop'
            },
            'desktop-lg': {
                columns: 5,
                rows: 2,
                displayLimit: 10,
                gridClass: 'home-products-grid-desktop-lg'
            }
        };

        return configs[breakpoint] || configs['desktop'];
    }

    // Update grid CSS classes based on current breakpoint
    updateGridClasses() {
        const config = this.getResponsiveConfig();
        const productGrids = document.querySelectorAll('.home-products-grid');
        
        productGrids.forEach(grid => {
            // Remove all existing grid classes
            grid.classList.remove(
                'home-products-grid-mobile',
                'home-products-grid-tablet-sm', 
                'home-products-grid-tablet',
                'home-products-grid-desktop',
                'home-products-grid-desktop-lg'
            );
            
            // Add current breakpoint class
            grid.classList.add(config.gridClass);
            
            // Set CSS custom properties for dynamic grid
            grid.style.setProperty('--grid-columns', config.columns);
            grid.style.setProperty('--grid-rows', config.rows);
        });
    }

    // Load all product sections with responsive limits
    async loadResponsiveProducts() {
        this.currentBreakpoint = this.getCurrentBreakpoint();
        this.updateGridClasses();
        
        // Fetch all products once, then filter by display limits
        await Promise.all([
            this.loadHighRatingProducts(),
            this.loadBestSellingProducts(), 
            this.loadBestProducts()
        ]);
    }

    async loadBanner() {
        this.showBannerSkeleton();
        try {
            const response = await this.UserApiService.get('/banners/active');
            this.banners = response.data || [];
            this.renderBanner();
        } catch (error) {
            console.error('Error loading banner:', error);
        }
    }

    showBannerSkeleton() {
        const container = document.querySelector('#banner .swiper-wrapper');
        if (container) {
            container.innerHTML = `
                <div class="swiper-slide">
                    <div class="home-banner-skeleton">
                        <div class="home-skeleton-img"></div>
                    </div>
                </div>
            `;
        }
    }

    renderBanner() {
        const container = document.querySelector('#banner .swiper-wrapper');
        if (container) {
            container.innerHTML = this.banners.map(banner => `
                <div class="swiper-slide">
                    <div class="home-banner-item">
                        <img src="${banner.banner_image_url}" alt="${banner.title}" class="home-banner-img" />
                    </div>
                </div>
            `).join('');
        }

        Swiper.use([Navigation, Pagination]);
        new Swiper('.swiper', {
            loop: true,
            pagination: {
                el: '.swiper-pagination',
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            spaceBetween: 28
        });
    }

    async loadCategories() {
        const container = document.querySelector(".kategori");
        container.innerHTML = '<p class="home-loading-text">Loading categories...</p>';

        try {
            const response = await this.UserApiService.get('/categories');
            const categories = response.data;

            if (categories && categories.length > 0) {
                container.innerHTML = categories.map(cat => `
                    <div class="swiper-slide">
                        <div class="home-category-card" data-category-id="${cat.id}" data-category-name="${cat.name}">
                            <div class="home-category-img-wrapper">
                                <img src="${cat.category_photo}" alt="${cat.name}" class="home-category-img" />
                            </div>
                            <p class="home-category-name">${cat.name}</p>
                        </div>
                    </div>
                `).join('');

                // Store categories count for pagination calculation
                this.categoriesCount = categories.length;

                // Add click event listeners to category cards
                this.bindCategoryCardEvents();

                // Initialize categories swiper after content is loaded
                setTimeout(() => {
                    this.initializeCategoriesSwiper();
                }, 50);
            } else {
                container.innerHTML = '<p class="home-no-data">No categories available.</p>';
            }
        } catch (err) {
            console.error("Failed to load categories:", err);
            container.innerHTML = '<p class="home-error-text">Failed to load categories.</p>';
        }
    }

    initializeCategoriesSwiper() {
        // Initialize categories swiper with 6 columns and 2 rows (12 items per page)
        Swiper.use([Pagination, Grid]);

        // Destroy existing swiper instance if it exists
        const existingSwiper = document.querySelector('.home-categories-swiper')?.swiper;
        if (existingSwiper) {
            existingSwiper.destroy(true, true);
        }

        this.categoriesSwiper = new Swiper('.home-categories-swiper', {
            slidesPerView: 6,
            grid: {
                rows: 2,
                fill: 'row'
            },
            spaceBetween: 16,
            allowTouchMove: true,
            resistanceRatio: 0.85,
            longSwipesRatio: 0.25,
            threshold: 10,
            pagination: {
                el: '.home-categories-pagination',
                clickable: true,
                dynamicBullets: false,
                renderBullet: function (index, className) {
                    return '<span class="' + className + '" data-index="' + index + '"></span>';
                },
            },
            on: {
                init: function() {
                    // Update pagination after initialization
                    this.pagination.update();
                },
                slideChange: function() {
                    // Prevent reset when at boundaries
                    if (this.isBeginning && this.previousIndex > this.activeIndex) {
                        // User tried to swipe left at the beginning, stay at first slide
                        this.slideTo(0, 300);
                    }
                    if (this.isEnd && this.previousIndex < this.activeIndex) {
                        // User tried to swipe right at the end, stay at last slide
                        this.slideTo(this.slides.length - 1, 300);
                    }
                },
                touchStart: function() {
                    // Store initial position to prevent unwanted resets
                    this.initialSlide = this.activeIndex;
                },
                touchEnd: function() {
                    // Ensure we don't go beyond boundaries
                    if (this.activeIndex < 0) {
                        this.slideTo(0, 300);
                    }
                }
            },
            breakpoints: {
                320: {
                    slidesPerView: 3,
                    grid: {
                        rows: 2,
                        fill: 'row'
                    },
                    spaceBetween: 12,
                },
                400: {
                    slidesPerView: 4,
                    grid: {
                        rows: 2,
                        fill: 'row'
                    },
                    spaceBetween: 12,
                },
                640: {
                    slidesPerView: 4,
                    grid: {
                        rows: 2,
                        fill: 'row'
                    },
                    spaceBetween: 14,
                },
                768: {
                    slidesPerView: 5,
                    grid: {
                        rows: 2,
                        fill: 'row'
                    },
                    spaceBetween: 16,
                },
                1024: {
                    slidesPerView: 6,
                    grid: {
                        rows: 2,
                        fill: 'row'
                    },
                    spaceBetween: 16,
                }
            }
        });

        // Force pagination update after a short delay to ensure proper rendering
        setTimeout(() => {
            if (this.categoriesSwiper && this.categoriesSwiper.pagination) {
                this.categoriesSwiper.pagination.update();
                this.categoriesSwiper.update();
            }
        }, 100);
    }

    async loadHighRatingProducts() {
        const container = document.querySelector(".produk-rating");
        
        container.innerHTML = '<p class="home-loading-text loading-fade-in">Loading high rating products...</p>';

        try {
            // Always fetch a reasonable amount of products (e.g., 12-16)
            const response = await this.UserApiService.get('/products/high-rating', {
                sort: 'rating',
                order: 'desc',
                limit: 16
            });
            const allProducts = response.data || [];

            // Store all products for potential resize handling
            this.highRatingProducts = allProducts;

            // Get current display limit and slice array
            const config = this.getResponsiveConfig();
            const displayProducts = allProducts.slice(0, config.displayLimit);

            if (displayProducts.length > 0) {
                container.innerHTML = displayProducts.map(product => `
                    <div class="home-product-card loading-fade-in" data-product-id="${product.id}">
                        <div class="home-product-img-wrapper">
                            <img src="${this.getProductImage(product)}" alt="${product.name}" class="home-product-img" />
                        </div>
                        <div class="home-product-content">
                            <h3 class="home-product-name">${product.name}</h3>
                            <p class="home-product-price">${this.formatRupiah(product.price)}</p>
                            <div class="home-product-rating">
                                <span class="home-rating-stars"><i class="fas fa-star"></i> ${product.avg_rating ? product.avg_rating.toFixed(1) : 'N/A'}</span>
                                <span class="home-rating-divider">|</span>
                                <span class="home-sales-count">${product.total_sold ?? 0}+ Terjual</span>
                            </div>
                        </div>
                    </div>
                `).join('');

                // Add click event listeners after rendering
                this.bindProductCardEvents(container);
            } else {
                container.innerHTML = '<p class="home-no-data">No high rating products available.</p>';
            }
        } catch (err) {
            console.error("Failed to load high rating products:", err);
            container.innerHTML = '<p class="home-error-text">Failed to load high rating products.</p>';
        }
    }

    async loadBestSellingProducts() {
        const container = document.querySelector(".produk-terlaris");
        
        container.innerHTML = '<p class="home-loading-text loading-fade-in">Loading best selling products...</p>';

        try {
            // Always fetch a reasonable amount of products (e.g., 12-16)
            const response = await this.UserApiService.get('/products/high-sales', {
                sort: 'total_sold',
                order: 'desc',
                limit: 16
            });
            const allProducts = response.data || [];

            // Store all products for potential resize handling
            this.bestSellingProducts = allProducts;

            // Get current display limit and slice array
            const config = this.getResponsiveConfig();
            const displayProducts = allProducts.slice(0, config.displayLimit);

            if (displayProducts.length > 0) {
                container.innerHTML = displayProducts.map(product => `
                    <div class="home-product-card loading-fade-in" data-product-id="${product.id}">
                        <div class="home-product-img-wrapper">
                            <img src="${this.getProductImage(product)}" alt="${product.name}" class="home-product-img" />
                        </div>
                        <div class="home-product-content">
                            <h3 class="home-product-name">${product.name}</h3>
                            <p class="home-product-price">${this.formatRupiah(product.price)}</p>
                            <div class="home-product-rating">
                                <span class="home-rating-stars"><i class="fas fa-star"></i> ${product.avg_rating ? product.avg_rating.toFixed(1) : 'N/A'}</span>
                                <span class="home-rating-divider">|</span>
                                <span class="home-sales-count">${product.total_sold ?? 0}+ Terjual</span>
                            </div>
                        </div>
                    </div>
                `).join('');

                // Add click event listeners after rendering
                this.bindProductCardEvents(container);
            } else {
                container.innerHTML = '<p class="home-no-data">No best selling products available.</p>';
            }
        } catch (err) {
            console.error("Failed to load best selling products:", err);
            container.innerHTML = '<p class="home-error-text">Failed to load best selling products.</p>';
        }
    }

    async loadBestProducts() {
        const container = document.querySelector(".produk-terbaik");
        
        container.innerHTML = '<p class="home-loading-text loading-fade-in">Loading best products...</p>';

        try {
            // Always fetch a reasonable amount of products (e.g., 12-16)
            const response = await this.UserApiService.get('/products/best', {
                sort: 'best',
                order: 'desc',
                limit: 16
            });
            const allProducts = response.data || [];

            // Store all products for potential resize handling
            this.bestProducts = allProducts;

            // Get current display limit and slice array
            const config = this.getResponsiveConfig();
            const displayProducts = allProducts.slice(0, config.displayLimit);

            if (displayProducts.length > 0) {
                container.innerHTML = displayProducts.map(product => `
                    <div class="home-product-card loading-fade-in" data-product-id="${product.id}">
                        <div class="home-product-img-wrapper">
                            <img src="${this.getProductImage(product)}" alt="${product.name}" class="home-product-img" />
                        </div>
                        <div class="home-product-content">
                            <h3 class="home-product-name">${product.name}</h3>
                            <p class="home-product-price">${this.formatRupiah(product.price)}</p>
                            <div class="home-product-rating">
                                <span class="home-rating-stars"><i class="fas fa-star"></i> ${product.avg_rating ? product.avg_rating.toFixed(1) : 'N/A'}</span>
                                <span class="home-rating-divider">|</span>
                                <span class="home-sales-count">${product.total_sold ?? 0}+ Terjual</span>
                            </div>
                        </div>
                    </div>
                `).join('');

                // Add click event listeners after rendering
                this.bindProductCardEvents(container);
            } else {
                container.innerHTML = '<p class="home-no-data">No best products available.</p>';
            }
        } catch (err) {
            console.error("Failed to load best products:", err);
            container.innerHTML = '<p class="home-error-text">Failed to load best products.</p>';
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

    bindProductCardEvents(container) {
        // Add click event listeners to all product cards in the container
        const productCards = container.querySelectorAll('.home-product-card[data-product-id]');
        productCards.forEach(card => {
            card.addEventListener('click', () => {
                const productId = card.getAttribute('data-product-id');
                this.navigateToDetail(productId);
            });
        });
    }

    bindCategoryCardEvents() {
        const categoryCards = document.querySelectorAll('.home-category-card');
        categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                const categoryId = card.getAttribute('data-category-id');
                const categoryName = card.getAttribute('data-category-name');
                this.navigateToKatalogWithCategory(categoryId, categoryName);
            });
        });
    }

    navigateToKatalogWithCategory(categoryId, categoryName) {
        // Navigate to katalog page with category filter
        window.location.href = `/katalog?category=${categoryId}&categoryName=${encodeURIComponent(categoryName)}`;
    }

    navigateToDetail(productId) {
        // Navigate to detail page using query parameter
        window.location.href = `/detail?id=${productId}`;
    }

    // Cleanup method to destroy swipers and event listeners when page is destroyed
    destroy() {
        if (this.categoriesSwiper) {
            this.categoriesSwiper.destroy(true, true);
            this.categoriesSwiper = null;
        }
        
        // Clean up resize event listener
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        window.removeEventListener('resize', this.setupResponsiveHandler);
    }
}

export default HomePage;