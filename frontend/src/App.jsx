import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BrowserRouter, Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { locales } from './locales';

import Navbar from './components/Navbar';
import MobileMenu from './components/MobileMenu';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Explore from './pages/Explore';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

function AppInner() {
  const location = useLocation();
  const [lang, setLang] = useState('en');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = locales[lang];

  const toggleLang = () => setLang((prev) => (prev === 'en' ? 'id' : 'en'));
  const openMobileMenu = () => setIsMobileMenuOpen(true);
  const closeMenu = () => setIsMobileMenuOpen(false);

  if (location.pathname === '/dashboard') return <Dashboard lang={lang} />;
  if (location.pathname === '/login') return <Auth mode="login" t={t} />;
  if (location.pathname === '/signup') return <Auth mode="signup" t={t} />;

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
        <Route path="/product/:id" element={<Navigate to="/explore" replace />} />
        <Route path="/cart" element={<Navigate to="/explore" replace />} />
      </Routes>

      <Footer t={t} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppInner />
    </BrowserRouter>
  );
}
