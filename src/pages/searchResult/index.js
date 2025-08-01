import { UserApiService } from '../../lib/UserApiService.js';
import { TopNavigationBar, initializeTopNavigationSearch } from '../../components/TopNavigationBar.js';
import { BottomNavigationBar } from '../../components/BottomNavigationBar.js';
import { Footer } from '../../components/Footer.js';
import '../../styles/components/search-result.css';
import notFound from "../../../public/assets/not found.svg";

class UserSearchResult {
    constructor() {
        this.UserApiService = new UserApiService();
        this.product = [];
    }

    async render(container) {
        container.innerHTML = this.getHTML();
        this.setUpNavigation();
        this.bindEvents();
        await this.loadProduct();
    }

    setUpNavigation() {
        document.getElementById('top-bar').innerHTML = TopNavigationBar();
        document.getElementById('bottom-bar').innerHTML = BottomNavigationBar();
        document.getElementById('footer').innerHTML = Footer();

        // Initialize product search functionality
        initializeTopNavigationSearch();
    }

    getParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const key = urlParams.get('key');

        if (!key) {
            window.location.href = '/';
            return null;
        } else {
            return key;
        }
    }

    getHTML() {
        const key = this.getParams();
        if (!key) return '';
        
        return `
        <div class="page-container">
            <div id="top-bar"></div>

            <div class="main-layout">
                <h2 class="page-title">Menampilkan Hasil pencarian "${key}"</h2>
                <div class="content-wrapper">
                    <div class="items-grid"></div>
                    <div class="notFound"></div>
                </div>
            </div>

            <div id="footer"></div>
        </div>
        <div id="bottom-bar"></div>
        `;
    }

  bindEvents() {
    // Navigation events - highlight Katalog for detail pages
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
      // Remove any existing active class
      link.classList.remove('active');
      // Add active class to Katalog link since this is a product detail page
      if (link.getAttribute('href') === '/katalog') {
        link.classList.add('active');
      }
    });

    const bottomLinks = document.querySelectorAll(".bottom-nav a");
    bottomLinks.forEach(link => {
      // Remove any existing active class
      link.classList.remove('active');
      // Add active class to Katalog link
      if (link.getAttribute("data-path") === '/katalog') {
        link.classList.add("active");
      }
    });
  }

    async loadProduct() {
        try {
            const searchKey = this.getParams();
            if (searchKey) {
                const response = await this.UserApiService.get('/products/search', {
                    q: searchKey,
                    limit: 50
                });
                this.product = response.data || [];
            } else {
                this.product = [];
            }
            this.renderProduct();
        } catch (error) {
            console.error('Error loading product:', error);
            this.product = [];
            this.renderProduct();
        }
    }

    renderProduct() {
        const container = document.querySelector('.items-grid');
        const notFoundContainer = document.querySelector('.notFound');

        if (!container) return;

        // Clear both containers first
        container.innerHTML = '';
        if (notFoundContainer) {
            notFoundContainer.innerHTML = '';
        }

        if (!this.product || this.product.length === 0) {
            if (notFoundContainer) {
                notFoundContainer.innerHTML = `
                    <div class="not-found-wrapper">
                        <img src="${notFound}" alt="Tidak ditemukan" class="not-found-image" />
                        <p class="not-found-text">Tidak Ada Barang Ditemukan.</p>
                    </div>
                `;
            }
            return;
        }

        // Render products
        container.innerHTML = this.product.map(product => this.renderProductCard(product)).join('');
        
        // Add click event listeners after rendering
        this.bindProductCardEvents(container);
    }

    renderProductCard(product) {
        const price = product.base_price || product.price;
        const formattedPrice = price ? this.formatRupiah(price) : 'Rp -';
        const rating = product.avg_rating ? parseFloat(product.avg_rating).toFixed(1) : '0.0';
        const sold = product.total_sold || 0;

        return `
            <div class="items-container" data-product-id="${product.id}">
                <div class="items-image-wrapper">
                    <img src="${this.getProductImage(product)}" 
                         alt="${product.name || 'Product'}" 
                         class="items-image"
                         loading="lazy" />
                </div>
                <div class="items-text-wrapper">
                    <h3 class="items-title">${product.name || 'Unnamed Product'}</h3>
                    <p class="items-price">${formattedPrice}</p>
                    <div class="items-sold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 32 32">
                            <path fill="#FFCD29" d="m18.7 4.627l2.247 4.31a2.27 2.27 0 0 0 1.686 1.189l4.746.65c2.538.35 3.522 3.479 1.645 5.219l-3.25 2.999a2.23 2.23 0 0 0-.683 2.04l.793 4.398c.441 2.45-2.108 4.36-4.345 3.24l-4.536-2.25a2.28 2.28 0 0 0-2.006 0l-4.536 2.25c-2.238 1.11-4.786-.79-4.345-3.24l.793-4.399c.14-.75-.12-1.52-.682-2.04l-3.251-2.998c-1.877-1.73-.893-4.87 1.645-5.22l4.746-.65a2.23 2.23 0 0 0 1.686-1.189l2.248-4.309c1.144-2.17 4.264-2.17 5.398 0" />
                        </svg>
                        <span class="rating">${rating}</span>
                        <span class="separator">|</span>
                        <span class="sold-count">${sold}+ Terjual</span>
                    </div>
                </div>
            </div>
        `;
    }

    getProductImage(product) {
        // Return the first image from the photos array, or a placeholder if no images
        if (product.photos && product.photos.length > 0 && product.photos[0].photo_url) {
            return product.photos[0].photo_url;
        }
        // Return a placeholder image if no photos available
        return '/public/uploads/products/product_1_1753842813929_6xc3sp2s8un.webp';
    }

    formatRupiah(angka) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(angka);
    }

    bindProductCardEvents(container) {
        // Add click event listeners to all product cards in the container
        const productCards = container.querySelectorAll('.items-container[data-product-id]');
        productCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = card.getAttribute('data-product-id');
                if (productId) {
                    this.navigateToDetail(productId);
                }
            });
        });
    }

    navigateToDetail(productId) {
        // Navigate to detail page using query parameter
        window.location.href = `/detail?id=${productId}`;
    }
}

export default UserSearchResult;