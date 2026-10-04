/**
 * SEO.jsx — Helmet-based meta tags for every page.
 *
 * Renders `<title>`, Open Graph, Twitter Card, and Schema.org
 * JSON-LD structured data. Defaults are locale-aware (EN / ID).
 *
 * @param {string}  lang        — 'en' | 'id'
 * @param {string} [title]      — page title override
 * @param {string} [description]— meta description override
 * @param {string} [url]        — canonical URL override
 * @param {string} [image]      — OG image override
 */
import { Helmet } from 'react-helmet-async';
import { SOCIAL_LINKS } from '../config/social';

/** Production base URL (used for canonical links & OG tags). */
const BASE_URL = 'https://helcobali.vercel.app';

/** Default meta per language. */
const DEFAULTS = {
  id: {
    title:
      'Helco Bali – Cold Brew Kopi Arabika, Robusta & Liberika | Bali',
    description:
      'Helco Bali menghadirkan cold brew premium dengan 3 biji pilihan: Arabika, Robusta, dan Liberika langka dari dataran tinggi Bali. Diseduh 18 jam. Eksklusif. Terbatas.',
  },
  en: {
    title:
      'Helco Bali – Artisan Cold Brew Coffee | Arabica, Robusta & Liberica',
    description:
      "Helco Bali crafts premium cold brew from 3 distinct beans: Arabica, Robusta, and rare Liberica from Bali's highlands. 18-hour slow-steep. Exclusive. Limited.",
  },
};

export default function SEO({ title, description, url, image, lang = 'id' }) {
  const finalTitle = title || DEFAULTS[lang].title;
  const finalDesc = description || DEFAULTS[lang].description;
  const finalUrl = url || BASE_URL;
  const finalImage = image || `${BASE_URL}/og-image.jpg`;
  const htmlLang = lang === 'id' ? 'id' : 'en';

  /** Schema.org structured data for search engines. */
  const schemaOrg = {
    '@context': 'https://schema.org',
    '@type': 'CoffeeSupplier',
    name: 'Helco Bali',
    alternateName: 'HelcoBali Artisan Cold Brew',
    description: DEFAULTS.en.description,
    url: BASE_URL,
    image: finalImage,
    logo: `${BASE_URL}/favicon.svg`,
    telephone: '+6283119091100',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bali',
      addressRegion: 'Bali',
      addressCountry: 'ID',
    },
    servesCuisine: [
      'Cold Brew Coffee',
      'Artisan Coffee',
      'Balinese Coffee',
    ],
    priceRange: 'Rp 110.000 – Rp 135.000',
    menu: `${BASE_URL}/explore`,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Helco Bali Cold Brew Collection',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: 'La Plaga Coffee',
            description:
              'Cold brew Arabika, Robusta & Liberika. Profil rasa: Ceri Hitam, Oak, Hint Anggur, Rempah. Medium Dark roast dari Dataran Tinggi Plaga.',
            image: `${BASE_URL}/product-plaga.jpg`,
            offers: {
              '@type': 'Offer',
              price: '135000',
              priceCurrency: 'IDR',
            },
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: 'La Kintamani Coffee',
            description:
              'Cold brew dark roast dari Kintamani. Profil rasa: Kayu Kuat, Kacang Panggang, Bold & Pahit.',
            image: `${BASE_URL}/product-kintamani.jpg`,
            offers: {
              '@type': 'Offer',
              price: '120000',
              priceCurrency: 'IDR',
            },
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: 'La Pupuan Coffee',
            description:
              'Cold brew medium roast dari Pupuan. Profil rasa: Anggur Fermentasi, Nangka, Buah Liar. Karakter Liberika paling kuat.',
            image: `${BASE_URL}/product-pupuan.jpg`,
            offers: {
              '@type': 'Offer',
              price: '110000',
              priceCurrency: 'IDR',
            },
          },
        },
      ],
    },
    sameAs: SOCIAL_LINKS.map((s) => s.url),
  };

  return (
    <Helmet>
      {/* ── Basic ── */}
      <html lang={htmlLang} />
      <title>{finalTitle}</title>
      <meta name="description" content={finalDesc} />
      <meta
        name="keywords"
        content="cold brew bali, kopi liberika bali, helco bali, cold brew liberika, kopi arabika bali, kopi robusta bali, artisan cold brew bali, kopi kintamani, kopi plaga, kopi pupuan, umkm kopi bali, bali coffee"
      />
      <meta name="author" content="Helco Bali" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={finalUrl} />

      {/* ── Open Graph ── */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDesc} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta
        property="og:image:alt"
        content="Helco Bali Cold Brew – Arabika, Robusta & Liberika"
      />
      <meta property="og:site_name" content="Helco Bali" />
      <meta
        property="og:locale"
        content={lang === 'id' ? 'id_ID' : 'en_US'}
      />

      {/* ── Twitter Card ── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDesc} />
      <meta name="twitter:image" content={finalImage} />

      {/* ── Schema.org JSON-LD ── */}
      <script type="application/ld+json">
        {JSON.stringify(schemaOrg)}
      </script>
    </Helmet>
  );
}