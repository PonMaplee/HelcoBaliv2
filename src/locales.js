/**
 * locales.js — Internationalisation (i18n) strings.
 *
 * Supported languages:
 *  - `en` — English (default)
 *  - `id` — Bahasa Indonesia
 *
 * Structure:
 *  nav          → Navbar link labels
 *  hero         → Hero section copy
 *  story        → Brand philosophy section
 *  outletsTitle → Retail-partner section header
 *  outlets      → Per-outlet descriptions (keyed by outlet `id`)
 *  contact      → B2B / corporate partnership section
 *  explore      → Product collection page (incl. product data)
 *  footer       → Copyright line
 *  footerSection→ 4-column footer labels
 *
 * To add a new language, duplicate any top-level key (e.g. `en`)
 * and translate every string value.
 */
export const locales = {
  en: {
    nav: {
      story: "Our Story",
      locations: "Locations",
      products: "Products",
      contact: "Contact",
      langToggle: "ID"
    },
    hero: {
      subtitle: "Crafted for the few",
      title1: "The Art of Brewing",
      title2: "Time.",
      desc: "Exclusive. Limited. We dedicate 18 hours per drop to preserve a perfect and unparalleled flavor profile.",
      btn: "Explore Flavors"
    },
    story: {
      title1: "The Patience",
      title2: "Behind the Drop.",
      p1: "In a world obsessed with speed, we chose the slower path. HelcoBali was born from a simple belief: true character cannot be rushed. Our journey revolves around an uncompromising 18-hour slow-steep process, carefully coaxing out the deepest, smoothest notes from our handpicked beans.",
      p2: "We refuse to conform to mass production. Every bottle is an intimate testament to the art of waiting, crafted strictly in weekly small-batches to ensure pristine freshness.",
      p3: "For this reason, we don't serve everyone. We proudly entrust our delicate craft exclusively to partner purveyors who share our reverence for high-end artisan coffee."
    },
    outletsTitle: {
      sub: "Retail Partners",
      title: "Find Us",
      desc: "Explore our exclusive partners to find the freshest cold brew at your nearest location."
    },
    outlets: {
      1: "Find our complete Cold Brew collection in the premium beverage aisle of Bintang Supermarket.",
      2: "Enjoy our cold brew right away while relaxing in the warm ambiance of Uncle Joe.",
      3: "Exclusively available at Bali International Hospital."
    },
    mapsBtn: "See on Maps",
    mapsBtnSingle: "Maps ",
    contact: {
      title: "Corporate & B2B Partnerships",
      desc: "Provide premium servings for your corporate pantry, hospitality, or private events. We are ready to serve exclusive supplies with special offers.",
      btn: "Contact Supply Team"
    },
    explore: {
      title: "Our Collection",
      subtitle: "The Signature Series",
      desc: "Discover our limited production cold brews, meticulously steeped to perfection. Each bottle carries a distinct profile, tailored for those who appreciate the true essence of artisan coffee.",
      products: [
        {
          id: 'plaga',
          db_id: 2,
          name: "La Plaga Coffee",
          image250: "/products_real/plaga-250ml.png",
          image500: "/products_real/plaga-500ml.png",
          roast: "Medium Dark",
          origin: "Plaga Highlands",
          notes: "Dark Cherry, Oak, Subtle Wine, Mild Spice",
          desc: "A perfectly balanced symphony. The medium indicator level provides a rich Arabica and Robusta base, beautifully elevated by the wine-like nuances distinctly gifted by the Liberica beans."
        },
        {
          id: 'kintamani',
          db_id: 1,
          name: "La Kintamani Coffee",
          image250: "/products_real/kintamani-250ml.png",
          image500: "/products_real/kintamani-500ml.png",
          roast: "Dark",
          origin: "Kintamani",
          notes: "Intense Woody, Roasted Nuts, Bold & Heavy",
          desc: "Bold and unapologetic. With the highest indicator level, this blend pushes the limits of intensity and deep bitterness, heavily spotlighting the robust core base over the subtle Liberica hints."
        },
        {
          id: 'pupuan',
          db_id: 3,
          name: "La Pupuan Coffee",
          image250: "/products_real/pupuan-250ml.png",
          image500: "/products_real/pupuan-500ml.png",
          roast: "Medium",
          origin: "Pupuan",
          notes: "Fermented Wine, Jackfruit, Wild Berries",
          desc: "Our most vibrant blend featuring our strongest Liberica presence. The lowest indicator level translates to an exceptionally complex, wine-like fruitiness with a smooth, bright finish."
        }
      ],
      labels: {
        notes: "Tasting Notes",
        origin: "Origin",
        orderBtn: "Find at Partners",
        back: "Back to Home"
      }
    },
    footer: "HelcoBali Artisan Cold Brew. Bali, Indonesia.",
    footerSection: {
      tagline: "Cold Brew Artisan · Bali",
      desc: "Handcrafted cold brew from the highlands of Bali. Three origins. 18 hours. Exclusively distributed.",
      navigate: "Navigate",
      products: "Products",
      followUs: "Follow Us"
    }
  },
  id: {
    nav: {
      story: "Cerita Kami",
      locations: "Lokasi",
      products: "Produk",
      contact: "Kontak",
      langToggle: "EN"
    },
    hero: {
      subtitle: "Crafted for the few",
      title1: "Seni Menyeduh",
      title2: "Waktu.",
      desc: "Eksklusif. Terbatas. Kami mendedikasikan 18 jam untuk setiap tetesnya demi menjaga profil rasa yang sempurna dan tak tertandingi.",
      btn: "Eksplorasi Rasa"
    },
    story: {
      title1: "Kesabaran",
      title2: "Di Balik Setiap Tetes.",
      p1: "Di dunia yang terobsesi dengan kecepatan, kami memilih jalan yang lebih lambat. HelcoBali lahir dari keyakinan sederhana: karakter sejati tidak dapat diburu-buru. Perjalanan kami berpusat pada proses penyeduhan perlahan selama 18 jam tanpa kompromi, mengekstrak profil rasa terdalam dan terhalus dari biji kopi pilihan kami.",
      p2: "Kami menolak untuk memproduksi secara massal. Setiap botol adalah bukti nyata dari seni menunggu, diseduh secara ketat dalam jumlah kecil setiap minggunya untuk memastikan kesegaran yang sempurna.",
      p3: "Oleh karena itu, kami tidak melayani semua orang. Kami mempercayakan mahakarya ini secara eksklusif hanya kepada peritel mitra yang memiliki penghargaan yang sama terhadap standar tinggi sebuah kopi artisan."
    },
    outletsTitle: {
      sub: "Mitra Ritel",
      title: "Temukan Kami",
      desc: "Jelajahi mitra eksklusif kami dan dapatkan kesegaran cold brew di lokasi terdekat Anda."
    },
    outlets: {
      1: "Temukan koleksi lengkap Cold Brew kami di lorong minuman premium Bintang Supermarket.",
      2: "Nikmati cold brew kami langsung sambil bersantai di suasana hangat Uncle Joe.",
      3: "Tersedia secara eksklusif di Bali International Hospital."
    },
    mapsBtn: "Lihat di Maps",
    mapsBtnSingle: "Maps ",
    contact: {
      title: "Kemitraan Korporat & B2B",
      desc: "Hadirkan sajian premium untuk pantry perusahaan, hospitality, atau acara privat Anda. Kami siap melayani suplai eksklusif dengan penawaran khusus.",
      btn: "Hubungi Tim Suplai"
    },
    explore: {
      title: "Koleksi Kami",
      subtitle: "Seri Signature",
      desc: "Temukan cold brew produksi terbatas kami, diseduh secara perlahan menuju kesempurnaan. Setiap botol membawa profil rasa yang khas, dirancang khusus bagi Anda yang menghargai esensi sejati dari kopi artisan.",
      products: [
        {
          id: 'plaga',
          db_id: 2,
          name: "La Plaga Coffee",
          image250: "/products_real/plaga-250ml.png",
          image500: "/products_real/plaga-500ml.png",
          roast: "Medium Dark",
          origin: "Dataran Tinggi Plaga",
          notes: "Ceri Hitam, Kayu Oak, Hint Anggur (Wine), Rempah Ringan",
          desc: "Sebuah harmoni yang sangat seimbang. Tingkat indikator menengah memberikan dasar Arabika dan Robusta yang kaya, terangkat sempurna oleh nuansa anggur (wine) eksotis dari biji Liberika."
        },
        {
          id: 'kintamani',
          db_id: 1,
          name: "La Kintamani Coffee",
          image250: "/products_real/kintamani-250ml.png",
          image500: "/products_real/kintamani-500ml.png",
          roast: "Dark",
          origin: "Kintamani",
          notes: "Aroma Kayu Kuat, Kacang Panggang, Sangat Pahit",
          desc: "Sangat berani dan intens. Dengan tingkat indikator kepahitan tertinggi, kopi ini menembus batas intensitas, menonjolkan kekokohan dasar paduan Arabika dan Robusta ketimbang kehalusan Liberika."
        },
        {
          id: 'pupuan',
          db_id: 3,
          name: "La Pupuan Coffee",
          image250: "/products_real/pupuan-250ml.png",
          image500: "/products_real/pupuan-500ml.png",
          roast: "Medium",
          origin: "Pupuan",
          notes: "Anggur Fermentasi (Wine), Nangka, Buah Liar",
          desc: "Paduan paling eksotis dengan karakter wine dari Liberika yang amat seksi. Tingkat indikator minimal menghasilkan profil rasa buah fermentasi yang sangat kompleks dan mendalam."
        }
      ],
      labels: {
        notes: "Profil Rasa",
        origin: "Asal",
        orderBtn: "Temukan di Mitra",
        back: "Kembali ke Beranda"
      }
    },
    footer: "HelcoBali Artisan Cold Brew. Bali, Indonesia.",
    footerSection: {
      tagline: "Cold Brew Artisan · Bali",
      desc: "Kopi cold brew buatan tangan dari dataran tinggi Bali. Tiga asal. 18 jam. Distribusi eksklusif.",
      navigate: "Navigasi",
      products: "Produk",
      followUs: "Ikuti Kami"
    }
  }
};
