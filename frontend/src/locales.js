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
      login: "Sign In",
      signup: "Become a Partner",
      langToggle: "ID"
    },
    auth: {
      loginTitle: "Gerai Sign In",
      loginDesc: "Sign in with your registered email and password to open your gerai dashboard.",
      signupTitle: "Register Your Gerai",
      signupDesc: "Join as a HelcoBali partner. Your gerai will be reviewed by our admin before activation.",
      name: "Full name",
      email: "Email",
      password: "Password",
      storeName: "Gerai name",
      storeLocation: "Gerai location",
      loginBtn: "Sign In",
      signupBtn: "Register Gerai",
      toSignup: "No account yet? Register your gerai",
      toLogin: "Already registered? Sign in",
      backHome: "Back to Home",
      successSignup: "Registration received. Please sign in and wait for admin approval.",
      adminDemo: "Admin demo — email: admin@helcobali.id, password: admin123",
      autofillAdmin: "Fill admin credentials",
      storeNamePh: "e.g. AnggaPuspa.dev",
      storeLocationPh: "e.g. Denpasar"
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
      btn: "Contact Supply Team",
      loginBtn: "Gerai Sign In",
      signupBtn: "Register Your Gerai"
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
      login: "Masuk",
      signup: "Jadi Mitra",
      langToggle: "EN"
    },
    auth: {
      loginTitle: "Masuk Gerai",
      loginDesc: "Masuk dengan email dan kata sandi yang terdaftar untuk membuka dashboard gerai Anda.",
      signupTitle: "Daftarkan Gerai Anda",
      signupDesc: "Bergabung sebagai mitra HelcoBali. Gerai Anda akan ditinjau admin sebelum diaktifkan.",
      name: "Nama lengkap",
      email: "Email",
      password: "Kata sandi",
      storeName: "Nama gerai",
      storeLocation: "Lokasi gerai",
      loginBtn: "Masuk",
      signupBtn: "Daftarkan Gerai",
      toSignup: "Belum punya akun? Daftarkan gerai Anda",
      toLogin: "Sudah terdaftar? Masuk",
      backHome: "Kembali ke Beranda",
      successSignup: "Pendaftaran diterima. Silakan masuk dan tunggu persetujuan admin.",
      adminDemo: "Demo admin — email: admin@helcobali.id, password: admin123",
      autofillAdmin: "Isi kredensial admin",
      storeNamePh: "cth. AnggaPuspa.dev",
      storeLocationPh: "cth. Denpasar"
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
      btn: "Hubungi Tim Suplai",
      loginBtn: "Masuk Gerai",
      signupBtn: "Daftarkan Gerai Anda"
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

export const dashboardLocales = {
  id: {
    localMarker: "Data lokal",
    logout: "Keluar",
    helloStore: "Gerai",
    needLoginTitle: "Masuk terlebih dahulu",
    needLoginDetail: "Dashboard ini khusus akun terdaftar. Masuk dengan akun Anda atau daftarkan gerai Anda.",
    waitingTitle: "Menunggu persetujuan admin",
    waitingDetail: "Pendaftaran gerai Anda sedang ditinjau. Halaman ini akan terbuka otomatis setelah admin menyetujui. Biarkan halaman ini terbuka atau masuk lagi nanti.",
    waitingRejectedTitle: "Pendaftaran ditolak",
    waitingRejectedDetail: "Pendaftaran gerai Anda ditolak admin. Hubungi tim HelcoBali untuk informasi lebih lanjut.",
    recheck: "Cek ulang",
    nav: {
      ringkasan: "Ringkasan",
      stok: "Stok & kedaluwarsa",
      restok: "Permintaan restok",
      produksi: "Produksi & pengiriman",
      penjualan: "Penjualan & retur",
      master: "Gerai & produk",
      order: "Pesan Stok",
      shift: "Tutup Shift"
    },
    overline: { admin: "Konsinyasi / Admin", staff: "Kemitraan / Staf gerai", order: "Pemesanan / Staf gerai", shift: "Laporan / Staf gerai" },
    subtitle: {
      default: "Catatan pada perangkat ini. Bukan data dari server.",
      order: "Pilih produk, atur jumlah, bayar di muka. Pesanan diteruskan ke admin untuk diproduksi dan diantar.",
      shift: "Catat produk terjual dan kas aktual. Sistem menghitung ekspektasi dan selisih per gerai."
    },
    searchStock: "Cari stok, gerai atau batch",
    searchOrder: "Cari produk untuk dipesan (mis. Kintamani)",
    newTransaction: "Transaksi baru",
    catalog: "Katalog",
    products: "produk",
    add: "Tambah",
    stock: "Stok",
    cart: "Keranjang",
    clear: "Kosongkan",
    customerNote: "Catatan / PIC (opsional)",
    customerPh: "Nama / Walk-in",
    emptyCart: "Keranjang kosong. Klik produk di katalog.",
    subtotal: "Subtotal",
    discount: "Diskon (Rp)",
    tax: "Pajak 11%",
    total: "Total",
    payMethod: "Metode bayar",
    received: "Uang dibayar (Rp)",
    change: "Kembalian",
    placeOrder: "Pesan & Bayar",
    printReceipt: "Cetak struk",
    orderReceipt: "Struk Pesanan",
    pendingApproval: "Menunggu persetujuan admin",
    orderRecorded: "Pesanan diteruskan ke admin untuk diproduksi.",
    sidebarB2B: "Pesanan staf diteruskan ke admin, diproduksi, lalu diantar ke gerai.",
    backToShop: "Kembali ke toko",
    savedLocal: "Catatan tersimpan di browser ini, tidak tersinkron ke server.",
    footerDefault: "HelcoBali · Dashboard kemitraan lokal",
    footerOrder: "HelcoBali · Pesan Stok — pesanan B2B diteruskan ke admin.",
    storesPending: "Menunggu persetujuan",
    storesActive: "Gerai aktif",
    storesRejected: "Ditolak",
    approveStore: "Setujui Gerai",
    reject: "Tolak",
    approveProduce: "Setujui & Produksi",
    markReady: "Tandai siap",
    ship: "Kirim ke gerai",
    receive: "Terima kiriman",
    batchExpiry: "Kedaluwarsa batch",
    shipped: "Terkirim",
    readyToSell: "Siap jual",
    retur: "Retur",
    sold: "Terjual",
    expectedCash: "Kas ekspektasi",
    actualCash: "Kas aktual (Rp)",
    difference: "Selisih",
    submitShift: "Simpan laporan shift",
    shiftHistory: "Riwayat shift gerai",
    perStore: "Ringkasan per gerai",
    monthlySalesReport: "Laporan Penjualan Bulanan",
    printMonthly: "Cetak laporan bulanan",
    close: "Tutup",
    save: "Simpan catatan",
    noAccess: "Halaman ini khusus admin.",
    selectStoreFirst: "Pilih gerai terlebih dahulu",
    insufficientProduction: "Stok produksi siap kirim belum mencukupi. Tandai batch sebagai siap kirim terlebih dahulu.",
    orderEmpty: "Keranjang masih kosong. Klik produk di katalog.",
    moneyShort: "Uang dibayar kurang dari total.",
    cleared: "Keranjang dikosongkan.",
    newReady: "Transaksi baru siap.",
    receivedSaved: "Penerimaan dicatat. Stok gerai bertambah.",
    shiftSaved: "Laporan shift disimpan.",
    edit: "Ubah",
    del: "Hapus",
    editProduct: "Ubah produk",
    reloadCatalog: "Muat katalog bawaan",
    catalogLoaded: "Katalog 3 kopi dimuat dan harga dinormalkan.",
    imageLabel: "Gambar (path / URL)",
    notesLabel: "Catatan rasa",
    descIdLabel: "Deskripsi (ID)",
    descEnLabel: "Deskripsi (EN)",
    inUseBlock: "Produk sudah dipakai transaksi — hanya bisa diubah, tidak bisa dihapus.",
    inProduction: "Sedang diproduksi — kirim dari Produksi & pengiriman.",
    shipHint: "Tandai semua batch siap sebelum mengirim.",
    approved: "Disetujui. Batch produksi dibuat.",
    rejected: "Permintaan ditolak. Hubungi gerai untuk pengembalian dana bila sudah dibayar.",
    storeApproved: "Gerai disetujui dan aktif.",
    storeRejected: "Pendaftaran gerai ditolak.",
    updated: "Catatan diperbarui.",
    invalidQty: "Masukkan jumlah yang valid.",
    overStock: "Jumlah melebihi stok gerai.",
    status: {
      Diajukan: "Diajukan", Disetujui: "Disetujui", Ditolak: "Ditolak",
      Produksi: "Produksi", Dikirim: "Dikirim", Diterima: "Diterima",
      Diseduh: "Diseduh", "Siap kirim": "Siap kirim",
      Aman: "Aman", Habis: "Habis", Kedaluwarsa: "Kedaluwarsa",
      "Segera kedaluwarsa": "Segera kedaluwarsa", "Stok kritis": "Stok kritis", Selisih: "Selisih",
      terjual: "Terjual", retur: "Retur", rusak: "Rusak", stok: "Stok fisik"
    }
  },
  en: {
    localMarker: "Local data",
    logout: "Sign out",
    helloStore: "Outlet",
    needLoginTitle: "Please sign in first",
    needLoginDetail: "This dashboard is for registered accounts. Sign in or register your outlet.",
    waitingTitle: "Waiting for admin approval",
    waitingDetail: "Your outlet registration is under review. This page will open automatically once approved. Keep it open or sign in again later.",
    waitingRejectedTitle: "Registration rejected",
    waitingRejectedDetail: "Your outlet registration was rejected by admin. Please contact the HelcoBali team.",
    recheck: "Check again",
    nav: {
      ringkasan: "Overview",
      stok: "Stock & expiry",
      restok: "Restock requests",
      produksi: "Production & delivery",
      penjualan: "Sales & returns",
      master: "Outlets & products",
      order: "Order Stock",
      shift: "Close Shift"
    },
    overline: { admin: "Consignment / Admin", staff: "Partnership / Outlet staff", order: "Ordering / Outlet staff", shift: "Reporting / Outlet staff" },
    subtitle: {
      default: "Notes on this device. Not server data.",
      order: "Pick products, set quantities, pay upfront. Orders go to admin for production and delivery.",
      shift: "Record sold products and actual cash. The system computes expected revenue and variance per outlet."
    },
    searchStock: "Search stock, outlet or batch",
    searchOrder: "Search products to order (e.g. Kintamani)",
    newTransaction: "New transaction",
    catalog: "Catalog",
    products: "products",
    add: "Add",
    stock: "Stock",
    cart: "Cart",
    clear: "Clear",
    customerNote: "Note / PIC (optional)",
    customerPh: "Name / Walk-in",
    emptyCart: "Cart is empty. Click products in the catalog.",
    subtotal: "Subtotal",
    discount: "Discount (Rp)",
    tax: "11% Tax",
    total: "Total",
    payMethod: "Payment method",
    received: "Amount paid (Rp)",
    change: "Change",
    placeOrder: "Order & Pay",
    printReceipt: "Print receipt",
    orderReceipt: "Order Receipt",
    pendingApproval: "Waiting for admin approval",
    orderRecorded: "Order sent to admin for production.",
    sidebarB2B: "Staff orders go to admin, get produced, then delivered to the outlet.",
    backToShop: "Back to shop",
    savedLocal: "Notes are stored in this browser, not synced to a server.",
    footerDefault: "HelcoBali · Local partnership dashboard",
    footerOrder: "HelcoBali · Order Stock — B2B orders go to admin.",
    storesPending: "Pending approval",
    storesActive: "Active outlets",
    storesRejected: "Rejected",
    approveStore: "Approve Outlet",
    reject: "Reject",
    approveProduce: "Approve & Produce",
    markReady: "Mark ready",
    ship: "Ship to outlet",
    receive: "Confirm receipt",
    batchExpiry: "Batch expiry",
    shipped: "Shipped",
    readyToSell: "Ready to sell",
    retur: "Returns",
    sold: "Sold",
    expectedCash: "Expected cash",
    actualCash: "Actual cash (Rp)",
    difference: "Variance",
    submitShift: "Save shift report",
    shiftHistory: "Outlet shift history",
    perStore: "Per-outlet summary",
    monthlySalesReport: "Monthly Sales Report",
    printMonthly: "Print monthly report",
    close: "Close",
    save: "Save note",
    noAccess: "This page is for admins.",
    selectStoreFirst: "Select an outlet first",
    insufficientProduction: "Ready-to-ship production stock is insufficient. Mark batches as ready first.",
    orderEmpty: "Cart is still empty. Click products in the catalog.",
    moneyShort: "Paid amount is less than the total.",
    cleared: "Cart cleared.",
    newReady: "New transaction ready.",
    receivedSaved: "Receipt recorded. Outlet stock increased.",
    shiftSaved: "Shift report saved.",
    edit: "Edit",
    del: "Delete",
    editProduct: "Edit product",
    reloadCatalog: "Load default catalog",
    catalogLoaded: "3-coffee catalog loaded and prices normalized.",
    imageLabel: "Image (path / URL)",
    notesLabel: "Tasting notes",
    descIdLabel: "Description (ID)",
    descEnLabel: "Description (EN)",
    inUseBlock: "Product is used in transactions — it can only be edited, not deleted.",
    inProduction: "In production — ship from Production & delivery.",
    shipHint: "Mark all batches ready before shipping.",
    approved: "Approved. Production batches created.",
    rejected: "Request rejected. Arrange a refund with the outlet if already paid.",
    storeApproved: "Outlet approved and active.",
    storeRejected: "Outlet registration rejected.",
    updated: "Note updated.",
    invalidQty: "Enter a valid quantity.",
    overStock: "Quantity exceeds outlet stock.",
    status: {
      Diajukan: "Submitted", Disetujui: "Approved", Ditolak: "Rejected",
      Produksi: "In production", Dikirim: "Shipped", Diterima: "Received",
      Diseduh: "Brewing", "Siap kirim": "Ready to ship",
      Aman: "OK", Habis: "Empty", Kedaluwarsa: "Expired",
      "Segera kedaluwarsa": "Expiring soon", "Stok kritis": "Critical stock", Selisih: "Variance",
      terjual: "Sold", retur: "Returned", rusak: "Damaged", stok: "Stock count"
    }
  }
};
