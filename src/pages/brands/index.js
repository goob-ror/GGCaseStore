import { UserApiService } from '../../lib/UserApiService.js';
import { TopNavigationBar, initializeTopNavigationSearch } from '../../components/TopNavigationBar.js';
import { BottomNavigationBar } from '../../components/BottomNavigationBar.js';
import { Footer } from '../../components/Footer.js';
import '../../styles/components/brands.css';

class UserBrandsPage {
    constructor() {
        this.UserApiService = new UserApiService();
    }

    async render(container) {
        container.innerHTML = this.getHTML();
        this.setUpNavigation();
        this.bindEvents();
        await this.loadBrands();
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

            <div class="main-layout">

            <h2 class="page-title">OUR TRUSTED BRANDS</h2>
                <div class="brands-container">
                </div>
            </div>

            <div id="footer"></div>
            <div id="bottom-bar"></div>
        </div>
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

    async loadBrands() {
        this.showSkeleton();
        try {
            const response = await this.UserApiService.get('/brands');
            this.banners = response.data || [];
            this.renderBrands();
        } catch (error) {
            console.error('Error loading banner:', error);
        }
    }
    showSkeleton() {
        const container = document.querySelector('.brands-container');
        if (container) {
            let skeletonHTML = "";

            for (let i = 0; i < 5; i++) {
                skeletonHTML += `
            <div class="brands-item">
                <div class="brands-image-skeleton animate-pulse">
                    <div class="skeleton-img"></div>
                </div>
            </div>
        `;
            }

            container.innerHTML = skeletonHTML;
        }
    }
    renderBrands() {
        const container = document.querySelector('.brands-container');

        if (container) {
            if (this.banners.length === 0) {
                container.innerHTML = '<p style="text-align:center; color: #777;">No brands found.</p>';
                return;
            } else {
                container.innerHTML = this.banners.map(brand => `
                    <div class="brands-item">
                <div class="brands-image-container">
                    <img src="${brand.brand_photo}" alt="${brand.name}" style="width: 100%; height: 100%; object-fit: contain;" />
                </div>
                <h3 class="text-uppercase brands-title">${brand.name}</h3>
                </div>
        `).join('');
            }
        }
    }

    renderError() {
        const container = document.querySelector('.main-layout');
        if (container) {
            container.innerHTML = `
            <div class="error-message">
                <h3>Ups, terjadi kesalahan. <br/> Silakan coba lagi.</h3>
                <button class="refresh-button">Refresh Halaman</button>
            </div>
            `;

            const refreshBtn = container.querySelector('.refresh-button');
            refreshBtn.addEventListener('click', () => {
                location.reload();
            });
        }
    }
}

export default UserBrandsPage;