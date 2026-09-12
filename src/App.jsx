import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { locales } from './locales';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar';
import MobileMenu from './components/MobileMenu';
import Footer from './components/Footer';
import ProductDetail from './pages/ProductDetail';
import ScrollToTop from './components/ScrollToTop';
import Cart from './pages/Cart';
import Explore from './pages/Explore';
import Home from './pages/Home';

function AppInner() {
  const [lang, setLang] = useState('en');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = locales[lang];

  const toggleLang = () => setLang((prev) => (prev === 'en' ? 'id' : 'en'));
  const openMobileMenu = () => setIsMobileMenuOpen(true);
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-[#050505] text-stone-300 font-sans selection:bg-amber-500 selection:text-white overflow-x-hidden">
      <Navbar
        t={t}
        toggleLang={toggleLang}
        openMobileMenu={openMobileMenu}
        closeMenu={closeMenu}
      />

      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenu
            t={t}
            lang={lang}
            closeMenu={closeMenu}
            toggleLang={toggleLang}
          />
        )}
      </AnimatePresence>

      <Routes>
        <Route path="/" element={<Home t={t} />} />
        <Route path="/explore" element={<Explore t={t} lang={lang} />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>

      <Footer t={t} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <ScrollToTop />
        <AppInner />
      </CartProvider>
    </BrowserRouter>
  );
}
