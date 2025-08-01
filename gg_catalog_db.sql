-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Waktu pembuatan: 01 Agu 2025 pada 23.08
-- Versi server: 8.0.30
-- Versi PHP: 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gg_catalog_db`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `admins`
--

CREATE TABLE `admins` (
  `id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `last_login_ip` varchar(45) DEFAULT NULL,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `admins`
--

INSERT INTO `admins` (`id`, `username`, `password_hash`, `last_login_ip`, `last_login_at`, `created_at`, `updated_at`) VALUES
(1, 'adminUser', '$2b$10$kCFAA78JqbB8vL/MkoYV..tqdaE8OJqfblRg.oXue4x.Qny.KyKxi', '::1', '2025-08-02 02:07:35', '2025-07-30 18:34:45', '2025-08-02 02:07:35');

-- --------------------------------------------------------

--
-- Struktur dari tabel `brands`
--

CREATE TABLE `brands` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `brand_photo` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `brands`
--

INSERT INTO `brands` (`id`, `name`, `brand_photo`, `created_at`) VALUES
(4, 'V-Gen', '/uploads/brands/brand_4_1754054050498_x9h6nc2geb.webp', '2025-08-01 21:14:10'),
(5, 'Sandisk', '/uploads/brands/brand_5_1754054733194_98xw166iblg.webp', '2025-08-01 21:25:33'),
(6, 'Toshiba', '/uploads/brands/brand_6_1754055208332_wk54bi08k5.webp', '2025-08-01 21:33:28'),
(7, 'Samsung', '/uploads/brands/brand_7_1754055256646_9v1198qfvpi.webp', '2025-08-01 21:34:16'),
(8, 'Ezviz', '/uploads/brands/brand_8_1754055315487_u146l7baxrl.webp', '2025-08-01 21:35:15'),
(9, 'Thinkplus', '/uploads/brands/brand_9_1754056715957_zs00hj85le.webp', '2025-08-01 21:58:35'),
(10, 'Xiaomi', '/uploads/brands/brand_10_1754057037896_y9bp1sz97qc.webp', '2025-08-01 22:03:57');

-- --------------------------------------------------------

--
-- Struktur dari tabel `categories`
--

CREATE TABLE `categories` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `category_photo` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `categories`
--

INSERT INTO `categories` (`id`, `name`, `category_photo`, `created_at`) VALUES
(4, 'Kartu SD', '/uploads/categories/category_4_1754054239062_h6yor10rf3v.webp', '2025-08-01 21:16:59'),
(5, 'Airbuds', '/uploads/categories/category_5_1754056229256_pm3zfmj0gd.webp', '2025-08-01 21:50:29'),
(6, 'Earphone', '/uploads/categories/category_6_1754056255146_1clrowdvrtp.webp', '2025-08-01 21:50:55'),
(7, 'Charger Type C', '/uploads/categories/category_7_1754056318245_au54vec6ip.webp', '2025-08-01 21:51:58'),
(8, 'Casing HP', '/uploads/categories/category_8_1754056374026_u3wxawzs9t.webp', '2025-08-01 21:52:54'),
(9, 'Tempered Glass', '/uploads/categories/category_9_1754056417268_5s22gnjjsqs.webp', '2025-08-01 21:53:37');

-- --------------------------------------------------------

--
-- Struktur dari tabel `products`
--

CREATE TABLE `products` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `brand_id` int DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `price` int DEFAULT NULL,
  `total_sold` int DEFAULT '0',
  `avg_rating` float DEFAULT '0',
  `total_raters` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `brand_id`, `category_id`, `price`, `total_sold`, `avg_rating`, `total_raters`, `created_at`, `updated_at`) VALUES
(4, 'Micro SD V-GeN Turbo 128GB 100MB/S Micro SD Memory Card VGEN - Non Adapter', 'PROMO HARGA KHUSUS HANYA 1 MINGGU, STOK TERBATAS.\nKartu Micro SDHC UHS-1 U1\n\nPersingkat waktu dengan kecepatan baca yang akan membuat kalian memiliki lebih banyak waktu untuk pekerjaan lain. Serta tak perlu khawatir untuk menunggu lama saat memindahkan gambar ataupun video Full HD kedalam kartu. Ambil gambar serta video Full HD lebih banyak serta mendengarkan musik menjadi lebih nyaman.\n\nSPECIFICATION\nCapacity : 128 GB\nDimension : 15 mm (L) x 11 mm (W) x 1.0 mm (H)\nSpeed Class : Class 10 UHS-1 Speed Class 1\nRead : Up to 100MB/detik\nWrite : Up to 48MB/detik\nTemperature Operational : -25C to +85C (Recommended)\nTemperatur Non Operational : -40C to +85C (Recommended)\nWarranty : Limited Lifetime Warranty (One to one replacement)\nFitur :\n- Samsung Flash TLC\n- Controller v3.0\n- Full HD 1080 ( 1980x1080 pixels )\n- RoHS ( bebas bahan kimia berbahaya )\n- Waterproof , Shockproof , Weatherproof , X-Rayproof\n\nRecomended for : Smartphone & Tablet Android, BB OS 10, Windows Phone, Action Camera.', 4, 4, 138000, 10000, 5, 150, '2025-08-01 21:12:13', '2025-08-01 21:18:50'),
(5, 'SanDisk microSDXC Ultra 128GB 100MB/s – No Adapter', 'SanDisk Ultra microSD Card - No Adapter\n\nClass 10 UHS-I\nSpeed up to 80MB/s (16GB) l 100 MB/s (32GB - 512GB)\nTanpa adapter\nCocok untuk smartphone dan tablet anda\ngaransi resmi 7 tahun Sandisk Indonesia\n\n\n\nPastikan device sudah sesuai dan support dengan tipe produk yg akan dicheckout.\nKapasitas yang terbaca di perangkat akan lebih sedikit dari pada yang tertera di kemasan, karena Gadget dan komputer memiliki cara membaca yang berbeda. Kapasitas yang hilang digunakan oleh sistem sebagai sistem penyimpanan sementara pada saat kita memindahkan data yang ada di komputer.\nKecepatan baca & tulis di atas didasarkan pada tes internal yang dilakukan dalam kondisi terkendali. Kecepatan sebenarnya bisa bervariasi tergantung kapasitas kartu dan device.\n\n\nSyarat klaim garansi:\n\nKemasan & stiker hologram harus ada\nkondisi barang masih dalam keadaan baik dan tidak cacat fisik (patah, retak, dan bengkok\nnota pembelian (bisa cetak dari marketplace) atau melampirkan nomor invoice pembelian\nbarang langsung ditukar baru (bila stok tersedia)\n\n\nMENGAPA LEBIH BAIK MEMBELI SANDISK GARANSI RESMI\n\n100% ORIGINAL\nKlaim garansi mudah, karena SanDisk Indonesia memiliki 2 distributor resmi yang sudah terkenal di dunia komputer/mobile/kamera dan didukung oleh SanDisk Indonesia\nPASTI ADA STIKER Garansi Distributor Resmi (Astrindo/Datascrip), bila tidak ada stiker dari salah satu distributor ini, DIPASTIKAN BUKAN GARANSI RESMI DAN TIDAK ADA JAMINAN KALAU ITU BARANG ASLI/ORIGINAL\n\n\nBUKAN GARANSI RESMI\n\nbisa original bisa juga palsu\ntidak memiliki stiker Garansi Distributor Resmi\nklaim garansi harus ke seller/merchant tempat anda beli (apakah saat anda klaim garansi, seller/merchant tersebut masih ada/aktif?)\n\n\nJadi kalau hanya beda harga sedikit, apakah anda mau mengambil resiko itu?\n\n\nCatatan :\n\nTidak menerima komplain (salah barang, cacat fisik dan hilang) jika tidak ada video unboxing.\nSebelum menyelesaikan pesanan pastikan produk sudah diterima dengan baik, karena ketika status pesanan sudah diterima dan ada kendala pada produk (hilang) tidak akan bisa komplain ke pihak marketplace.\nBarang yang sudah dibeli dan diterima, apabila ada kerusakan hanya dapat ditukar baru dan tidak bisa dikembalikan dananya (kecuali barang tersebut sedang kosong).\nTidak disarankan untuk pemakaian pada CCTV / DASHCAM', 5, 4, 165000, 10000, 4.9, 200, '2025-08-01 21:32:39', '2025-08-01 21:32:39'),
(6, 'EZVIZ MicroSD card 2TB 1TB 512GB 256GB 128GB 64GB 32GB Kartu Memori For CCTV/dengung/perekam mengemudi/Samrtphone - 1TB（EZVIZ）', '1 & Cocok untuk smartphone Android, tablet dan kamera MIL\n﻿\n﻿\n2 & Hingga 32GB dapat menyimpan lebih banyak jam video Full HD (2) | 1GB = 1.000.000.000 byte. 1TB = 1.000.000.000.000 byte Ruang penyimpanan pengguna sebenarnya relatif kecil. | (2) Dukungan video Full HD (1920x1080) mungkin berbeda-beda bergantung pada perangkat host, atribut file, dan faktor lainnya.\n﻿\n﻿\n3 & Tingkat transmisi hingga 100MB / dtk, yang memungkinkan Anda mentransfer hingga 1000 foto dalam satu menit | Kecepatan membaca hingga 100MB / dtk, dirancang dengan teknologi eksklusif, melampaui UHS-I 104MB / dtk, dan membutuhkan peralatan yang kompatibel Capai ini kecepatan. Kecepatan menulis lebih rendah. Menurut pengujian internal; tergantung pada faktor-faktor seperti perangkat host, antarmuka dan kondisi penggunaan, kinerja dapat berkurang. 1MB = 1.000.000 byte | (5) Menurut pengujian internal, ukuran file rata-rata yang menggunakan pembaca kartu USB 3.0 adalah 3,55MB (maksimum 3,7GB). Hasil Anda akan bervariasi berdasarkan perangkat host, atribut file, dan faktor lainnya.\n﻿\nKinerja 4 & A1 (1) Kinerja A1), Kinerja A1 adalah 1500 baca IOPS dan 500 tulis IOPS. Menurut pengujian internal. Hasil dapat bervariasi tergantung pada perangkat host, jenis aplikasi, dan faktor lainnya.\n﻿\n﻿\nKartu memori Micro SDXC / SDHC 64GB/128GB / 256 / 512GB\nKelas Kecepatan microSD: Class10\nTegangan catu daya: 2,7 ~ 3,6V (maksimum)\nStandar yang kompatibel: standar kartu memori microSD Ver.3.00 / Ver.2.00\nDimensi: 12.5.0mm (panjang) * 7.5mm (lebar) * 1.0mm (T)\nBerat: sekitar 8g\n \nHarap masukkan microSDXC dan dukung slot kartu microSDHC microSD untuk digunakan.\nMendukung spesifikasi antarmuka bus SD berkecepatan tinggi di UHS-I (*) yang baru. Hanya didukung oleh perangkat UHS-I yang digunakan dalam mode UHS-I. (sebagai berikut)\nSuhu -25 hingga 85 C, kelembapan relatif 30 hingga 80% RH (tanpa kondensasi)', 8, 4, 122000, 500, 4.5, 86, '2025-08-01 21:41:00', '2025-08-01 21:41:00'),
(7, 'MMC Memory Card HP Toshiba 128GB | 64GB | 32GB | 16GB | 8GB Memory Handphone Micro SD - 4 gb', 'MOHON DIBACA !!!\n\n- Produk OEM/KW\n- Dapat Menyimpan FIle Ringan.\n- Kapasitas TIDAK REAL\n- Kecepatan Transfer Data USB 2.0\n- Tersedia dalam berbagai kapasitas, 128GB, 64GB, 32GB, 16GB, 8GB, 4Gb\n- Pengiriman Cepat\n- Kemasan Barang Tersegel Pabrik TANPA GARANSI !!!\n- No Complain No Retur\n- MEMBELI = SETUJU\n\nWajib Video Unboxing dilanjut pengetesan.. tanpa Video Unboxing kami tidak melayani complain dengan alasan apapun !!', 6, 4, 17500, 750, 4.6, 225, '2025-08-01 21:44:25', '2025-08-01 21:44:25'),
(8, 'Samsung microSD EVO Plus UHS-I - microSDXC - 64GB / 128GB / 256GB / 512GB / 1TB - 128GB', 'HARAP MEMBUAT VIDEO UNBOXING LENGKAP SETELAH MENERIMA PESANAN, DAN MEMBUKA KEMASAN DENGAN HATI-HATI UNTUK MENGHINDARI KERUSAKAN PADA PRODUK.\n\n\nKetentuan Retur Produk:\n1. Berlaku jika produk yang diterima dalam kondisi rusak, tidak berfungsi, atau tidak sesuai pesanan.\n2. Produk dan kemasan harus utuh dan lengkap.\n3. Wajib menyertakan video unboxing lengkap, tanpa putus, dari awal pembukaan paket hingga kondisi produk terlihat jelas.\n4. Proses pengajuan silakan chat kami dengan menyertakan nomor pesanan, video kendala, dan penjelasan kendala.\n5. Retur tidak berlaku jika:\n5.a. Produk rusak karena kesalahan penggunaan.\n5.b. Tidak ada video unboxing.\n5.c. Melebihi batas waktu pengembalian.\n', 7, 4, 185000, 750, 5, 370, '2025-08-01 21:47:40', '2025-08-01 21:47:40'),
(9, 'Samsung Galaxy Buds2 Pro Bluetooth Wireless Earphone - Bora Purple', 'Tentang Bumilindo - Samsung Authorized\n1. Distributor dan retailer resmi Samsung Indonesia dengan 16 titik distribusi dan 14 SES (Samsung Experience Store) and SES-Partner\n2. Produk original, BNIB dan segel\n3. Garansi resmi Samsung Electronics Indonesia (SEIN)\n4. Pengiriman cepat dan terjamin asuransi\n\n\nSamsung Galaxy Buds2 Pro\n\n\nSpesifikasi:\n\n\n- Technology : \"24 Bit Hi-Fi Audio, Intelligent 360 Audio\"\n- Active Noise Canceling : Intelligent ANC\n- Ambient Sound : Supported\n- Speaker : Custom 2-way\n- Call Quality : 3 Mics (All High SNR Mic) + VPU + DNN + Personalized Beamforming\n- Voice Wake-up : Seamless AI (Bixby)\n- Capacity : 61mAh/515mAh\n- Play Time : 5/18Hr (ANC ON), 8/29Hr (ANC OFF)\n- Talk Time : 3.5/14Hr (ANC ON), 4/15Hr (ANC OFF)\n- Connectivity : BT 5.3 (LE audio ready)\n- Water Resistance : IPX7\n- Size/Weight : \"21.6 x 19.9 x 18.7 / 5.5g\"', 7, 5, 1349000, 100, 5, 44, '2025-08-01 21:57:25', '2025-08-01 21:57:25'),
(10, 'Lenovo Thinkplus LP1 TWS Earphone Earbud Bluetooth HiFi Stereo - Hitam', 'LN-EAR-LP1-BK/WH\n\nNotes :\nHarap pastikan pesanan sudah sesuai sebelum check out.\nProduk tidak dapat ditukar size / warna / model\nUntuk KLAIM PRODUK tidak lengkap harap sertakan video UNBOXING PAKET.\nSetelah barang sampai mohon dicek kelengkapan produk dan pastikan barang diterima dengan kondisi baik sebelum klik \"Pesanan Diterima\".\n\nTWS Earphone dengan kualitas suara stereo HiFi dan didukung dengan bluetooth 5.3 membuat pengalaman mendengarkan musik anda jadi lebih menyenangkan. Didukung oleh low latency sehingga mendengarkan lagu dan bermain game semakin minim delay. Dilengkapi dengan coil 13mm memberikan kualitas suara yang lebih transparan dan kuat.\nMasa pakai baterai yg lama, digunakan dengan kotak pengisian daya, hingga 5 jam masa pakai dan waktu pengisian 1,5 jam dengan input daya type C sehingga pengisian lebih optimal.\n\nSpesifikasi\nBluetooth : 5.3\nJarak : 8-10m\nSensitivity: 105dB+/-3dB\nBattery: 30mAh/230mAh\nCharging Time: 1,5 Jam\nInput : Type-C\nPlay Time : 5hours\n\nIsi paket:\n1* Thinkplus LP1\n\nGaransi: 12 Bulan (Cacat pabrik, langsung ganti baru. kerusakan akibat pengguna= garansi void)', 9, 5, 79000, 1000, 4.9, 556, '2025-08-01 22:01:57', '2025-08-01 22:03:13'),
(11, 'Xiaomi Redmi Buds 6 Play TWS - Bluetooth 5.4 - Black', 'Garansi resmi 1 tahun\n\n5 mode EQ Preset (standard, meningkatkan bass, meningkatkan suara, meningkatkan treble, dan meningkatkan volume) untuk suara penuh, bertenaga, dan menarik, kaya akan detail. Algoritma suara AI secara akurat membedakan antara suara manusia dan kebisingan sekitar, sehingga bahkan di lingkungan yang bising, secara efektif dapat mengurangi kebisingan sekitar. Nikmati masa pakai baterai hingga 7,5 jam dengan sekali pengisian daya dan hingga 36 jam saat dipasangkan dengan tempat pengisi daya, memungkinkan Anda menikmati musik yang luar biasa siang dan malam.\n\nSpesifikasi :\nWarna : Black/White\nRentang respons frekuensi : 20Hz~20KHz\nBerat Satu Earbud : 3.6g\nDimensi Satu Earbud : P 20.6 x L 14.5 x T 22 mm\nBerat casing pengisi daya : 32.8g\nDimensi Casing Pengisi Daya : P 53.9 x L 53.9 x T 27.4 mm\nTotal Berat : 40.0g\nKapasitas Baterai Earbuds : 57mAh\nKapsitas Baterai Casing Pengisi Daya : 600mAh\nPort Pengisian Daya : TYPE-C\nParameter Input Earbuds : 5V 170mA\nParameter Input Casing Pengisi Daya : 5V 800mA\nParameter Output Casing Pengisi Daya : 5V 340mA\n\nKetahanan baterai dengan sekali pengisian daya : 7.5 hours\nKetahanan baterai dengan Casing pengisi daya : 36 hours\nKoneksi Wireless : Bluetooth 5.4\nBluetooth protocols : Bluetooth Low Energy / HFP / A2DP / AVRCP\nJangkauan komunikasi : 10m (ruang terbuka bebas rintangan)\nSpeaker impedance : 16 Rated power 5 mw Maximum power 10 mw\n\nIsi Kemasan :\nRedmi Buds 6 Play 1\nCasing Pengisi Daya x 1\nPanduan Pengguna x1\nS ear cap x1\nL ear cap x1', 10, 5, 129000, 1000, 4.9, 672, '2025-08-01 22:11:44', '2025-08-01 22:11:44'),
(12, 'Xiaomi Redmi Buds 6 Pro | Desain triple-driver coaxial | Multilevel ANC 55 dB | Hi-Res Audio LDAC | Kontrol Sentuh Audio, Telepon,Volume [Official Store] - Space Black', 'Redmi Buds 6 Pro : Elevate every beat\n\nRedmi Buds 6 Pro menghadirkan pengalaman mendengarkan yang luar biasa dengan teknologi terbaru yang dirancang untuk para pecinta musik sejati.\nDidesain untuk kenyamanan sepanjang hari, Redmi Buds 6 Pro menghadirkan gaya modern dan fungsionalitas tinggi untuk melengkapi aktivitas Kamu.\nRedmi Buds 6 Pro adalah kombinasi sempurna antara teknologi audio canggih dan kenyamanan terbaik, menjadikannya pilihan ideal untuk kebutuhan audio Kamu.\n\nMemiliki audio resolusi tinggi bersertifikasi LDAC.\nRasakan kualitas audio resolusi tinggi yang membawa Kamu lebih dekat ke performa asli musik favorit, ideal untuk pengalaman mendengarkan premium. Didesain triple-driver coaxial memastikan suara yang jernih dan detail, memberikan pengalaman mendengarkan yang lebih kaya dan mendalam.\n\nFitur kontrol sentuh mempermudah pengaturan lagu, panggilan, dan volume, membuatnya nyaman dan praktis untuk digunakan sehari-hari.\nDengan performa baterai yang tahan lama dan konektivitas stabil, Redmi Buds 6 Pro adalah pilihan ideal untuk menunjang berbagai aktivitas, mulai dari mendengarkan musik hingga bekerja.\n\nPeredam Kebisingan Aktif Hingga 55 dB*\nDengan teknologi peredam kebisingan aktif yang cerdas, Redmi Buds 6 Pro memastikan kamu dapat fokus tanpa gangguan, dilengkapi penyesuaian multi-tingkat untuk kenyamanan optimal.\n\nReduksi Kebisingan Frekuensi Superluas Hingga 4 kHz*\nKemampuan meredam kebisingan dengan cakupan frekuensi superluas menciptakan suasana mendengarkan yang lebih tenang dan nyaman di berbagai situasi.\n\n*Fitur tertentu mungkin memerlukan perangkat kompatibel atau pengaturan tambahan.\nSpesifikasi\nWarna\nSpace Black\nGlacier White\n\nLavender Purple\nDimensi dan berat\nDimensi satu earbud\n30,6 mm*21,4 mm*24,5 mm\nDimensi casing pengisian daya\n61,05*48,28*25,17 mm\n\nBerat satu earbud : Sekitar 5,2 g\nBobot casing pengisian daya : Sekitar 36,1 g\nBerat total : Sekitar 46,5 g\n\nPengisian daya\nKapasitas baterai\nEarbud: 54 mAh\nCasing pengisian daya: 480 mAh\nPort pengisian daya\nTipe-C\nParameter input earbud\n5 V⎓160 mA MAKS\nParameter input casing pengisian daya\n5 V⎓700 mA MAKS\nParameter output casing pengisian daya\n5 V⎓320 mA MAKS\n\nKonektivitas nirkabel\nBluetooth 5.3\nProtokol Bluetooth\nBluetooth Low Energy/HFP/A2DP/AVRCP\nJangkauan komunikasi\n10 m (ruang terbuka tanpa penghalang)\n\nIsi Kemasan\nRedmi Buds 6 Pro x 1\nCasing pengisian daya x 1\nKabel pengisian daya Tipe-C ×1\nPanduan pengguna x1\nPenutup telinga ukuran S 2 pcs\nPenutup telinga ukuran L 2 pcs', 10, 5, 999000, 100, 4.9, 58, '2025-08-01 22:41:12', '2025-08-01 22:41:12'),
(13, 'Xiaomi Wireless Earbuds Bluetooth 5.2 Noise Reduction Low Latency Gaming Headsets With Microphone Compatibility For Android iOS', '', 10, 5, 398000, 1, 5, 1, '2025-08-01 22:59:00', '2025-08-01 22:59:00'),
(14, 'Original Xiaomi Bone Conduction Bluetooth Earphones Ear Earbuds Wireless Headphone With Mic Sports Hifi Headsets Game', '', 10, 5, 216000, 3, 0, 0, '2025-08-01 23:04:49', '2025-08-01 23:04:49'),
(15, 'Charger Original Xiaomi 33W Charger Kabel Handphone Type C Fast Charging Android', 'Description:\n\n● Flash charging tanpa Merusak Mesin HP Anda\n● Pengisian Daya dengan Teknologi intelligent protection, Untuk Menjamin Pengisian Daya Anda Cepat dan Aman serta Terproteksi\n● Multiple intelligent protection Technologi yg membuat perlindungan Ganda saat Pengisian Daya Perangkat Anda\n● Over-temperature protection Technologi yg membuat Perlindungan Temperatur berlebih saat pengisian Daya pada Perangkat Anda\n● Perlindungan Cell Baterai Perangkat Anda\n● Proteksi Petir\n● Perlindungan Arus daya berlebih\n● Perlindungan Arus pendek/Konsleting\n\nFeatures :\n\n● Fast charging\n● nyaman dan cepat\n● Tipis dan ringan\n● Tidak menyebabkan kerusakan pada baterai\n● Smart Compatible Charger\n● Tidak perlu khawatir, Berkat Built-in Smart Chip yg tertanam Mampu memberikan perlindungan ganda pada perangkat anda\n● Kompatibilitas cerdas Support pada perangkat Apple dan Android\n● Support pengisian daya pada perangkat USB seperti Android, Apple, dan komputer tablet\n\nxiaomi fast charger 33w original Turbo charge red type C cable mdy-11-ez for mi 9 10 9t pro Redmi Note 9 pro K40 30 poco x3 f3\nSpecifications :\n\nItem : turbo charger for xiaomi\nColor : White\nPlug : EU/US\nInput : 100-240VAC--50-60Hz 0.7A\nOutput : DC 5V 3A / 9V 3A / 12V 2.25A / 20V 1.35A / 11V 3A Max\n\n\n● 33W Compatible with : Xiaomi Mi 11X Pro/Mi 11X/Mi 11i/Mi 10S/Mi 10T Pro 5G/Mi 10T 5G/Poco X3 Pro/Poco F3/Poco X3 NFC/Poco X3/Poco X2/Poco M2 Pro/Poco F2 Pro/Xiaomi Pad 5/Redmi Note 9 Pro 5G/Redmi K30S/Redmi K30 Pro/Redmi K20 Pro/Redmi 10X Pro 5G/Redmi Note 9 Pro Max/Redmi K40/Redmi Note 10 Pro/Redmi Note 10\n● 30W Compatible with : Xiaomi Mi 10 5G/Mi Note 10/Mi Note 10 Pro/Mi CC9 Pro/Redmi K30 5G/Redmi K30 Pro/Redmi Note 9 Pro\n● 27W Compatible with : Xiaomi Mi 9/Mi 9T Pro/Redmi K30/Redmi K20 Pro/Black Shark 2/Black Shark 2 Pro and other support qc3.0 model phones\n\nPackage Included:\n\n- Kepala Charger Original Wiaomi 33W\n- Kabel Data Turbo Charge 6A', 10, 7, 28800, 500, 4.8, 1908, '2025-08-01 23:17:37', '2025-08-01 23:17:37'),
(16, 'WFYSK068 Casing Hand phone Cocok Untuk Redmi 10 11A 12 12C 13C 9A 9AT 9C NFC Note 10 10 Pro 10 Pro Max 11 Pro 12 Pro 9 Pro Max 9S Poco C55 C65 M2 Pro M6 Case Ponsel Lunak Dudukan', 'Dropship/Reseller/Wholesale are welcome !\nIkuti kami untuk info DISKON dan BARANG BARU !\nJAMINAN 100% puas !! Jika ada keluhan/kendala bisa hubungi kita kembali\nGARANSI KIRIM ULANG 100% jika barang yang diterima salah/rusak dengan SYARAT belum memberikan penilaian BURUK/BINTANG 1\n\nDeskripsi Produk :\nBahan : Soft Case\n\nTIPE HP :\nRedmi 10 4G\nRedmi 10 2021 4G\nRedmi 10 2022 4G\nRedmi 10A Sport 4G\nRedmi 11A\nRedmi 12 4G\nRedmi 12C\nRedmi 13C 4G\nRedmi 9A\nRedmi 9A CTIV\nRedmi 9A sports 4G\nRedmi 9AT\nRedmi 9C\nRedmi 9C NFC\nRedmi Note 10 5G\nRedmi Note 10 Lite 4G\nRedmi Note 10 Pro 4G\nRedmi Note 10 ProMax 4G\nRedmi Note 11 Pro 4G\nRedmi Note 11 Pro 5G\nRedmi Note 11 Pro+ 5G\nRedmi Note 11SE\nRedmi Note 12 4G\nRedmi Note 12 Pro 4G\nRedmi Note 9 Pro 4G\nRedmi Note 9 ProMax 4G\nRedmi Note 9S 4G\nXiaomi Poco C55 4G\nXiaomi Poco C65 4G\nXiaomi Poco M2 Pro 4G\nXiaomi Poco M6 5G\n\n1: Mohon input Nomor telp, dan alamat yang tepat untuk menghindari paket terlambat sampai atau tidak ketemu penerima nya\n2: Jika Anda perlu memesan bebera\npa item dengan warna dan model berbeda, cukup tambahkan ke keranjang belanja terlebih dahulu, lalu bayar di keranjang belanja.\n3: Karena terbatasnya jumlah SKU, tidak mungkin mencantumkan semua warna atau model. Jika Anda perlu memesan model atau warna lain, silakan hubungi layanan pelanggan online kami.\nTidak bisa di Pilih = Kosong\nProduk yang masih bisa di Pilih Variasi = Ready Stok langsung di order\nMenjamin kualitas produk, layanan, dan harga!\nKarena perbedaan pencahayaan dan pengaturan layar, warna produk ini mungkin sedikit berbeda dari gambar. Silakan lihat objek sebenarnya.', NULL, 8, 43680, 0, 0, 0, '2025-08-01 23:23:10', '2025-08-01 23:23:10'),
(17, 'Tempered Glass Bening Oval 0,3 mm Kaca Anti Gores Good Quality Grosir', 'READY TYPE SAMSUNG G313 A2 Core J1 J1 Ace J1 Mini J2 Pro J2 Prime J3 J3 2016 J4+ J5 J5 Prime J6+ J7 J710 J7 Core J7 Pro J7 Prime A01 A02 A02s A03 A03s A11 A12 A13 A20 A20s A22 4G A22 5G A21 A21s A23 A30 A30s A31 A32 4G A32 5g A50 A50s A51 A52 A52s A70 A70s A71 A72 M10s M11 M12 M20 M21 M30 M30s M52 M62 A14 A10 A10s A73 A54 A34 *OPPO a3s A5s A7 a83 a71 a39 F1s F5 F7 F9 F11 F11 Pro A5 2020 A9 2020 A12 A15 A15s A16 A31 A33 2020 A37 A52 A53 A54 4G A57 A59 A71 A72 A73 A74 A74 5G A91 A92 A93 A94 4G A95 A96 Reno 2 Reno 3 Pro Reno 4 Reno 4F Reno 5 Reno 5F Reno 5K Reno 6 Reno 7 Reno 8 4G A7 A33 2020 A17 A12 A76 A18 REALME Realme 3 Realme 3 pro Realme 5 Realme 5i Realme 5s Realme 5 Pro Realme 6 Realme 6 Pro Realme 7 Realme 7i Realme 8 Realme 8 5G Realme 8i Realme 8 Pro Realme 9 Realme 9i Realme 9 Pro Realme GT Neo 2 Realme X7 Pro C3 C11 C11 2021 C12 C15 C17 C20 C21 C21y C25 C25s C31 C35 Narzo Narzo 30a Narzo 50i Narzo 50a XIAOMI Redmi 3 Redmi 4a Redmi 4x Redmi 5 Redmi 5a Redmi 5+ Redmi 5x Redmi Note 5 Redmi Note 5 Pro Redmi 6 Redmi 6a Redmi 6x Redmi 6 Pro Redmi Note 6 Pro Redmi 7 Redmi 7a Redmi Note 7 Redmi 8 Redmi 8a Redmi Note 8 Redmi Note 8 Pro Redmi 9 Redmi 9a Redmi 9c Redmi 9T Redmi Note 9 Redmi Note 9 Pro Redmi 10 Redmi 10a Redmi 10c Redmi Note 10 Redmi Note 10s Redmi Note 10 Pro Redmi Note 11 Redmi Note 11 Pro Redmi S2 Poco X3 Poco X3 Pro Poco X3 GT Poco M3 Poco M3 Pro Poco M4 Pro Poco F3 Poco F3 GT Xiaomi 10T Pro VIVO Y01 Y11 Y12 Y12s Y15 Y17 y81 y83 Y20 Y20i Y20s Y21 Y21T Y21s Y30 Y30i Y50 Y50i Y51 Y53s Y71 DAN MASIH BANYAK YG LAINNYA', NULL, 9, 1200, 10000, 4.9, 86, '2025-08-01 23:26:41', '2025-08-01 23:26:41');

-- --------------------------------------------------------

--
-- Struktur dari tabel `product_photos`
--

CREATE TABLE `product_photos` (
  `id` int NOT NULL,
  `product_id` int NOT NULL,
  `photo_url` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `product_photos`
--

INSERT INTO `product_photos` (`id`, `product_id`, `photo_url`) VALUES
(1, 4, '/uploads/products/product_4_1754054330683_66i6w4ekl4o.webp'),
(2, 4, '/uploads/products/product_4_1754054330771_q5x70nvw13.webp'),
(3, 5, '/uploads/products/product_5_1754055159663_2ob95xjv85n.webp'),
(4, 5, '/uploads/products/product_5_1754055159753_4mdkoqobtoa.webp'),
(5, 6, '/uploads/products/product_6_1754055660460_e5yk0klbiem.webp'),
(6, 6, '/uploads/products/product_6_1754055660588_ty21i7acap.webp'),
(7, 6, '/uploads/products/product_6_1754055660709_xad8k6r9qpg.webp'),
(8, 6, '/uploads/products/product_6_1754055660840_2scnbjahitt.webp'),
(9, 7, '/uploads/products/product_7_1754055865679_ex032gm9poq.webp'),
(10, 7, '/uploads/products/product_7_1754055865788_8n9j8kx61ao.webp'),
(11, 7, '/uploads/products/product_7_1754055865905_ngfnitz0sh.webp'),
(12, 7, '/uploads/products/product_7_1754055866015_g4ihj9ncgp.webp'),
(13, 7, '/uploads/products/product_7_1754055866126_rce6qfb7ucr.webp'),
(14, 8, '/uploads/products/product_8_1754056060133_gggnz2xvbnn.webp'),
(15, 8, '/uploads/products/product_8_1754056060242_244tmq7034u.webp'),
(16, 8, '/uploads/products/product_8_1754056060384_5x25p53094f.webp'),
(17, 8, '/uploads/products/product_8_1754056060481_zfbk5aud1kc.webp'),
(18, 8, '/uploads/products/product_8_1754056060592_iz49egdrdn.webp'),
(19, 9, '/uploads/products/product_9_1754056645514_dd3pd7dxx1m.webp'),
(20, 9, '/uploads/products/product_9_1754056646012_3i978kg14ec.webp'),
(21, 9, '/uploads/products/product_9_1754056646139_kmjrkkx973d.webp'),
(22, 9, '/uploads/products/product_9_1754056646256_bld0u6l6o0p.webp'),
(23, 9, '/uploads/products/product_9_1754056646385_9k1pt1jokn4.webp'),
(24, 9, '/uploads/products/product_9_1754056646497_piwzqftouss.webp'),
(25, 9, '/uploads/products/product_9_1754056646581_od0d7zrbz38.webp'),
(26, 10, '/uploads/products/product_10_1754056917861_imdma1s4ha.webp'),
(27, 10, '/uploads/products/product_10_1754056917933_ymettpgrtis.webp'),
(28, 10, '/uploads/products/product_10_1754056918048_bosawfttpd5.webp'),
(29, 10, '/uploads/products/product_10_1754056918122_kbvr96bzxqc.webp'),
(30, 10, '/uploads/products/product_10_1754056918222_nrgxjrsm6rq.webp'),
(31, 10, '/uploads/products/product_10_1754056918315_1btkqno6tg4.webp'),
(32, 11, '/uploads/products/product_11_1754057504342_st4iu6hvt2q.webp'),
(33, 11, '/uploads/products/product_11_1754057504445_4dfjcidgsj6.webp'),
(34, 11, '/uploads/products/product_11_1754057504564_owyq71zo11q.webp'),
(35, 11, '/uploads/products/product_11_1754057504667_we6qpei93om.webp'),
(36, 11, '/uploads/products/product_11_1754057504755_2b04dtklm46.webp'),
(37, 11, '/uploads/products/product_11_1754057504854_2u75d2ostc5.webp'),
(38, 11, '/uploads/products/product_11_1754057504965_am2ac2508t9.webp'),
(39, 12, '/uploads/products/product_12_1754059272687_owbhk7g6bo.webp'),
(40, 12, '/uploads/products/product_12_1754059272875_or66wqukaf.webp'),
(41, 12, '/uploads/products/product_12_1754059273031_wv5s8osmkmj.webp'),
(42, 13, '/uploads/products/product_13_1754060340391_wk8d17smwut.webp'),
(43, 13, '/uploads/products/product_13_1754060340733_mbpjpv5xek.webp'),
(44, 14, '/uploads/products/product_14_1754060689658_78cim5qhr5.webp'),
(45, 14, '/uploads/products/product_14_1754060689868_9xtxu3um7an.webp'),
(46, 14, '/uploads/products/product_14_1754060690073_5oqtye159zs.webp'),
(47, 15, '/uploads/products/product_15_1754061457888_08ype15r3ea4.webp'),
(48, 15, '/uploads/products/product_15_1754061458101_v45f5avpzrd.webp'),
(49, 16, '/uploads/products/product_16_1754061790215_2disn1k40nw.webp'),
(50, 16, '/uploads/products/product_16_1754061790445_ndlrtgbget.webp'),
(51, 17, '/uploads/products/product_17_1754062001198_xauu2mmv06r.webp'),
(52, 17, '/uploads/products/product_17_1754062001409_q5f53a118cp.webp'),
(53, 17, '/uploads/products/product_17_1754062001695_rm2xl9kaj9d.webp');

-- --------------------------------------------------------

--
-- Struktur dari tabel `product_variants`
--

CREATE TABLE `product_variants` (
  `id` int NOT NULL,
  `product_id` int NOT NULL,
  `variant_name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `product_variants`
--

INSERT INTO `product_variants` (`id`, `product_id`, `variant_name`) VALUES
(9, 4, 'Non Adapter'),
(10, 4, 'With Adapter'),
(11, 6, '1TB'),
(12, 6, '32GB'),
(13, 6, '64GB'),
(14, 6, '128GB'),
(15, 6, '256GB'),
(16, 7, '8GB'),
(17, 7, '16GB'),
(18, 7, '32GB'),
(19, 7, '64GB'),
(20, 7, '128GB'),
(21, 8, '128GB'),
(22, 8, '256GB'),
(23, 8, '512GB'),
(24, 8, '1TB'),
(26, 10, 'Hitam'),
(27, 10, 'Putih'),
(28, 11, 'Black'),
(29, 11, 'White'),
(30, 11, 'Blue'),
(31, 11, 'Pink'),
(32, 12, 'Space Black'),
(33, 12, 'Glacier White'),
(34, 12, 'Lavender Purple');

-- --------------------------------------------------------

--
-- Struktur dari tabel `ratings`
--

CREATE TABLE `ratings` (
  `id` int NOT NULL,
  `product_id` int NOT NULL,
  `star` tinyint NOT NULL,
  `review_text` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `web_banners`
--

CREATE TABLE `web_banners` (
  `id` int NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `banner_image_url` text,
  `redirect_url` text,
  `active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `web_banners`
--

INSERT INTO `web_banners` (`id`, `title`, `banner_image_url`, `redirect_url`, `active`, `created_at`, `updated_at`) VALUES
(3, 'Utama', '/uploads/banners/banner_3_1_1754070142491_wfocqw602j.webp', NULL, 1, '2025-08-02 01:42:22', '2025-08-02 01:42:22'),
(7, 'banner 2', '/uploads/banners/banner_7_1_1754071769706_ckp630ikadp.webp', NULL, 1, '2025-08-02 02:08:36', '2025-08-02 02:09:29');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `idx_admins_last_login` (`last_login_at`),
  ADD KEY `idx_admins_last_login_ip` (`last_login_ip`);

--
-- Indeks untuk tabel `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indeks untuk tabel `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indeks untuk tabel `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_products_brand_id` (`brand_id`),
  ADD KEY `idx_products_category_id` (`category_id`),
  ADD KEY `idx_products_avg_rating` (`avg_rating`),
  ADD KEY `idx_products_created_at` (`created_at`);

--
-- Indeks untuk tabel `product_photos`
--
ALTER TABLE `product_photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product_photos_product_id` (`product_id`);

--
-- Indeks untuk tabel `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product_variants_product_id` (`product_id`);

--
-- Indeks untuk tabel `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ratings_product_id` (`product_id`),
  ADD KEY `idx_ratings_star` (`star`),
  ADD KEY `idx_ratings_created_at` (`created_at`);

--
-- Indeks untuk tabel `web_banners`
--
ALTER TABLE `web_banners`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_web_banners_active` (`active`),
  ADD KEY `idx_web_banners_updated_at` (`updated_at`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `brands`
--
ALTER TABLE `brands`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT untuk tabel `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT untuk tabel `products`
--
ALTER TABLE `products`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT untuk tabel `product_photos`
--
ALTER TABLE `product_photos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT untuk tabel `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT untuk tabel `ratings`
--
ALTER TABLE `ratings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `web_banners`
--
ALTER TABLE `web_banners`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `product_photos`
--
ALTER TABLE `product_photos`
  ADD CONSTRAINT `product_photos_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `product_variants`
--
ALTER TABLE `product_variants`
  ADD CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `ratings`
--
ALTER TABLE `ratings`
  ADD CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
