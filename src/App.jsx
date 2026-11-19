import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { heroPhotos, photos } from './data/photos.js';
import { featuredPhotos, seriesByKey, seriesList } from './data/series.js';

const email = 'zizyfuz@gmail.com';

const gallerySizes = '(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw';
const heroInterval = 8000;
const swipeThreshold = 45;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// "Huangshan, Anhui · 2026"
const photoCaption = (photo) =>
  [photo.place, photo.year].filter(Boolean).join(' · ');

// Number of masonry columns for the current screen width.
function useColumnCount() {
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
function distributeIntoColumns(items, columnCount) {
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
function useSwipe(onSwipeLeft, onSwipeRight) {
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
function parseHash() {
  const hash = decodeURIComponent(window.location.hash.slice(1));
  if (hash === 'archive') return { view: 'archive' };
  if (hash.startsWith('series-') && seriesByKey[hash.slice(7)]) {
    return { view: 'series', key: hash.slice(7) };
  }
  return { view: 'main', anchor: hash };
}

const routeViewKey = (route) =>
  route.view === 'series' ? `series-${route.key}` : route.view;

function useRoute() {
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
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [route]);

  return route;
}

function Logo() {
  return (
    <a className="logo" href="#home" aria-label="zizyfuz home">
      <img
        className="logo-image"
        src={`${import.meta.env.BASE_URL}logo-zizyfuz-mark.png`}
        alt=""
        aria-hidden="true"
      />
      <span className="logo-name">zizyfuz</span>
    </a>
  );
}

// Header modes:
// - "hero": large transparent navigation over the home slideshow
// - "compact": slim light bar that slides in when the visitor scrolls up
// - "hidden": scrolled down past the hero
function useHeaderMode(overHero) {
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

function Header({ overHero }) {
  const mode = useHeaderMode(overHero);

  return (
    <header className={`site-header site-header-${mode}`}>
      <nav className="nav-links" aria-label="Primary navigation">
        <div className="nav-group nav-group-left">
          <a href="#home">Home</a>
          <a href="#about">About</a>
        </div>
        <Logo />
        <div className="nav-group nav-group-right">
          <a href="#gallery">Gallery</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>
    </header>
  );
}

function Home() {
  const slides = heroPhotos.length ? heroPhotos : [photos[0]];
  const count = slides.length;
  // Start on a random slide each time the page is opened.
  const [startIndex] = useState(() => Math.floor(Math.random() * count));
  const [index, setIndex] = useState(startIndex);
  const previousPositions = useRef([]);

  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const previous = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);
  const { handlers } = useSwipe(next, previous);

  // Auto-advance every 8 seconds. The timer restarts after a manual change, and
  // it waits while the browser tab is hidden. (Not paused on hover: the hero
  // fills the screen, so the pointer is almost always over it.)
  useEffect(() => {
    if (count < 2 || prefersReducedMotion()) return undefined;
    const timer = window.setInterval(() => {
      if (!document.hidden) next();
    }, heroInterval);
    return () => window.clearInterval(timer);
  }, [count, next, index]);

  // Each slide sits at a horizontal position relative to the current one:
  // -1 = just left, 0 = on screen, 1.. = to the right. Slides that wrap from
  // one end to the other jump without animating, so they never sweep across.
  const positions = slides.map((_, i) => ((i - index + count + 1) % count) - 1);
  const lastPositions = previousPositions.current;
  useEffect(() => {
    previousPositions.current = positions;
  });

  return (
    <section
      className="hero"
      id="home"
      aria-label="zizyfuz photography home"
      aria-roledescription="carousel"
      {...handlers}
    >
      <h1 className="visually-hidden">
        Zizyfuz Photography — landscape, wildlife and travel photography
      </h1>
      <div className="hero-track">
        {slides.map((photo, i) => {
          const position = positions[i];
          const jumped =
            lastPositions[i] !== undefined && Math.abs(lastPositions[i] - position) > 1;
          return (
            <div
              className={`hero-slide ${jumped ? 'hero-slide-jump' : ''}`}
              key={photo.slug}
              style={{ transform: `translate3d(${position * 100}%, 0, 0)` }}
              aria-hidden={position !== 0}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
            >
              <img
                className="hero-image"
                src={photo.src}
                srcSet={photo.srcSet}
                sizes="(max-aspect-ratio: 16/9) 178vh, 100vw"
                alt={photo.alt ?? photo.title}
                fetchPriority={i === startIndex ? 'high' : 'low'}
                decoding={i === startIndex ? 'sync' : 'async'}
              />
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <button
            className="hero-arrow hero-arrow-previous"
            onClick={previous}
            type="button"
            aria-label="Previous photo"
          >
            <ChevronLeft size={30} strokeWidth={1.25} aria-hidden="true" />
          </button>
          <button
            className="hero-arrow hero-arrow-next"
            onClick={next}
            type="button"
            aria-label="Next photo"
          >
            <ChevronRight size={30} strokeWidth={1.25} aria-hidden="true" />
          </button>
        </>
      )}
    </section>
  );
}

function About() {
  const aboutPhoto = photos.find((photo) => photo.slug === 'genyen-walking-on') ?? photos[0];

  return (
    <section className="section about-section" id="about" aria-labelledby="about-title">
      <div
        className="about-image-frame"
        style={{ aspectRatio: `${aboutPhoto.width} / ${aboutPhoto.height}` }}
      >
        <img
          src={aboutPhoto.src}
          srcSet={aboutPhoto.srcSet}
          sizes="(max-width: 900px) 100vw, 55vw"
          alt={aboutPhoto.alt ?? aboutPhoto.title}
          loading="lazy"
        />
      </div>
      <div className="about-copy">
        <p className="eyebrow">About</p>
        <h2 id="about-title">“You are the first audience of your own life.”</h2>
        <p>
          I have lived in Chongqing, Singapore, and currently pursuing a degree
          in the UK. I plan the journeys and explore the vast world through road
          trips. Let photography be the channel that guides you to view the
          world and yourself.
        </p>
      </div>
    </section>
  );
}

// Ordered masonry grid with its own lightbox. Used by Selected Works,
// series pages and All Works.
function PhotoGrid({ items }) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const columnCount = useColumnCount();
  const columns = useMemo(
    () => distributeIntoColumns(items, columnCount),
    [items, columnCount]
  );
  const selectedPhoto =
    selectedPhotoIndex === null ? null : items[selectedPhotoIndex];

  const showPreviousPhoto = useCallback(() => {
    setSelectedPhotoIndex((currentIndex) =>
      currentIndex === null
        ? currentIndex
        : (currentIndex - 1 + items.length) % items.length
    );
  }, [items]);

  const showNextPhoto = useCallback(() => {
    setSelectedPhotoIndex((currentIndex) =>
      currentIndex === null ? currentIndex : (currentIndex + 1) % items.length
    );
  }, [items]);

  const closeLightbox = useCallback(() => setSelectedPhotoIndex(null), []);

  return (
    <>
      <div className="photo-grid">
        {columns.map((column, columnIndex) => (
          <div className="photo-column" key={columnIndex}>
            {column.map(({ photo, index }) => (
              <button
                className={`photo-card ${photo.orientation}`}
                key={photo.slug}
                onClick={() => setSelectedPhotoIndex(index)}
                style={{ '--photo-aspect-ratio': `${photo.width} / ${photo.height}` }}
                type="button"
                aria-label={`Open ${photo.title}`}
              >
                <img
                  src={photo.src}
                  srcSet={photo.srcSet}
                  sizes={gallerySizes}
                  alt={photo.alt ?? photo.title}
                  width={photo.width}
                  height={photo.height}
                  loading={index < 6 ? 'eager' : 'lazy'}
                  decoding="async"
                />
              </button>
            ))}
          </div>
        ))}
      </div>

      {selectedPhoto && (
        <Lightbox
          items={items}
          index={selectedPhotoIndex}
          photo={selectedPhoto}
          onClose={closeLightbox}
          onNext={showNextPhoto}
          onPrevious={showPreviousPhoto}
        />
      )}
    </>
  );
}

function SeriesIndex() {
  return (
    <div className="series-index" id="series">
      <div className="section-heading">
        <p className="eyebrow">Series</p>
      </div>
      <div className="series-cards">
        {seriesList.map((series) => (
          <a className="series-card" href={`#series-${series.key}`} key={series.key}>
            <div className="series-card-image">
              <img
                src={series.coverPhoto.src}
                srcSet={series.coverPhoto.srcSet}
                sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw"
                alt={series.coverPhoto.alt ?? series.title}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="series-card-text">
              <h3>{series.title}</h3>
              <p>{series.years}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function Gallery() {
  return (
    <section className="section gallery-section" id="gallery" aria-label="Selected works">
      <SeriesIndex />
      <div className="section-heading selected-heading">
        <p className="eyebrow">Selected Works</p>
      </div>
      <PhotoGrid items={featuredPhotos} />
      <a className="all-works-link" href="#archive">
        View all works
      </a>
    </section>
  );
}

function SeriesPage({ series }) {
  const position = seriesList.findIndex((item) => item.key === series.key);
  const previous = seriesList[(position - 1 + seriesList.length) % seriesList.length];
  const next = seriesList[(position + 1) % seriesList.length];

  return (
    <section className="section page-section" aria-labelledby="page-title">
      <a className="back-link" href="#series">← All series</a>
      <header className="page-header">
        <p className="eyebrow">Series</p>
        <h1 id="page-title">{series.title}</h1>
        <p className="page-meta">{series.years}</p>
        {series.intro && <p className="page-intro">{series.intro}</p>}
      </header>
      <PhotoGrid items={series.items} />
      {seriesList.length > 1 && (
        <nav className="series-pager" aria-label="Other series">
          <a href={`#series-${previous.key}`}>
            <span>Previous series</span>
            {previous.title}
          </a>
          <a href={`#series-${next.key}`}>
            <span>Next series</span>
            {next.title}
          </a>
        </nav>
      )}
    </section>
  );
}

function ArchivePage() {
  return (
    <section className="section page-section" aria-labelledby="page-title">
      <a className="back-link" href="#gallery">← Selected works</a>
      <header className="page-header">
        <p className="eyebrow">Archive</p>
        <h1 id="page-title">All Works</h1>
      </header>
      <PhotoGrid items={photos} />
    </section>
  );
}

// Quietly download the neighbouring photos so arrows and swipes feel instant.
function preloadPhoto(photo) {
  if (!photo) return;
  const image = new Image();
  image.sizes = '96vw';
  image.srcset = photo.srcSet;
  image.src = photo.src;
}

function Lightbox({ items, index, photo, onClose, onNext, onPrevious }) {
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

function Contact() {
  return (
    <section className="section contact-section" id="contact" aria-label="Contact">
      <div className="contact-panel">
        <p className="eyebrow">Contact</p>
        <a className="email-link" href={`mailto:${email}`}>{email}</a>
        <div className="social-links" aria-label="Social media links">
          <a href="https://www.instagram.com/zizyfuzfoto">Instagram</a>
          <a href="https://xhslink.com/m/2RsUq7tFlJr">Xiaohongshu</a>
        </div>
      </div>
    </section>
  );
}

function App() {
  const route = useRoute();
  const series = route.view === 'series' ? seriesByKey[route.key] : null;

  useEffect(() => {
    document.title = series
      ? `${series.title} · Zizyfuz Photography`
      : route.view === 'archive'
        ? 'All Works · Zizyfuz Photography'
        : 'Zizyfuz Photography';
  }, [route, series]);

  return (
    <>
      <Header overHero={route.view === 'main'} key={route.view} />
      <main>
        {route.view === 'main' && (
          <>
            <Home />
            <About />
            <Gallery />
          </>
        )}
        {series && <SeriesPage series={series} key={series.key} />}
        {route.view === 'archive' && <ArchivePage />}
        <Contact />
      </main>
      <footer className="site-footer">
        <Logo />
        <p>© 2026 zizyfuz. All photographs reserved.</p>
      </footer>
    </>
  );
}

export default App;
