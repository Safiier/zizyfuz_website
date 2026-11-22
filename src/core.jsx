// Shared building blocks used by every page design: routing, ordered masonry,
// swipe detection, the enlarged-photo view (lightbox) and the header modes.
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { seriesByKey } from './data/series.js';

export const email = 'zizyfuz@gmail.com';
export const heroInterval = 8000;
const swipeThreshold = 45;

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// "Huangshan, Anhui · 2026"
export const photoCaption = (photo) =>
  [photo.place, photo.year].filter(Boolean).join(' · ');

// Number of masonry columns for the current screen width.
export function useColumnCount() {
  const getCount = () => {
    if (typeof window === 'undefined') return 3;
    if (window.matchMedia('(max-width: 640px)').matches) return 1;
    if (window.matchMedia('(max-width: 900px)').matches) return 2;
    return 3;
  };
  const [count, setCount] = useState(getCount);

  useEffect(() => {
    const update = () => setCount(getCount());
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return count;
}

// Place photos one by one into the currently shortest column, so the visual
// order follows the curated order in photos.js (left to right, top to bottom).
export function distributeIntoColumns(items, columnCount) {
  const columns = Array.from({ length: columnCount }, () => []);
  const heights = new Array(columnCount).fill(0);
  const gapAllowance = 0.04;

  items.forEach((photo, index) => {
    let target = 0;
    for (let column = 1; column < columnCount; column += 1) {
      if (heights[column] < heights[target] - 0.001) target = column;
    }
    columns[target].push({ photo, index });
    heights[target] += photo.height / photo.width + gapAllowance;
  });

  return columns;
}

// Horizontal swipe detection for touch screens. Returns handlers to spread on
// an element and a ref that is true right after a swipe (to ignore the click
// that some browsers fire at the end of the gesture).
export function useSwipe(onSwipeLeft, onSwipeRight) {
  const start = useRef(null);
  const justSwiped = useRef(false);

  const onTouchStart = (event) => {
    const touch = event.touches[0];
    start.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (event) => {
    if (!start.current) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.current.x;
    const dy = touch.clientY - start.current.y;
    start.current = null;

    if (Math.abs(dx) > swipeThreshold && Math.abs(dx) > Math.abs(dy) * 1.2) {
      justSwiped.current = true;
      window.setTimeout(() => {
        justSwiped.current = false;
      }, 450);
      if (dx < 0) onSwipeLeft();
      else onSwipeRight();
    }
  };

  return { handlers: { onTouchStart, onTouchEnd }, justSwiped };
}

// Simple hash routing (plain "#name" hashes only):
//   #series-<key>  -> a series page
//   #archive       -> all works
//   anything else  -> the main page, scrolled to that section (#about ...)
export function parseHash() {
  const hash = decodeURIComponent(window.location.hash.slice(1));
  if (hash === 'archive') return { view: 'archive' };
  if (hash.startsWith('series-') && seriesByKey[hash.slice(7)]) {
    return { view: 'series', key: hash.slice(7) };
  }
  return { view: 'main', anchor: hash };
}

export const routeViewKey = (route) =>
  route.view === 'series' ? `series-${route.key}` : route.view;

export function useRoute() {
  const [route, setRoute] = useState(parseHash);
  const previousViewKey = useRef(null);

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // When we move to a DIFFERENT page (home ↔ a series ↔ all works), jump
  // straight to the right spot before the new page is painted: no scrolling
  // animation across the old page. Links within the same page (e.g. Home →
  // Gallery) keep the browser's normal smooth scroll.
  useLayoutEffect(() => {
    const viewKey = routeViewKey(route);
    const changedPage = previousViewKey.current !== viewKey;
    previousViewKey.current = viewKey;
    if (!changedPage) return;

    const target =
      route.view === 'main' && route.anchor ? document.getElementById(route.anchor) : null;
    if (target) {
      // Jump straight to the target, rounded up to a whole pixel so a
      // full-screen section never leaves a hairline of the one above it.
      const y = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: Math.ceil(y - 0.01), left: 0, behavior: 'instant' });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [route]);

  return route;
}

// Header modes:
// - "hero": large transparent navigation over the home slideshow
// - "compact": slim light bar that slides in when the visitor scrolls up
// - "hidden": scrolled down past the hero
export function useHeaderMode(overHero) {
  const [mode, setMode] = useState(overHero ? 'hero' : 'compact');

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const heroLimit = window.innerHeight * 0.72;

      if (overHero && y < heroLimit) {
        setMode('hero');
      } else if (!overHero && y < 80) {
        setMode('compact');
      } else if (y < lastY - 4) {
        setMode('compact');
      } else if (y > lastY + 4) {
        setMode('hidden');
      }
      lastY = y;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [overHero]);

  return mode;
}

// Quietly download the neighbouring photos so arrows and swipes feel instant.
export function preloadPhoto(photo) {
  if (!photo) return;
  const image = new Image();
  image.sizes = '96vw';
  image.srcset = photo.srcSet;
  image.src = photo.src;
}

export function Lightbox({ items, index, photo, onClose, onNext, onPrevious }) {
  const { handlers, justSwiped } = useSwipe(onNext, onPrevious);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') onPrevious();
      if (event.key === 'ArrowRight') onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrevious]);

  // Stop the page behind from scrolling while the lightbox is open.
  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  useEffect(() => {
    preloadPhoto(items[(index + 1) % items.length]);
    preloadPhoto(items[(index - 1 + items.length) % items.length]);
  }, [items, index]);

  const ignoreIfSwiped = (action) => (event) => {
    event.stopPropagation();
    if (!justSwiped.current) action();
  };

  return (
    <div
      className="lightbox"
      onClick={ignoreIfSwiped(onClose)}
      role="dialog"
      aria-modal="true"
      aria-label={`${photo.title} enlarged view`}
      {...handlers}
    >
      <button className="lightbox-close" onClick={ignoreIfSwiped(onClose)} type="button" aria-label="Close">
        <X size={22} aria-hidden="true" />
      </button>
      <button
        className="lightbox-nav lightbox-nav-previous"
        onClick={ignoreIfSwiped(onPrevious)}
        type="button"
        aria-label="Previous photo"
      >
        <ChevronLeft size={30} aria-hidden="true" />
      </button>
      <button
        className="lightbox-nav lightbox-nav-next"
        onClick={ignoreIfSwiped(onNext)}
        type="button"
        aria-label="Next photo"
      >
        <ChevronRight size={30} aria-hidden="true" />
      </button>
      <figure
        className="lightbox-frame"
        key={photo.slug}
        onClick={(event) => event.stopPropagation()}
        style={{ '--ratio': photo.width / photo.height }}
      >
        <img
          src={photo.src}
          srcSet={photo.srcSet}
          sizes="96vw"
          alt={photo.alt ?? photo.title}
        />
        <figcaption className="lightbox-caption">{photoCaption(photo)}</figcaption>
      </figure>
    </div>
  );
}
