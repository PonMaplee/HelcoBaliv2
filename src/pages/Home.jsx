/**
 * Home.jsx — Landing page.
 *
 * Sections (in order):
 *  1. Hero         — full-screen with CTA
 *  2. Story        — brand philosophy / storytelling
 *  3. Outlets      — retail partner carousel (auto-play)
 *  4. Contact/B2B  — corporate partnership CTA
 *
 * Data:
 *  - Outlet list comes from `config/outlets.js`
 *  - Translations from the `t` prop (see `locales.js`)
 *  - Animation variants from `lib/animations.js`
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Coffee,
  Phone,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import ProductCarousel from '../components/ProductCarousel';
import { OUTLETS } from '../config/outlets';
import { WHATSAPP_CTA } from '../config/social';
import {
  fadeUp,
  staggerContainer,
  floating,
  glowBreathing,
} from '../lib/animations';

/* ── Constants ── */
const SLIDE_INTERVAL_MS = 5000;
const HERO_IMAGES = [
  '/hero%202.jpg',
  '/hero%204.jpg',
  '/hero.png',
  '/hero3.jpg',
];
const MotionDiv = motion.div;
const getNextIndex = (index, length) => (index + 1) % length;
const getPreviousIndex = (index, length) => (index + length - 1) % length;

/* ─────────────────────────────────────────────────────────
 * Component
 * ───────────────────────────────────────────────────────── */
export default function Home({ t }) {
  /* ── Hero slider state ── */
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  useEffect(() => {
    const heroTimer = setInterval(() => {
      setCurrentHeroSlide((prev) => getNextIndex(prev, HERO_IMAGES.length));
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(heroTimer);
  }, []);

  /* ── Outlet slider state ── */
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () =>
    setCurrentSlide((prev) => getNextIndex(prev, OUTLETS.length));

  const prevSlide = () =>
    setCurrentSlide((prev) => getPreviousIndex(prev, OUTLETS.length));

  /* Auto-advance slides every SLIDE_INTERVAL_MS */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => getNextIndex(prev, OUTLETS.length));
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const [storyBeforeBrand, storyAfterBrand] = t.story.p1.split('HelcoBali');
  const [contactBeforePantry, contactAfterPantry = ''] =
    t.contact.desc.split('pantry');
  const [contactBeforeHospitality, contactAfterHospitality] =
    contactAfterPantry.split('hospitality');

  /* ────────────────────────────────────────────────────── */
  return (
    <main>
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative w-full min-h-screen flex items-end justify-start bg-[#111111] overflow-hidden font-sans">
        {/* Background Image Slider */}
        {HERO_IMAGES.map((image, index) => (
          <div
            key={image}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === currentHeroSlide ? 'opacity-100 z-0' : 'opacity-0 -z-10'
            }`}
          >
            <img
              src={image}
              alt={`Hero Background ${index + 1}`}
              className="w-full h-full object-cover object-center"
            />
          </div>
        ))}

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60 z-10 pointer-events-none"></div>

        {/* Content Container */}
        <div className="relative z-20 w-full p-6 pb-24 md:p-12 md:pb-32 lg:p-24 lg:pb-40 flex flex-col items-start justify-end h-full text-white">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-none tracking-tighter max-w-5xl"
          >
            Industrial Craft.<br />
            Uncompromised.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 md:mt-8 text-lg md:text-xl font-normal max-w-2xl text-gray-200 leading-relaxed"
          >
            Precision roasting, ethically sourced beans, and a relentless pursuit of perfection. Experience the bold standard of specialty coffee.
          </motion.p>

          <Link to="/explore">
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-8 md:mt-12 px-8 md:px-12 py-4 bg-white text-[#111111] font-bold uppercase tracking-widest text-sm rounded-none border border-transparent hover:bg-black hover:text-white hover:border-white transition-colors duration-300"
            >
              Discover The Roasts
            </motion.button>
          </Link>
        </div>

        {/* Custom Slide Navigation Indicators */}
        <div className="absolute bottom-8 left-6 md:left-12 lg:left-24 z-20 flex items-center gap-3">
          {HERO_IMAGES.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentHeroSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-1.5 transition-all duration-300 rounded-none cursor-pointer ${
                index === currentHeroSlide
                  ? 'w-12 bg-white'
                  : 'w-6 bg-white/40 hover:bg-white/80'
              }`}
            ></button>
          ))}
        </div>
      </section>

      {/* ═══════════════ STORY / PHILOSOPHY ═══════════════ */}
      <section
        id="story"
        className="py-32 md:py-48 px-6 lg:px-12 bg-[#050505] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-stone-800 to-transparent" />
        <MotionDiv
          variants={glowBreathing}
          animate="animate"
          className="absolute top-1/3 -right-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"
        />

        <div className="max-w-[85rem] mx-auto relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-center">
            {/* Left: image */}
            <MotionDiv
              className="lg:col-span-5 relative group mb-8 lg:mb-0"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            >
              <div className="relative w-full h-[400px] md:h-[500px] lg:h-[750px] overflow-hidden shadow-2xl">
                <img
                  src="/story.png"
                  alt="Proses Pembuatan"
                  className="w-full h-full object-cover shadow-2xl filter contrast-[1.15] grayscale-[25%] transition-transform duration-[3s] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#050505] via-transparent to-transparent opacity-80" />
              </div>

              {/* Decorative floating badge */}
              <MotionDiv
                variants={floating}
                animate="animate"
                className="relative mt-4 md:absolute md:mt-0 md:-bottom-8 md:-right-16 bg-[#0a0a0a] border border-amber-500/20 p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-sm z-20 w-full md:w-80 flex md:block items-center justify-between"
              >
                <Coffee
                  className="w-8 h-8 md:w-10 md:h-10 text-amber-500 md:mb-6 opacity-90 drop-shadow-[0_0_10px_rgba(217,119,6,0.3)] shrink-0"
                  strokeWidth={1.5}
                />
                <div className="text-right md:text-left">
                  <h3 className="text-2xl md:text-3xl font-serif text-white mb-1 md:mb-2 leading-tight">
                    18 <span className="italic text-stone-400">Hours</span>
                  </h3>
                  <span className="hidden md:block h-px w-12 bg-amber-500/50 mb-4" />
                  <p className="text-stone-400 text-[10px] md:text-xs tracking-widest uppercase font-medium">
                    {t.hero.subtitle}
                  </p>
                </div>
              </MotionDiv>
            </MotionDiv>

            {/* Right: typography / storytelling */}
            <MotionDiv
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
              className="lg:col-span-7 lg:pl-10 mt-6 lg:mt-0"
            >
              <div className="flex items-center gap-4 mb-8">
                <span className="h-px w-12 bg-amber-500/50" />
                <span className="text-amber-500 tracking-[0.4em] text-xs font-semibold uppercase">
                  {t.nav.story}
                </span>
              </div>

              <motion.h2
                variants={fadeUp}
                className="text-4xl md:text-6xl lg:text-7xl font-serif text-white mb-16 leading-[1.1] tracking-tight"
              >
                {t.story.title1} <br />
                <span className="italic text-amber-500/90 font-light drop-shadow-[0_0_15px_rgba(217,119,6,0.2)]">
                  {t.story.title2}
                </span>
              </motion.h2>

              {/* Pull-quote */}
              <div className="border-l border-amber-500/30 pl-8 md:pl-12 mb-12">
                <motion.p
                  variants={fadeUp}
                  className="text-xl md:text-3xl font-serif italic text-stone-200 leading-relaxed relative px-4 md:px-0"
                >
                  <span className="text-5xl md:text-6xl text-amber-500/20 absolute -top-4 -left-2 md:-left-6 font-serif">
                    "
                  </span>
                  {storyBeforeBrand}
                  <span className="text-amber-500">HelcoBali</span>
                  {storyAfterBrand}
                  <span className="text-5xl md:text-6xl text-amber-500/20 absolute -bottom-8 right-0 md:-right-2 font-serif">
                    "
                  </span>
                </motion.p>
              </div>

              {/* Two-column body text */}
              <MotionDiv
                variants={fadeUp}
                className="grid md:grid-cols-2 gap-10 text-stone-400 text-lg font-light leading-relaxed"
              >
                <p className="first-letter:text-5xl first-letter:font-serif first-letter:text-amber-500 first-letter:mr-2 first-letter:float-left first-letter:-mt-1">
                  {t.story.p2}
                </p>
                <p>{t.story.p3}</p>
              </MotionDiv>
            </MotionDiv>
          </div>
        </div>
      </section>

      {/* ═══════════════ PRODUCT CAROUSEL ═══════════════ */}
      <ProductCarousel />

      {/* ═══════════════ RETAIL OUTLETS (SLIDER) ═══════════════ */}
      <section
        id="outlets"
        className="py-32 px-6 overflow-hidden relative bg-[#080808]"
      >
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-stone-800 to-transparent" />

        {/* Section header */}
        <MotionDiv
          className="text-center max-w-3xl mx-auto mb-20 relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.span
            variants={fadeUp}
            className="text-amber-500 tracking-[0.3em] text-xs font-semibold uppercase mb-4 block"
          >
            {t.outletsTitle.sub}
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="text-4xl md:text-5xl font-serif text-white mb-6"
          >
            {t.outletsTitle.title}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-stone-400 font-light text-lg"
          >
            {t.outletsTitle.desc}
          </motion.p>
        </MotionDiv>

        {/* Slider */}
        <div className="max-w-6xl mx-auto relative group px-12 md:px-0 z-10">
          <div className="overflow-hidden border border-white/5 bg-[#0a0a0a] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <MotionDiv
              className="flex transition-transform duration-1000 ease-[0.25,1,0.5,1]"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {OUTLETS.map((outlet) => (
                <div
                  key={outlet.id}
                  className="min-w-full flex flex-col md:flex-row"
                >
                  {/* Image */}
                  <div className="w-full md:w-1/2 h-[400px] md:h-[500px] relative overflow-hidden group/img">
                    <img
                      src={outlet.image}
                      alt={outlet.name}
                      className="w-full h-full object-cover opacity-80 filter contrast-125 group-hover/img:scale-110 transition-transform duration-[2s] ease-out"
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-black/60 to-transparent md:hidden" />
                  </div>

                  {/* Info */}
                  <div className="w-full md:w-1/2 p-10 md:p-20 flex flex-col justify-center relative bg-[#0a0a0a] overflow-hidden">
                    <MotionDiv
                      variants={glowBreathing}
                      animate="animate"
                      className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px]"
                    />
                    <MotionDiv
                      variants={floating}
                      animate="animate"
                      className="self-start"
                    >
                      <MapPin
                        className="text-amber-500 mb-6 w-8 h-8 opacity-90 drop-shadow-[0_0_10px_rgba(217,119,6,0.3)]"
                        strokeWidth={1.5}
                      />
                    </MotionDiv>

                    <h3 className="text-3xl md:text-4xl font-serif text-white mb-3">
                      {outlet.name}
                    </h3>
                    <p className="text-amber-500 text-xs tracking-widest uppercase mb-6 font-medium">
                      {outlet.location}
                    </p>
                    <p className="text-stone-400 font-light leading-relaxed mb-10 text-lg">
                      {t.outlets[outlet.id]}
                    </p>

                    {/* Maps links */}
                    <div className="flex flex-col gap-3">
                      {outlet.branches.map((branch) => (
                        <motion.a
                          key={branch.name}
                          href={branch.mapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ x: 5 }}
                          className="flex items-center gap-2 self-start border-b border-amber-500/50 pb-2 text-amber-500 hover:text-amber-400 transition-colors uppercase tracking-[0.15em] text-xs font-semibold group"
                        >
                          <span>
                            {outlet.branches.length > 1
                              ? `${t.mapsBtnSingle} ${branch.name}`
                              : t.mapsBtn}
                          </span>
                          <ArrowRight
                            size={14}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </motion.a>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </MotionDiv>
          </div>

          {/* Prev / Next buttons */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.1, backgroundColor: '#111' }}
            whileTap={{ scale: 0.9 }}
            onClick={prevSlide}
            className="absolute left-2 md:-left-8 top-[200px] md:top-1/2 -translate-y-1/2 bg-[#050505] border border-white/10 text-stone-400 p-3 md:p-4 hover:border-amber-500 hover:text-amber-500 transition-colors z-10 backdrop-blur-md shadow-xl"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} strokeWidth={1.5} />
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.1, backgroundColor: '#111' }}
            whileTap={{ scale: 0.9 }}
            onClick={nextSlide}
            className="absolute right-2 md:-right-8 top-[200px] md:top-1/2 -translate-y-1/2 bg-[#050505] border border-white/10 text-stone-400 p-3 md:p-4 hover:border-amber-500 hover:text-amber-500 transition-colors z-10 backdrop-blur-md shadow-xl"
            aria-label="Next slide"
          >
            <ChevronRight size={24} strokeWidth={1.5} />
          </motion.button>

          {/* Dot indicators */}
          <div className="flex justify-center gap-4 mt-12 relative z-10">
            {OUTLETS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1 transition-all duration-500 ${
                  currentSlide === idx
                    ? 'bg-amber-500 w-12'
                    : 'bg-stone-700 w-6 hover:bg-stone-500'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CONTACT / B2B ═══════════════ */}
      <section
        id="contact"
        className="py-32 relative bg-[#030303] flex justify-center items-center flex-col overflow-hidden"
      >
        <MotionDiv
          variants={glowBreathing}
          animate="animate"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none"
        />
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-stone-800 to-transparent" />

        <MotionDiv
          className="max-w-3xl mx-auto text-center px-6 relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <MotionDiv
            variants={floating}
            animate="animate"
            className="inline-block"
          >
            <Phone
              className="w-10 h-10 text-amber-500 mx-auto mb-8 opacity-90 drop-shadow-[0_0_10px_rgba(217,119,6,0.3)]"
              strokeWidth={1.5}
            />
          </MotionDiv>

          <motion.h2
            variants={fadeUp}
            className="text-4xl md:text-5xl font-serif text-white mb-6"
          >
            {t.contact.title}
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="text-stone-400 font-light text-xl mb-12 leading-relaxed"
          >
            {contactBeforePantry}
            <i className="text-stone-300">pantry</i>
            {contactBeforeHospitality}
            <i className="text-stone-300">hospitality</i>
            {contactAfterHospitality}
          </motion.p>

          <motion.a
            variants={fadeUp}
            whileHover={{
              scale: 1.05,
              boxShadow: '0px 0px 40px rgba(217,119,6,0.3)',
            }}
            whileTap={{ scale: 0.95 }}
            href={WHATSAPP_CTA}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 bg-white text-black font-semibold tracking-[0.2em] uppercase px-10 py-5 hover:bg-amber-500 transition-colors duration-500 text-sm"
          >
            {t.contact.btn}
            <ArrowRight size={16} />
          </motion.a>
        </MotionDiv>
      </section>
    </main>
  );
}
