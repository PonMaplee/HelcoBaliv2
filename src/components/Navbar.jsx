/**
 * Navbar — fixed top navigation bar.
 *
 * Contains:
 *  - Brand logo (links to home)
 *  - Desktop navigation links
 *  - Language toggle button
 *  - Hamburger button (mobile) that opens MobileMenu
 *
 * @param {Object}   t             — current locale strings
 * @param {function} toggleLang    — switches EN ↔ ID
 * @param {function} openMobileMenu — opens the mobile overlay
/**
 * Navbar — fixed top navigation bar.
 *
 * Contains:
 *  - Brand logo (links to home)
 *  - Desktop navigation links
 *  - Language toggle button
 *  - Hamburger button (mobile) that opens MobileMenu
 *
 * @param {Object}   t             — current locale strings
 * @param {function} toggleLang    — switches EN ↔ ID
 * @param {function} openMobileMenu — opens the mobile overlay
 * @param {function} closeMenu     — closes the mobile menu (used on logo click)
 */
import { motion } from 'framer-motion';
import { Globe, Menu, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import NavHashLink from './NavHashLink';
import { useCart } from '../context/CartContext';

const MotionDiv = motion.div;
const linkClass =
  'hover:text-amber-500 hover:-translate-y-0.5 transition-all duration-300';

export default function Navbar({ t, toggleLang, openMobileMenu, closeMenu }) {
  const { totalCount } = useCart();

  return (
    <nav className="fixed w-full z-50 py-4 md:py-6 px-6 md:px-8 flex justify-between items-center bg-black/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
      {/* Brand */}
      <Link to="/" onClick={closeMenu}>
        <MotionDiv
          whileHover={{ scale: 1.05 }}
          className="text-xl md:text-2xl font-serif text-amber-500 tracking-[0.2em] uppercase cursor-pointer relative z-50"
        >
          HelcoBali
        </MotionDiv>
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-10 text-xs tracking-[0.2em] uppercase text-stone-400 font-medium">
        <NavHashLink to="/#story" className={linkClass}>
          {t.nav.story}
        </NavHashLink>

        <Link to="/explore" className={linkClass}>
          {t.nav.products}
        </Link>

        <NavHashLink to="/#outlets" className={linkClass}>
          {t.nav.locations}
        </NavHashLink>

        <NavHashLink to="/#contact" className={linkClass}>
          {t.nav.contact}
        </NavHashLink>

        <Link to="/cart" className={`${linkClass} ml-2 relative`} aria-label="Shopping Bag">
          <ShoppingCart size={20} />
          {totalCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-amber-500 text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(212,175,55,0.6)] animate-in fade-in zoom-in duration-200">
              {totalCount}
            </span>
          )}
        </Link>

        <button
          type="button"
          onClick={toggleLang}
          className="flex items-center gap-2 border border-white/10 px-3 py-1.5 rounded-full hover:border-amber-500/50 hover:text-amber-500 transition-all"
        >
          <Globe size={14} />
          <span>{t.nav.langToggle}</span>
        </button>
      </div>

      {/* Mobile action cluster */}
      <div className="flex md:hidden items-center gap-4">
        <Link to="/cart" onClick={closeMenu} className="text-amber-500 p-2 relative z-50" aria-label="Shopping Bag">
          <ShoppingCart size={22} />
          {totalCount > 0 && (
            <span className="absolute top-1 right-1 bg-amber-500 text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {totalCount}
            </span>
          )}
        </Link>
        <button
          type="button"
          className="text-amber-500 p-2 relative z-50"
          onClick={openMobileMenu}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </div>
    </nav>
  );
}
