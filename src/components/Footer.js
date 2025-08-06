import '../styles/components/footer.css';
import logo from '../../public/assets/logoCatalog.png';
import facebook from '../../public/assets/facebook.png';
import instagram from '../../public/assets/instagram.png';

import gmaps from '../../public/assets/gmaps.png';

export const Footer = () => {
    return `
        <footer>
            <div class="footer-content">
                <!-- Logo and Description -->
                <div class="footer-section">
                    <a href="/" class="footer-logo">
                        <img src="${logo}" alt="GG Catalog logo" class="logo-image" />
                    </a>
                    <p class="footer-description">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet expedita aliquid, quod dolore libero sint assumenda
                        fugiat qui eligendi quam vel vitae.
                    </p>
                </div>

                <!-- Quick Links & Kategori -->
                <div class="footer-section footer-links">
                    <div>
                        <h2>Quick Links</h2>
                        <ul>
                            <li><a href="/">Home</a></li>
                            <li><a href="/katalog">Katalog</a></li>
                            <li><a href="/brands">Brands</a></li>
                            <li><a href="/wishlist">Wishlist</a></li>
                        </ul>
                    </div>
                    <div>
                        <h2>Kategori</h2>
                        <ul>
                            <li><a href="#">Kategori 1</a></li>
                            <li><a href="#">Kategori 2</a></li>
                            <li><a href="#">Kategori 3</a></li>
                            <li><a href="#">Kategori 4</a></li>
                        </ul>
                    </div>
                </div>

                <!-- Contact Info -->
                <div class="footer-section">
                    <h2>Contact Information</h2>
                    <ul class="contact-list">
                        <li><i class="fas fa-phone-alt"></i><span>+62 812 3456 7890</span></li>
                        <li><i class="fas fa-envelope"></i><span>ggcatalogstore@gmail.com</span></li>
                        <li><img src="${facebook}" alt="Facebook Icon" class="icon"><span>Facebook</span></li>
                        <li><img src="${instagram}" alt="Instagram Icon" class="icon"><span>Instagram</span></li>
                    </ul>

                    <div class="map-info">
                        <h2>Company Address</h2>
                        <div class="map-row">
                            <a href="#"><img src="${gmaps}" alt="Google Maps Icon"></a>
                            <p>Jl. Raya Cibadak No.123, Cibadak, Cimahi, Jawa Barat</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="footer-bottom">
                © 2025 GG Store Catalogs. All rights reserved.
            </div>
        </footer>
    `;
}
