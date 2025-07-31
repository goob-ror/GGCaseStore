import { UserApiService } from '../../lib/UserApiService.js';
import { TopNavigationBar } from '../../components/TopNavigationBar.js';
import { BottomNavigationBar } from '../../components/BottomNavigationBar.js';
import { Footer } from '../../components/Footer.js';
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
// import 'swiper/css/navigation';
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
    }

    setUpNavigation() {
        document.getElementById('top-bar').innerHTML = TopNavigationBar();
        document.getElementById('bottom-bar').innerHTML = BottomNavigationBar();
        document.getElementById('footer').innerHTML = Footer();
    }
    getHTML() {
        return `
        <div id="top-bar"></div>
        <div class="main-layout">
            <div class="swiper" id="banner">
                <div class="swiper-wrapper"></div>
                
                <div class="swiper-pagination"></div>
                <div class="swiper-button-prev"></div>
                <div class="swiper-button-next"></div>
            </div>

            
            
            <h2 className="uppercase mt-6 text-base font-semibold text-[#313131]">Kategori</h2>
             <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 mt-3 gap-5 kategori"></div>

            <div className="flex justify-between text-[#313131] items-center mt-6 ">
                <h2 className="uppercase text-base font-semibold ">Produk Terlaris</h2>

                <div className="flex items-center">
                <p className="capitalize text-[12px]">lihat semua</p>
                </div>
            </div>

            <div class="grid produk-terlaris"></div>

            <div class="section-header">
                <h2 class="section-title">Produk dengan Rating Tertinggi</h2>
                <div class="lihat-semua">
                    <p>Lihat Semua</p>
                    <span>&rsaquo;</span>
                </div>
            </div>
            <div class="grid produk-rating"></div>


            <div class="section-header">
                <h2 class="section-title">Produk Terbaik</h2>
                <div class="lihat-semua">
                    <p>Lihat Semua</p>
                    <span>&rsaquo;</span>
                </div>
            </div>
            <div class="grid produk-terbaik"></div>
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

        // function formatRupiah(number) {
        //     return new Intl.NumberFormat("id-ID", {
        //         style: "currency",
        //         currency: "IDR",
        //         minimumFractionDigits: 0,
        //     }).format(number);
        // }

        // function renderKategori() {
        //     const container = document.querySelector(".kategori");
        //     kategori.forEach(item => {
        //         const div = document.createElement("div");
        //         div.className = "card";
        //         div.innerHTML = `
        //             <div class="card-img"><img src="${item.href}" alt="${item.title}" /></div>
        //             <h3 class="card-title">${item.title}</h3>
        //         `;
        //         container.appendChild(div);
        //     });
        // }

        // function renderProduk(selector) {
        //     const container = document.querySelector(selector);
        //     produk.forEach(item => {
        //         const div = document.createElement("div");
        //         div.className = "card";
        //         div.innerHTML = `
        //             <div class="card-img"><img src="${item.href}" alt="${item.title}" /></div>
        //             <div>
        //                 <h3 class="card-title">${item.title}</h3>
        //                 <h3 class="card-price">${formatRupiah(item.price)}</h3>
        //                 <div class="card-meta">
        //                 <span>⭐ ${item.rating}</span>
        //                 <span>|</span>
        //                 <span>${item.sold}</span>
        //                 </div>
        //             </div>
        //         `;
        //         container.appendChild(div);
        //     });
        // }

        // renderKategori();
        // renderProduk(".produk-terlaris");
        // renderProduk(".produk-rating");
        // renderProduk(".produk-terbaik");

    }

    async loadBanner() {
        this.showBannerSkeleton();
        try {
            const response = await this.UserApiService.get('/banners/active');
            this.banners = response.data || [];
            this.renderBanner();
        } catch (error) {
            console.error('Error loading banner:', error);
            // this.notificationService.error('Error', 'Failed to load admin users');
            // this.renderError();
        }
    }
    showBannerSkeleton() {
        const container = document.querySelector('#banner .swiper-wrapper');
        if (container) {
            container.innerHTML = `
            <div class="swiper-slide">
                <div class="banner-skeleton animate-pulse">
                <div class="skeleton-img"></div>
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
                <div class="banner">
                    <img src="${banner.banner_image_url}" alt="${banner.title}" />
                </div>
            </div>
        `).join('');
        }

        Swiper.use([Navigation, Pagination]);
        const swiper = new Swiper('.swiper', {
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

}

export default HomePage;
