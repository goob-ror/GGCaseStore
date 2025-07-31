import '../styles/components/top-navigation-bar.css';
import logo from '../../public/assets/logoCatalog.png';

export const TopNavigationBar = () => {
    return `
        <header class="topNavigationBar">
            <div class="navigationBarContainer">
                <div class="logoNavigationBar">
                    <a href="/">
                    <img src="${logo}" alt="${logo}" class="logo-image">
                    </a>
                </div>

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
    `;
}
