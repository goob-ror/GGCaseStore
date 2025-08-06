import '../styles/components/footer.css';
import logo from '../../public/assets/logoCatalog.png';
import facebook from '../../public/assets/facebook.png';
import instagram from '../../public/assets/instagram.png';
import gmaps from '../../public/assets/gmaps.png';
import youtube from '../../public/assets/youtube.png';
import tiktok from '../../public/assets/tiktok.png';
import tokopedia from '../../public/assets/tokopedia.png';
import shopee from '../../public/assets/shopee.png';

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
                        Solusi lengkap elektronik dan aksesoris, hanya di GG Case.
                        Belanja mudah, cepat, dan aman.
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
                </div>

                <!-- Contact Info -->
                <div class="footer-section">
                    <h2>Contact Information</h2>
                    <ul class="contact-list">
                    <li>
                        <img src="${youtube}" alt=Youtube Icon" class="icon">
                        <a href="https://www.youtube.com/@ggcasegroupentertainment?si=qtgdwvn3h4jYXq7j" target="_blank">
                            GG GROUP Entertainment
                        </a>
                    </li>
                    <li>
                            <img src="${instagram}" alt="Instagram Icon" class="icon">
                            <a href="https://www.instagram.com/ggcasegroup.id?igsh=NnB2MDh2eGl4bWVk" target="_blank">
                                ggcasegroup.id
                            </a>
                    </li>
                    <li>
                            <img src="${tiktok}" alt="Tiktok Icon" class="icon">
                            <a href="https://www.tiktok.com/@ggaccindonesia?_t=ZS-8ydq3i7CD2I&_r=1" target="_blank">
                                ggaccindonesia
                            </a>
                    </li>
                    <li>
                            <img src="${tokopedia}" alt="Tokopedia Icon" class="icon">
                            <a href="https://www.tokopedia.com/ggcasegroups" target="_blank">
                                GGCASE GROUP SAMARINDA
                            </a>
                    </li>
                    <li>
                            <img src="${shopee}" alt="Shopee Icon" class="icon">
                            <a href="https://shopee.co.id/ggcasegroup" target="_blank">
                                GG CASE GROUP
                            </a>
                    </li>
                    </ul>

                    <div class="map-info">
                        <h2>Company Address</h2>
                        <div class="map-row">
                             <img src="${gmaps}" alt="Google Maps Icon" class="icon">
                            <a href="https://linktr.ee/qwerty30aja" target="_blank" class="text-white">
                                  GG CASE GROUP
                            </a>
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
