/**
 * Shared Framer Motion animation variants.
 *
 * Centralising variants avoids duplicating identical objects in every
 * page / component and makes it easy to adjust the project-wide
 * motion language in one place.
 */

/** Fade-up entrance — used for headings, paragraphs, cards. */
export const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: [0.25, 0.1, 0.25, 1] },
  },
};

/** Stagger container — children animate in sequence. */
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

/** Continuous floating — gentle up/down for decorative icons. */
export const floating = {
  animate: {
    y: [0, -12, 0],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
};

/** Glow breathing — pulsing background light effect. */
export const glowBreathing = {
  animate: {
    scale: [1, 1.15, 1],
    opacity: [0.6, 1, 0.6],
    transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
  },
};

/** Slide in from right — used for modals and notifications. */
export const slideInRight = {
  hidden: { x: '100%', opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1, 
    transition: { type: 'spring', damping: 25, stiffness: 200 } 
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { duration: 0.2 }
  }
};
