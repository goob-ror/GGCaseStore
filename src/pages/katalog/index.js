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
    }

    async render(container) {
        container.innerHTML = this.getHTML();
        this.setUpNavigation();
        this.bindEvents();
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
                <div class="container">
                    <!-- Filter Sidebar -->
                    <div class="filter">
                        <h3>Filter</h3>
                        <div class="filter-group">
                            <div for="min-price" class="label-input">Harga</div>
                            <div class="filter-row">
                                <label class="filter-sub">Min</label>
                                <input type="number" class="filter-input" placeholder="Rp 20.000">
                            </div>
                            <div class="filter-row">
                                <label class="filter-sub">Maks</label>
                                <input type="number" class="filter-input" placeholder="Rp 500.000">
                            </div>
                        </div>
                        <div class="filter-group-select">
                            <div for="status" class="label-input-b">Status</div>
                                <div class="select-status">
                                    <select id="status" class="filter-select">
                                        <option>Tersedia</option>
                                        <option>Habis</option>
                                    </select>
                                    <select id="status" class="filter-select">
                                        <option>Default</option>
                                        <option>Habis</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                            <!-- Main Content -->
                            <div class="main-content">
                                <div class="header-bar">
                                    <p>Berdasarkan Produk</p>
                                    <select class="select-bar">
                                        <option>Urutkan</option>
                                    </select>
                                </div>
        
                                <div class="product-grid">
                                    <!-- Produk diulang -->
                                    <!-- Salin dan ubah untuk produk lainnya -->
                                    <!-- ... -->
                                </div>
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

    async loadProducts() {
    const container = document.querySelector('.product-grid');
    try {
        const response = await this.UserApiService.get('/products'); 
        this.products = response.data || [];

        container.innerHTML = this.products.map(product => `
            <div class="card">
                <img src="${this.getProductImage(product)}" alt="${product.name}" class="card-img"/>
                <div class="card-content">
                    <div class="product-name">${product.name}</div>
                    <p class="product-price">${this.formatRupiah(product.price)}</p>
                    <div class="card-rating">
                        <span>⭐ ${product.avg_rating ? product.avg_rating.toFixed(1) : 'Belum ada rating'}</span>
                        <span>|</span>
                        <span>${product.total_sold ?? 0}+ Terjual</span>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = `<p>Gagal memuat produk.</p>`;
        console.error('Error loading products:', err);
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
