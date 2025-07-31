import { UserApiService } from '../../lib/UserApiService.js';
import { TopNavigationBar } from '../../components/TopNavigationBar.js';
import { BottomNavigationBar } from '../../components/BottomNavigationBar.js';
import { Footer } from '../../components/Footer.js';
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import '../../styles/components/home.css';

class HomePage {
    constructor() {
        this.UserApiService = new UserApiService();
    }

    async render(container) {
        container.innerHTML = this.getHTML();
        this.setUpNavigation();
        this.bindEvents();
        await this.loadBanner();
        await this.loadCategories();
    }

    setUpNavigation() {
        document.getElementById('top-bar').innerHTML = TopNavigationBar();
        document.getElementById('bottom-bar').innerHTML = BottomNavigationBar();
        document.getElementById('footer').innerHTML = Footer();
    }

    getHTML() {
        return `
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
                <div class="home-categories-grid kategori"></div>
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
        </div>

        <div id="footer"></div>
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
                    <div class="home-category-card">
                        <div class="home-category-img-wrapper">
                            <img src="${cat.category_photo}" alt="${cat.name}" class="home-category-img" />
                        </div>
                        <p class="home-category-name">${cat.name}</p>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<p class="home-no-data">No categories available.</p>';
            }
        } catch (err) {
            console.error("Failed to load categories:", err);
            container.innerHTML = '<p class="home-error-text">Failed to load categories.</p>';
        }
    }
}

export default HomePage;