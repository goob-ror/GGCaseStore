import '../styles/components/top-navigation-bar.css';
import logo from '../../public/assets/logoCatalog.png';

export const TopNavigationBar = () => {
    return `
        <header>
            <div class="container">
            <h1 class="logo">
                <a href="/">
                <img src="${logo}" alt="${logo}" class="logo-image">
                </a>
            </h1>

            <nav>
                <div class="nav-links">
                <a href="/" class="">Home</a>
                <a href="/katalog" class="">Katalog</a>
                <a href="/brands" class="">Brands</a>
                <a href="/wishlist" class="">Wishlist</a>
                </div>
            </nav>

            <div class="search-bar">
                <input type="text" placeholder="Cari Barang....">
                <button>
                <i class="fas fa-search"></i>
                </button>
            </div>
            </div>
        </header>

        <style>
        .logo-image{
        width: 40px;
        height: 40px;
        }
        </style>
    `;
}
