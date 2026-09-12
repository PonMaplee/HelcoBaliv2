# UI Clone / Design Spec: Helco Bali (Artisan Cold Brew Web Application)

Spesifikasi desain dan analisis UI/UX komprehensif untuk aplikasi web **Helco Bali**, mencakup design tokens, sistem tipografi, layout responsif, rincian komponen per modul, serta interaktivitas dan state transisi.

---

## 1. Global Variables (Design Tokens)

Seluruh elemen dasar yang digunakan berulang kali di CSS dan Tailwind CSS v4 (`src/index.css` & `@theme`).

### Colors

| Token Role | Hex / Value | Nama / Utilitas Tailwind | Deskripsi & Letak Penggunaan |
| :--- | :--- | :--- | :--- |
| **Primary Accent** | `#D4AF37` | `--color-amber-500` / `text-amber-500` | **Artisan Gold**: Aksen utama brand. Digunakan pada logo navbar, badge "18 Hours", border tombol CTA utama, teks sorotan, drop caps, dan active tab. |
| **Secondary Accent** | `#C5A017` | `--color-amber-600` / `text-amber-600` | **Deep Amber Gold**: Warna hover state tombol primer, active ring focus, dan gradien aksen sekunder. |
| **Background (Base)** | `#050505` | `bg-[#050505]` / `body` background | **Pitch Black**: Kanvas utama seluruh halaman untuk membangun atmosfer *dark luxury*. |
| **Background (Surface/Alt)**| `#080808` | `bg-[#080808]` | **Deep Charcoal**: Latar belakang kartu kontainer sekunder (Story container, Outlets slider, B2B CTA card). |
| **Background (Card/Panel)**| `#0A0A0A` | `bg-[#0a0a0a]` | **Obsidian**: Kartu produk di halaman Explore, outlet list cards, floating information pills. |
| **Navbar Glass Surface** | `rgba(0,0,0,0.8)` | `bg-black/80 backdrop-blur-xl` | Efek kaca buram (glassmorphism) pada fixed navigation header. |
| **Text (Light / Heading)** | `#FFFFFF` | `text-white` | **Pure White**: Judul utama `H1`, judul section `H2`, nama produk botol, angka stat utama. |
| **Text (Sub-heading)** | `#E7E5E4` | `text-stone-200` | Subtitle narasi filosofi, lead paragraph di Hero, kutipan editorial. |
| **Text (Body Text)** | `#A8A29E` | `text-stone-400` | Teks paragraf umum, deskripsi produk cold brew, catatan rasa (tasting notes). |
| **Text (Muted / Labels)** | `#78716C` | `text-stone-500` | Label metadata teknis, copyright footer, ikon non-aktif, ukuran ml sekunder. |
| **Borders & Dividers** | `rgba(255,255,255,0.05)` | `border-white/5` s/d `border-white/10` | Garis batas tipis (hairline borders) pada navbar, separator section, dan kartu. |
| **Border Accent** | `rgba(212,175,55,0.4)` | `border-amber-500/40` | Border outline pada tombol CTA gold dan kartu sorotan aktif. |

### Typography

| Category | Family | Weights | Utilitas Tailwind | Letak Penggunaan |
| :--- | :--- | :--- | :--- | :--- |
| **Heading Font** | `Playfair Display`, serif | 400 (Regular), 400i (Italic), 500, 600, 700 (Bold) | `font-serif` | Brand Logo ("HelcoBali"), Judul Utama H1 Hero, Judul Section H2, Pull Quotes, Drop Caps, Stat Numbers. Weight Italic digunakan khusus untuk kata puitis/aksen (*Liberika*, *Craft*, *Elegance*). |
| **Body Font** | `Inter`, sans-serif | 300 (Light), 400 (Regular), 500 (Medium), 600 (Semi-bold) | `font-sans` | Teks body paragraf, menu navigasi, subtitle chips, tombol aksi, badge info, footer links. Dominan menggunakan `font-light` (300) untuk kesan elegan dan lapang. |
| **Base Size** | `16px` (`1rem`) | 400 (Regular) | `text-base` | Ukuran dasar teks root dokumen. |

#### Skala Tipografi & Letter-Spacing Khusus
* **Hero Headline (H1):** `text-5xl md:text-7xl lg:text-8xl font-serif tracking-tight leading-none`
* **Section Title (H2):** `text-3xl md:text-5xl font-serif tracking-normal leading-tight`
* **Eyebrow / Subtitle Chip:** `text-[10px] md:text-xs uppercase tracking-[0.3em] md:tracking-[0.4em] font-semibold text-amber-500`
* **Editorial Drop Cap:** `first-letter:text-5xl first-letter:font-serif first-letter:text-amber-500 first-letter:float-left first-letter:mr-3`

---

## 2. Layout & Breakpoints

Standar breakpoint responsif sistem antarmuka Helco Bali mengikuti ketentuan Tailwind CSS:

* **Mobile:** `< 640px` (`sm`)
  * Layout kolom tunggal (*single-column stack*).
  * Menu navigasi atas beralih ke hamburger icon dan memicu drawer overlay *full-screen* (`MobileMenu.jsx`).
  * Hero title disesuaikan ke `text-5xl` dengan padding horizontal rapat (`px-6`).
* **Tablet:** `640px - 1024px` (`md` hingga `lg`)
  * Transisi ke grid 2 kolom pada section filosofi dan grid fitur.
  * Navigasi desktop mulai aktif (`hidden md:flex`) dengan padding horizontal `px-8 md:px-12`.
  * Hero title meningkat ke `text-7xl`.
* **Desktop:** `> 1024px` (`lg`, `xl`, `2xl`)
  * Layout editorial 12-kolom asimetris pada Story section.
  * Tampilan split bolak-balik (*alternating zig-zag* `lg:flex-row` dan `lg:flex-row-reverse`) pada kartu varian produk di halaman Explore.
  * Carousel kartu outlet menampilkan tampilan horizontal penuh.
  * Hero title mencapai skala maksimal `text-8xl`.
* **Container Max-Width:**
  * **Standard Container:** `max-w-7xl` (`1280px`) — digunakan sebagai batas container pembungkus utama halaman (`mx-auto px-6 md:px-12`).
  * **Reading / Narrative Container:** `max-w-4xl` (`896px`) — untuk Hero content & B2B partnership card agar fokus membaca tetap optimal.
  * **Editorial Story Container:** `max-w-6xl` (`1152px`) — untuk keseimbangan rasio gambar dan teks narasi.

---

## 3. Component Breakdown

Daftar perincian komponen antarmuka yang terstruktur dan modular:

- [x] **Navbar (`src/components/Navbar.jsx` & `MobileMenu.jsx`):**
  * Posisi *fixed top* dengan latar `bg-black/80 backdrop-blur-xl border-b border-white/5`.
  * Sisi Kiri: Brand typography "HelcoBali" dengan font Playfair Display emas, micro-hover scale `1.05`.
  * Sisi Kanan (Desktop): Navigasi jangkar (`#story`, `/explore`, `#outlets`, `#contact`) dengan tracking lebar `[0.2em]`.
  * Language Switcher: Pill button toggle bilingual (EN ↔ ID) dengan ikon `Globe` dari Lucide.
  * Mobile Navigation: Hamburger menu trigger (`Menu`) yang membuka layar penuh transparan dengan stagger animasi link (`MobileMenu.jsx`).

- [x] **Hero Section (`src/pages/Home.jsx`):**
  * Tampilan *full-viewport height* (`h-screen`) dengan gambar latar cold brew gelap (`/hero.png`).
  * Ambient linear overlay: `bg-linear-to-b from-[#050505]/30 via-[#050505]/60 to-[#050505]`.
  * Opening visual motion: Animasi kamera masuk lambat (*slow zoom-in entrance* `scale: 1.15 → 1` selama 15 detik).
  * Subtitle eyebrow: Diapit oleh sepasang garis hairline emas (`h-px w-12 bg-amber-500/50`).
  * Judul Utama (H1): Editorial Playfair Display kontras tinggi dengan aksen italic gold.
  * CTA Buttons Cluster:
    * Primary CTA: Tombol border gold bercahaya ("Explore Collection" / menuju `/explore`).
    * Secondary Ghost CTA: Tombol transparan bergaris tipis ("Our Philosophy" / scroll halus ke `#story`).

- [x] **Story & Brand Philosophy Section (`src/pages/Home.jsx`):**
  * Tata letak asimetris editorial 12 kolom (`grid grid-cols-1 lg:grid-cols-12`).
  * Sisi Kiri (Visual Frame): Foto artisan beresolusi tinggi dengan vignette blend ke background gelap, dilengkapi kartu stat apung "18 Hours Cold Drip" yang bergerak mengapung perlahan (`floating` variant).
  * Sisi Kanan (Narasi Filosofi): Paragraf magazine bergaya *drop cap* emas, kutipan terkemuka (*pull-quote*) dengan tanda petik dekoratif berukuran besar (`text-6xl text-amber-500/20`), serta grid micro-origins 3 biji kopi pilihan (Arabika Kintamani, Robusta Pupuan, Liberika Bali Barat).

- [x] **Retail Outlets Carousel Section (`src/pages/Home.jsx`):**
  * Showcase kafe & restoran mitra terkemuka di Bali yang menyajikan Helco Bali.
  * Auto-playing slider interval (5000ms) dengan tombol navigasi manual panah (`ChevronLeft`, `ChevronRight`).
  * Kartu Outlet: Gambar kafe atmosferik, tag lokasi spesifik dengan ikon `MapPin`, deskripsi singkat, dan pagination dots interaktif.

- [x] **B2B & Partnership Call-to-Action Section (`src/pages/Home.jsx`):**
  * Kartu kontainer obsidian mewah (`bg-[#080808] border border-white/5 rounded-3xl p-8 md:p-16`).
  * Efek pendaran latar belakang napas emas (*ambient glow breathing disc*).
  * Salinan undangan kemitraan khusus pasokan Horeca (Hotel, Restaurant, Cafe).
  * Tombol aksi langsung WhatsApp Business API (`WHATSAPP_CTA`) dengan ikon telepon, border emas, dan hover elevation.

- [x] **Product Showcase Catalog (`src/pages/Explore.jsx`):**
  * Header katalog bernuansa galeri eksklusif dengan filter deskriptif.
  * Kartu Produk Zig-Zag: Susunan visual bergantian kiri-kanan (`lg:flex-row` dan `lg:flex-row-reverse`) untuk setiap varian:
    1. *La Plaga* (Signature Blend)
    2. *La Kintamani* (Single Origin Arabica)
    3. *La Pupuan* (Artisan Robusta)
  * Interactive Size Selector: Toggle switch taktil (`250 ml` vs `500 ml`) yang secara instan menukar foto botol produk dan detail takaran.
  * Tasting Notes Pills: Tag rasa aromatik (misal: *Jackfruit, Dark Chocolate, Brown Sugar, Citrus Flora*).
  * Metadata Grid: Origin altitude, roast profile, dan rekomendasi penyajian.
  * Tombol direct order terhubung ke pemesanan batch segar.

- [x] **Footer (`src/components/Footer.jsx`):**
  * Tata letak 4 kolom terstruktur:
    1. *Brand Identity*: Logo, filosofi seduh lambat Bali, dan badge legal UMKM.
    2. *Quick Links*: Navigasi internal ke Story, Philosophy, dan Outlets.
    3. *Products*: Tautan langsung ke varian botol 250ml & 500ml di Explore.
    4. *Follow Us*: Daftar kanal media sosial (Instagram, WhatsApp) lengkap dengan ikon kustom (`ICON_MAP`).
  * Baris bawah: Copyright, hak cipta terlindungi, dan deretan tautan sosial media mini.

- [x] **SEO & Metadata Architecture (`src/components/SEO.jsx`):**
  * Meta tags dinamis per halaman (Title, Meta Description, Canonical URL).
  * OpenGraph image & Twitter Card preview untuk kemudahan share media sosial.
  * JSON-LD Structured Data Schema (`Beverage` / `LocalBusiness`) untuk optimasi mesin pencari Google.

---

## 4. Interactive Elements & States

Spesifikasi efek mikro, transisi visual, dan animasi antarmuka:

### Hover States
* **Navigation Links:**
  * Kelas: `hover:text-amber-500 hover:-translate-y-0.5 transition-all duration-300`
  * Efek: Warna teks beralih dari abu-abu stone ke emas artisan disertai pergeseran naik halus 2px.
* **Primary Gold CTA Buttons:**
  * Keadaan Normal: `border border-amber-500/40 bg-transparent text-amber-500 shadow-[0_0_20px_rgba(212,175,55,0.15)]`
  * Keadaan Hover: `hover:bg-amber-500 hover:text-black hover:shadow-[0_0_35px_rgba(212,175,55,0.4)] hover:scale-[1.02]`
  * Transisi: `transition-all duration-300 ease-out`
* **Secondary Ghost Buttons:**
  * Keadaan Normal: `border border-white/10 text-stone-300 bg-white/5`
  * Keadaan Hover: `hover:border-amber-500/60 hover:text-amber-500 hover:bg-white/10`
* **Social Icon Badges:**
  * Lingkaran ikon: `border border-stone-800 group-hover:border-amber-500/40 group-hover:bg-amber-500/5 group-hover:text-amber-500 transition-all duration-300`
* **Product Size Toggle Pills:**
  * Inactive State: `border border-stone-800 text-stone-500 hover:border-stone-700 hover:text-stone-300`
  * Active State: `border-amber-500 bg-amber-500/10 text-amber-500 shadow-[0_0_15px_rgba(212,175,55,0.2)]`
* **Carousel Navigation Arrows:**
  * `border border-white/10 text-stone-400 hover:border-amber-500 hover:text-amber-500 hover:bg-amber-500/10 transition-all duration-200`

### Transitions & Animation Tokens (Framer Motion)
Seluruh animasi dikontrol melalui konfigurasi tersentralisasi di `src/lib/animations.js`:

| Token / Variant | Motion Config | Durasi & Easing | Peruntukan |
| :--- | :--- | :--- | :--- |
| **`fadeUp`** | `y: 50` → `y: 0`, `opacity: 0 → 1` | `duration: 1.0s`, `ease: [0.25, 0.1, 0.25, 1]` | Kemunculan judul seksi, kartu varian produk, dan teks deskripsi saat masuk viewport. |
| **`staggerContainer`**| Orchestrated children reveal | `staggerChildren: 0.2s` | Pengurutan pemunculan subtitle, headline, dan cluster tombol pada Hero. |
| **`floating`** | `y: [0, -12, 0]` | `duration: 4.0s`, `repeat: Infinity`, `ease: easeInOut` | Badge informasi melayang ("18 Hours Drip") di atas visual fotografi. |
| **`glowBreathing`** | `scale: [1, 1.15, 1]`, `opacity: [0.6, 1, 0.6]` | `duration: 6.0s`, `repeat: Infinity`, `ease: easeInOut` | Pendaran cahaya radial emas di balik section B2B dan Story. |
| **`heroZoom`** | `scale: 1.15` → `scale: 1.0` | `duration: 15s`, `ease: easeOut` | Efek pembuka cinematic kamera mundur lambat pada gambar hero latar. |

---

## 5. Architectural & Implementation Details

* **Framework Core:** React 19 + Vite 6
* **Styling Engine:** Tailwind CSS v4 dengan konfigurasi token kustom di `@theme` (`src/index.css`)
* **Motion Engine:** Framer Motion (`framer-motion`)
* **Icons:** Lucide React (`lucide-react`)
* **Routing & Anchors:** React Router v7 (`react-router-dom`) dikombinasikan dengan kustom hash smooth scrolling handler (`NavHashLink.jsx`)
* **Multi-Language Support (i18n):** Modul lokalisasi reaktif client-side (`src/locales.js`) dengan dukungan Bahasa Indonesia (ID) & English (EN).
