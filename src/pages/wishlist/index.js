import { UserApiService } from '../../lib/UserApiService.js';
import { TopNavigationBar, initializeTopNavigationSearch } from '../../components/TopNavigationBar.js';
import { BottomNavigationBar } from '../../components/BottomNavigationBar.js';
import { Footer } from '../../components/Footer.js';
import '../../styles/components/wishlist.css';
import notFound from "../../../public/assets/empty.svg";

class WishListPage {
    constructor() {
        this.UserApiService = new UserApiService();
    }

    async render(container) {
        container.innerHTML = this.getHTML();
        this.setUpNavigation();
        this.bindEvents();
        await this.loadBanner();
    }

    setUpNavigation() {
        document.getElementById('top-bar').innerHTML = TopNavigationBar();
        document.getElementById('bottom-bar').innerHTML = BottomNavigationBar();
        document.getElementById('footer').innerHTML = Footer();

        // Initialize product search functionality
        initializeTopNavigationSearch();
    }
    getHTML() {

        const data = this.getWishlist();

        return `
        <div class="page-container">
            <div id="top-bar"></div>
            <div class="main-layout">
                <div class="wishlist-container">

                ${data.length > 0 ? `<div class="wishlist-title">
                        <span> <strong id="counter">0</strong> Produk Terpilih</span>
                        <button class="clear-btn">Hapus</button>
                    </div>` : ``}


                    <h2 class="wishlist-heading">YOUR WISHLIST</h2>

                    <div class="items-container"></div>

                </div>

                <div class="notFound"></div>
        </div>

            <div id="confirm-modal" class="modal-overlay hidden">
                <div class="modal-box">
                    <p>Apakah kamu yakin ingin menghapus item ini?</p>
                    <div class="modal-actions">
                    <button id="confirm-yes" class="modal-btn danger">Hapus</button>
                    <button id="confirm-no" class="modal-btn">Batal</button>
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

    getWishlist() {
        try {
            const data = JSON.parse(localStorage.getItem('wishlist')) || [];
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error reading wishlist from localStorage:', error);
            return [];
        }
    }

    async loadBanner() {

        try {
            this.renderWishlist();
        } catch (error) {
            console.error('Error loading wishlist:', error);
            this.renderError();
        }
    }

    renderWishlist() {

        const container = document.querySelector('.items-container');
        const data = this.getWishlist();

        if (!data || data.length === 0) {
            const notFoundContainer = document.querySelector('.notFound');
            notFoundContainer.innerHTML = `<div style="
                                                        display: flex;
                                                        justify-content: center;
                                                        align-items: center;
                                                        flex-direction: column;
                                                        width: 100%;
                                                        gap:8px;
                                                        margin-top: 52px;
                                                    ">
                                                        <img src="${notFound}" alt="${notFound}" style="height: 300px; width: fit-content" />
                                                        <p style="color: #777; white-space: nowrap;">Belum ada barang dalam wishlist.</p>
                                                    </div>
                                                    `;
            return;
        } else

            document.getElementById('counter').textContent = 0;
        container.innerHTML = data.map(item => `
    <div class="wishlist-items" data-product-id="${item.id}">
      <input type="checkbox" class="wishlist-checkbox" />

      <div class="wishlist-image">
        <img src="${item.image || 'https://via.placeholder.com/100x100/f5f5f5/666666?text=No+Image'}" alt="${item.title || item.name}" />
      </div>

      <div class="wishlist-details">
        <div class="wishlist-name">${item.title || item.name}</div>
        <div class="wishlist-price">${item.price}</div>
        ${item.brand_name ? `<div class="wishlist-brand">Brand: ${item.brand_name}</div>` : ''}
        ${item.avg_rating ? `
          <div class="wishlist-rating">
            <span class="rating-stars">${this.renderStars(item.avg_rating)}</span>
            <span class="rating-text">${item.avg_rating.toFixed(1)}</span>
          </div>
        ` : ''}
      </div>

      <div class="wishlist-actions">
        <button class="wishlist-view" data-id="${item.id}" title="View Product">
          <i class="fas fa-eye"></i>
        </button>
        <button class="wishlist-delete" data-id="${item.id}" title="Remove from Wishlist">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');

        this.bindDeleteEvents();
        this.bindViewEvents();
        this.bindCheckboxEvents();
        this.bindBulkDelete();
    }


    bindDeleteEvents() {
        const deleteButtons = document.querySelectorAll('.wishlist-delete');

        deleteButtons.forEach(button => {
            button.addEventListener('click', () => {
                const id = parseInt(button.dataset.id);

                this.showDeleteConfirmation(() => {
                    this.removeFromWishlist(id);
                    this.renderWishlist();
                });
            });
        });
    }

    bindViewEvents() {
        const viewButtons = document.querySelectorAll('.wishlist-view');

        viewButtons.forEach(button => {
            button.addEventListener('click', () => {
                const id = button.dataset.id;
                // Navigate to product detail page
                window.location.href = `/detail?id=${id}`;
            });
        });
    }


    showDeleteConfirmation(onConfirm) {
        const modal = document.getElementById('confirm-modal');
        const btnYes = document.getElementById('confirm-yes');
        const btnNo = document.getElementById('confirm-no');

        modal.classList.remove('hidden');

        const cleanup = () => {
            modal.classList.add('hidden');
            btnYes.removeEventListener('click', onYes);
            btnNo.removeEventListener('click', onNo);
        };

        const onYes = () => {
            onConfirm(); // Panggil fungsi hapus
            cleanup();
        };

        const onNo = () => cleanup();

        btnYes.addEventListener('click', onYes);
        btnNo.addEventListener('click', onNo);
    }

    bindCheckboxEvents() {
        const checkboxes = document.querySelectorAll('.wishlist-checkbox');
        const counterEl = document.getElementById('counter');

        const updateCounter = () => {
            const checked = [...checkboxes].filter(cb => cb.checked).length;
            counterEl.textContent = checked;
        };

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateCounter);
        });

        updateCounter(); // Set counter saat pertama render
    }

    bindBulkDelete() {
        const clearBtn = document.querySelector('.clear-btn');

        clearBtn.addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('.wishlist-checkbox');
            const selectedIds = [];

            checkboxes.forEach((checkbox, index) => {
                if (checkbox.checked) {
                    const itemEl = checkbox.closest('.wishlist-items');
                    const id = parseInt(itemEl.querySelector('.wishlist-delete').dataset.id);
                    selectedIds.push(id);
                }
            });

            if (selectedIds.length === 0) return;

            this.showDeleteConfirmation(() => {
                let wishlist = this.getWishlist();
                wishlist = wishlist.filter(item => !selectedIds.includes(item.id));
                localStorage.setItem('wishlist', JSON.stringify(wishlist));
                this.renderWishlist(); // refresh view
            });
        });
    }


    removeFromWishlist(id) {
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const updated = wishlist.filter(item => item.id !== id);
        localStorage.setItem('wishlist', JSON.stringify(updated));
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let starsHTML = '';

        // Full stars
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star"></i>';
        }

        // Half star
        if (hasHalfStar) {
            starsHTML += '<i class="fas fa-star-half-alt"></i>';
        }

        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star"></i>';
        }

        return starsHTML;
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

export default WishListPage;
