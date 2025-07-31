import '../styles/components/bottom-navigation-bar.css';

export const BottomNavigationBar = () => {
    return `
        <div class="bottom-navbar">
            <div class="bottom-nav">
            <a href="/" class="" data-path="/">
                <i class="fas fa-home"></i>
                <span>Home</span>
            </a>
            <a href="/katalog" data-path="/katalog">
                <i class="fas fa-box-open"></i>
                <span>Katalog</span>
            </a>
            <a href="/brands" data-path="/Brands">
                <i class="fas fa-fire"></i>
                <span>Brands</span>
            </a>
            <a href="/wishlist" data-path="/Wishlist">
                <i class="far fa-heart"></i>
                <span>Wishlist</span>
            </a>
            </div>
        </div>

        <style>
        .logo-image{
        width: 40px;
        heigth: 40px;
        }
        </style>
    `;
}
