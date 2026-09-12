/**
 * Explore.jsx — Product collection page.
 *
 * Displays all cold brew variants with:
 *  - Animated product images (250 ml / 500 ml toggle)
 *  - Tasting notes & origin info
 *  - "Find at Partners" button → navigates to `/#outlets`
 *
 * Data:
 *  - Products come from `locales.js → t.explore.products`
 *  - Animation variants from `lib/animations.js`
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Coffee, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

import NavHashLink from '../components/NavHashLink';
import SEO from '../components/SEO';
import { fadeUp, staggerContainer } from '../lib/animations';

const MotionDiv = motion.div;
const PRODUCT_SIZES = ['250', '500'];

/** SEO meta per language. */
const SEO_CONTENT = {
  id: {
    title:
      'Koleksi Cold Brew – La Plaga, La Kintamani, La Pupuan | Helco Bali',
    description:
      'Jelajahi 3 varian cold brew eksklusif Helco Bali: La Plaga (Arabika+Robusta+Liberika), La Kintamani (Dark & Bold), dan La Pupuan (Liberika fruity). Diseduh 18 jam.',
  },
  en: {
    title:
      'Cold Brew Collection – La Plaga, La Kintamani, La Pupuan | Helco Bali',
    description:
      "Explore Helco Bali's 3 exclusive cold brews: La Plaga (Arabica+Robusta+Liberica blend), La Kintamani (Dark & Bold), and La Pupuan (fruity Liberica-forward). 18-hour steep.",
  },
};

/* ─────────────────────────────────────────────────────────
 * Component
 * ───────────────────────────────────────────────────────── */
/**
 * [TAG: PAGE_EXPLORE]
 * Halaman eksplorasi produk yang menampilkan daftar keseluruhan varian produk.
 * Menerima properti terjemahan bahasa ({t} dan {lang}) dari locales.js.
 */
export default function Explore({ t, lang }) {
  /* Scroll to top on mount */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /* ── Size toggle state (per product) ── */
  const [selectedSizes, setSelectedSizes] = useState({});

  /**
   * [TAG: HANDLER_SELECT_SIZE]
   * Mengubah tampilan animasi gambar botol 250ml menjadi 500ml atau sebaliknya.
   */
  const selectSize = (productId, size) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  /* ────────────────────────────────────────────────────── */
  return (
    <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
      {/* ── SEO ── */}
      <SEO
        lang={lang}
        title={SEO_CONTENT[lang]?.title}
        description={SEO_CONTENT[lang]?.description}
        url="https://helcobali.vercel.app/explore"
      />

      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-stone-400 hover:text-amber-500 transition-colors mb-16 uppercase tracking-[0.2em] text-xs font-semibold"
      >
        <ArrowLeft size={16} />
        <span>{t.explore.labels.back}</span>
      </Link>

      {/* Page header */}
      <MotionDiv
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="mb-24 text-center"
      >
        <motion.span
          variants={fadeUp}
          className="text-amber-500 tracking-[0.3em] text-xs font-semibold uppercase mb-4 block"
        >
          {t.explore.subtitle}
        </motion.span>
        <motion.h1
          variants={fadeUp}
          className="text-5xl md:text-7xl font-serif text-white mb-6"
        >
          {t.explore.title}
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="text-stone-400 max-w-2xl mx-auto text-lg font-light leading-relaxed"
        >
          {t.explore.desc}
        </motion.p>
      </MotionDiv>

      {/* ── Product cards ── */}
      <div className="space-y-32">
        {t.explore.products.map((product, idx) => {
          const currentSize = selectedSizes[product.id] ?? PRODUCT_SIZES[0];
          const currentImage =
            currentSize === PRODUCT_SIZES[1] ? product.image500 : product.image250;
          const isReversed = idx % 2 !== 0;

          return (
            <MotionDiv
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 1 }}
              className={`flex flex-col lg:flex-row gap-12 lg:gap-20 items-center ${
                isReversed ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* ── Product image + size toggle ── */}
              <div className="w-full lg:w-1/2 relative group">
                <div className="aspect-[4/5] bg-white overflow-hidden relative flex items-center justify-center p-8 lg:p-12 shadow-2xl">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={`${product.id}-${currentSize}`}
                      src={currentImage}
                      alt={`${product.name} – ${currentSize}ml – Helco Bali Cold Brew`}
                      className="relative z-10 w-full h-full object-contain filter contrast-[1.05]"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      transition={{
                        duration: 0.5,
                        ease: [0.25, 0.1, 0.25, 1],
                      }}
                    />
                  </AnimatePresence>
                </div>

                {/* Size toggle buttons */}
                <div
                  className={`absolute -bottom-6 ${
                    isReversed
                      ? '-left-4 lg:-left-6'
                      : '-right-4 lg:-right-6'
                  } z-20 flex shadow-xl`}
                >
                  {PRODUCT_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => selectSize(product.id, size)}
                      className={`px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 cursor-pointer border ${
                        size === PRODUCT_SIZES[1] ? 'border-l-0' : ''
                      } ${
                        currentSize === size
                          ? 'bg-amber-500 text-black border-amber-500'
                          : 'bg-[#0a0a0a] text-stone-400 border-white/10 hover:text-amber-500 hover:border-amber-500/40'
                      }`}
                    >
                      {size}ml
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Product info ── */}
              <div className="w-full lg:w-1/2 text-left">
                <span className="text-amber-500 text-xs tracking-[0.2em] uppercase font-bold">
                  {product.roast}
                </span>
                <h2 className="text-4xl md:text-5xl font-serif text-white mt-4 mb-8">
                  {product.name}
                </h2>

                <p className="text-stone-400 text-lg leading-relaxed font-light mb-10 pb-10 border-b border-white/10">
                  {product.desc}
                </p>

                {/* Origin & tasting notes */}
                <div className="grid grid-cols-2 gap-8 mb-12">
                  <div>
                    <h4 className="text-stone-500 text-xs uppercase tracking-widest mb-2 font-semibold flex items-center gap-2">
                      <MapPin size={14} /> {t.explore.labels.origin}
                    </h4>
                    <p className="text-stone-200 font-medium">
                      {product.origin}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-stone-500 text-xs uppercase tracking-widest mb-2 font-semibold flex items-center gap-2">
                      <Coffee size={14} /> {t.explore.labels.notes}
                    </h4>
                    <p className="text-stone-200 font-medium">
                      {product.notes}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-4">
                  <Link to={`/product/${product.db_id}`}>
                    <MotionDiv
                      whileHover={{
                        scale: 1.05,
                        backgroundColor: '#d4af37',
                        color: '#000',
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-2 border border-amber-500/50 text-amber-500 px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-colors cursor-pointer"
                    >
                      <Coffee size={14} />
                      <span>View Product</span>
                    </MotionDiv>
                  </Link>

                  <NavHashLink to="/#outlets" className="inline-block">
                    <MotionDiv
                      whileHover={{
                        scale: 1.05,
                        backgroundColor: '#d4af37',
                        color: '#000',
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-2 border border-amber-500/50 text-amber-500 px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-colors cursor-pointer"
                    >
                      <MapPin size={14} />
                      <span>{t.explore.labels.orderBtn}</span>
                    </MotionDiv>
                  </NavHashLink>
                </div>
              </div>
            </MotionDiv>
          );
        })}
      </div>
    </main>
  );
}
