/**
 * MobileMenu — full-screen overlay navigation for small screens.
 *
 * Slides in from the right with a Framer Motion animation.
 * Wrapping in `<AnimatePresence>` is the caller's responsibility
 * so the exit animation works.
 *
 * @param {Object}   t          — current locale strings
 * @param {string}   lang       — 'en' | 'id'
 * @param {function} closeMenu  — hides the overlay
 * @param {function} toggleLang — switches EN ↔ ID
 */
import { motion } from 'framer-motion';
import { Globe, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import NavHashLink from './NavHashLink';

const MotionDiv = motion.div;
const linkClass =
  'hover:text-amber-500 w-full py-4 border-b border-white/5 transition-colors';

export default function MobileMenu({ t, lang, closeMenu, toggleLang }) {
  return (
    <MotionDiv
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'tween', duration: 0.3 }}
      className="fixed inset-0 z-60 bg-[#050505] flex flex-col items-center justify-center"
    >
      {/* Close button */}
      <button
        type="button"
        onClick={closeMenu}
        className="absolute top-4 right-6 text-stone-400 hover:text-amber-500 p-2"
        aria-label="Close menu"
      >
        <X size={32} />
      </button>

      {/* Links */}
      <div className="flex flex-col items-center gap-8 text-sm tracking-[0.2em] uppercase text-stone-300 font-medium w-full px-8 text-center mt-12">
        <NavHashLink to="/#story" onClick={closeMenu} className={linkClass}>
          {t.nav.story}
        </NavHashLink>

        <Link to="/explore" onClick={closeMenu} className={linkClass}>
          {t.nav.products}
        </Link>

        <NavHashLink to="/#outlets" onClick={closeMenu} className={linkClass}>
          {t.nav.locations}
        </NavHashLink>

        <NavHashLink to="/#contact" onClick={closeMenu} className={linkClass}>
          {t.nav.contact}
        </NavHashLink>

        {/* Divider */}
        <div className="w-12 h-px bg-amber-500/30 my-4" />

        {/* Language toggle */}
        <button
          type="button"
          onClick={() => {
            toggleLang();
            closeMenu();
          }}
          className="flex items-center gap-3 border border-amber-500/30 text-amber-500 px-6 py-3 rounded-full active:bg-amber-500 active:text-black transition-all"
        >
          <Globe size={18} />
          <span>{lang === 'en' ? 'ID (Bahasa)' : 'EN (English)'}</span>
        </button>
      </div>
    </MotionDiv>
  );
}
