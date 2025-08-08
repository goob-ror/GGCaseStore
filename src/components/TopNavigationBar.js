import '../styles/components/top-navigation-bar.css';
import '../styles/components/product-search.css';
import { ProductSearch } from './ProductSearch.js';
import logo from '../../public/assets/logoCatalog.png';

let productSearchInstance = null;

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

            <div id="product-search-container"></div>
            </div>
        </header>

        <style>
        .logo-image{
        width: 40px;
        height: 40px;
        }
        </style>
    `;
};

export const initializeTopNavigationSearch = () => {
    // Clean up existing instance
    if (productSearchInstance) {
        productSearchInstance.destroy();
    }

    // Create new product search instance
    productSearchInstance = new ProductSearch({
        placeholder: 'Cari Barang....',
        onSelect: (product) => {
            // Navigate to product detail page using regular URL routing
            window.location.href = `/detail?id=${product.id}`;
        }
    });

    // Insert HTML and initialize
    const container = document.getElementById('product-search-container');
    if (container) {
        container.innerHTML = productSearchInstance.createHTML('nav-product-search');
        productSearchInstance.initialize('nav-product-search');
    }

    return productSearchInstance;
};
