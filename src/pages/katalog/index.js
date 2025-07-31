import { UserApiService } from '../../lib/UserApiService.js';
import { TopNavigationBar } from '../../components/TopNavigationBar.js';
import { BottomNavigationBar } from '../../components/BottomNavigationBar.js';
import { Footer } from '../../components/Footer.js';
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
        `;
    }

    bindEvents() {
        // future: add filter interaction here
    }

    async loadProducts() {
    const container = document.querySelector('.product-grid');
    try {
        const response = await this.UserApiService.get('/products'); 
        this.products = response.data || [];

        container.innerHTML = this.products.map(product => `
            <div class="product-card">
                <img src="${product.photo_url}" alt="${product.name}"/>
                <div class="card-content">
                    <div class="product-name">${product.name}</div>
                    <p class="product-price">${this.formatRupiah(product.price)}</p>
                    <div class="card-rating">    
                        <span>⭐ ${product.ratings ? product.ratings.toFixed(1) : '0'}</span>
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
}

export default KatalogPage;
