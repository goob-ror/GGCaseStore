import { UserApiService } from '../../lib/UserApiService.js';
import { TopNavigationBar } from '../../components/TopNavigationBar.js';
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
    }
    getHTML() {

        const data = this.getWishlist();

        return `
        <div>
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
        const data = JSON.parse(localStorage.getItem('wishlist')) || [];
        return data ? data : [];
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
    <div class="wishlist-items">
      <input type="checkbox" class="wishlist-checkbox" />

      <div class="wishlist-image">
        <img src="${item.image}" alt="${item.title}" />
      </div>

      <div class="wishlist-details">
        <div class="wishlist-name">${item.title}</div>
        <div class="wishlist-price">${item.price}</div>
      </div>

      <button class="wishlist-delete" data-id="${item.id}">
        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
            <path fill="none" stroke="#000" stroke-linecap="round" d="M9.5 14.5v-3m5 3v-3M3 6.5h18v0c-1.404 0-2.107 0-2.611.337a2 2 0 0 0-.552.552C17.5 7.893 17.5 8.596 17.5 10v5.5c0 1.886 0 2.828-.586 3.414s-1.528.586-3.414.586h-3c-1.886 0-2.828 0-3.414-.586S6.5 17.386 6.5 15.5V10c0-1.404 0-2.107-.337-2.611a2 2 0 0 0-.552-.552C5.107 6.5 4.404 6.5 3 6.5zm6.5-3s.5-1 2.5-1s2.5 1 2.5 1" stroke-width="1" />
        </svg>
      </button>
    </div>
  `).join('');

        this.bindDeleteEvents();
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
                    window.location.reload();

                });
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
