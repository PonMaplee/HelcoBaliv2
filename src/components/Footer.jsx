/**
 * Footer — 4-column layout + bottom copyright bar.
 *
 * Columns:
 *  1. Brand info & tagline
 *  2. Navigate — links to homepage sections
 *  3. Products — links to the /explore page
 *  4. Follow Us — social media with icons
 *
 * Social links are imported from `config/social.js`.
 * Icons are rendered via the `ICON_MAP` lookup.
 *
 * @param {Object} t — current locale strings
 */
import { Link } from 'react-router-dom';
import NavHashLink from './NavHashLink';
import { SOCIAL_LINKS } from '../config/social';
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from './SocialIcons';

const SOCIAL_ICONS = {
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  whatsapp: WhatsAppIcon,
};

function SocialLink({ url, label, iconId, variant = 'row' }) {
  const Icon = SOCIAL_ICONS[iconId];
  if (!Icon) return null;

  if (variant === 'icon') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-stone-700 hover:text-amber-500 transition-colors duration-300"
        aria-label={label}
      >
        <Icon />
      </a>
    );
  }

  return (
    <li>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3 justify-center md:justify-start"
      >
        <span className="flex items-center justify-center w-9 h-9 border border-stone-800 rounded-lg group-hover:border-amber-500/40 group-hover:bg-amber-500/5 transition-all duration-300">
          <Icon className="text-stone-500 group-hover:text-amber-500 transition-colors duration-300" />
        </span>
        <span className="text-stone-500 text-sm group-hover:text-amber-500 transition-colors duration-300">
          {label}
        </span>
      </a>
    </li>
  );
}

export default function Footer({ t }) {
  return (
    <footer className="relative z-10 w-full bg-linear-to-b from-[#0a0a0a] to-black border-t border-white/5">
      {/* ── Main content (4 columns) ── */}
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          {/* Column 1 — Brand */}
          <div className="text-center md:text-left">
            <Link to="/" className="inline-block">
              <h3 className="text-amber-500 font-serif text-xl tracking-[0.3em] uppercase font-medium mb-2 hover:text-amber-400 transition-colors">
                HelcoBali
              </h3>
            </Link>
            <p className="text-stone-500 text-[11px] tracking-[0.2em] uppercase mb-6">
              {t.footerSection.tagline}
            </p>
            <p className="text-stone-600 text-sm font-light leading-relaxed max-w-[240px] mx-auto md:mx-0">
              {t.footerSection.desc}
            </p>
          </div>

          {/* Column 2 — Navigate */}
          <div className="text-center md:text-left">
            <h4 className="text-amber-500/70 text-[11px] tracking-[0.25em] uppercase mb-6 font-medium">
              {t.footerSection.navigate}
            </h4>
            <ul className="space-y-4">
              <li>
                <NavHashLink
                  to="/#story"
                  className="text-stone-500 text-sm hover:text-amber-500 transition-colors duration-300"
                >
                  {t.nav.story}
                </NavHashLink>
              </li>
              <li>
                <NavHashLink
                  to="/#outlets"
                  className="text-stone-500 text-sm hover:text-amber-500 transition-colors duration-300"
                >
                  {t.nav.locations}
                </NavHashLink>
              </li>
              <li>
                <NavHashLink
                  to="/#contact"
                  className="text-stone-500 text-sm hover:text-amber-500 transition-colors duration-300"
                >
                  {t.nav.contact}
                </NavHashLink>
              </li>
            </ul>
          </div>

          {/* Column 3 — Products */}
          <div className="text-center md:text-left">
            <h4 className="text-amber-500/70 text-[11px] tracking-[0.25em] uppercase mb-6 font-medium">
              {t.footerSection.products}
            </h4>
            <ul className="space-y-4">
              {t.explore.products.map((p) => (
                <li key={p.id}>
                  <Link
                    to="/explore"
                    className="text-stone-500 text-sm hover:text-amber-500 transition-colors duration-300"
                  >
                    {p.name.replace('La ', '').replace(' Coffee', '')}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Follow Us */}
          <div className="text-center md:text-left">
            <h4 className="text-amber-500/70 text-[11px] tracking-[0.25em] uppercase mb-6 font-medium">
              {t.footerSection.followUs}
            </h4>
            <ul className="space-y-4">
              {SOCIAL_LINKS.map((link) => (
                <SocialLink
                  key={link.id}
                  url={link.url}
                  label={link.label}
                  iconId={link.id}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-stone-700 text-[10px] md:text-xs uppercase tracking-widest font-light">
            &copy; {new Date().getFullYear()} {t.footer}
          </p>

          <div className="flex items-center gap-6">
            {SOCIAL_LINKS.map((link) => (
              <SocialLink
                key={link.id}
                url={link.url}
                label={link.label}
                iconId={link.id}
                variant="icon"
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
