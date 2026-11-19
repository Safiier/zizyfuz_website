import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { heroPhotos, photos } from './data/photos.js';

const email = 'zizyfuz@gmail.com';

const gallerySizes = '(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw';
const heroInterval = 6500;
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
function useHeaderMode() {
  const [mode, setMode] = useState('hero');

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const heroLimit = window.innerHeight * 0.72;

      if (y < heroLimit) {
        setMode('hero');
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
  }, []);

  return mode;
}

function Header() {
  const mode = useHeaderMode();

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
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const previousPositions = useRef([]);

  const goTo = useCallback((next) => setIndex(((next % count) + count) % count), [count]);
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const previous = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);
  const { handlers } = useSwipe(next, previous);

  // Auto-advance, unless paused, reduced motion, or the tab is hidden.
  useEffect(() => {
    if (count < 2 || paused || prefersReducedMotion()) return undefined;
    const timer = window.setInterval(() => {
      if (!document.hidden) next();
    }, heroInterval);
    return () => window.clearInterval(timer);
  }, [count, paused, next, index]);

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
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      {...handlers}
    >
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
                fetchPriority={i === 0 ? 'high' : 'low'}
                decoding={i === 0 ? 'sync' : 'async'}
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
          <div className="hero-dots" role="tablist" aria-label="Choose photo">
            {slides.map((photo, i) => (
              <button
                key={photo.slug}
                className={`hero-dot ${i === index ? 'hero-dot-active' : ''}`}
                onClick={() => goTo(i)}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={photo.title}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function About() {
  const aboutPhoto = photos.find((photo) => photo.slug === 'death-water') ?? photos[0];

  return (
    <section className="section about-section" id="about" aria-labelledby="about-title">
      <div className="about-image-frame">
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

function Gallery() {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const columnCount = useColumnCount();
  const columns = useMemo(
    () => distributeIntoColumns(photos, columnCount),
    [columnCount]
  );
  const selectedPhoto =
    selectedPhotoIndex === null ? null : photos[selectedPhotoIndex];

  const showPreviousPhoto = useCallback(() => {
    setSelectedPhotoIndex((currentIndex) =>
      currentIndex === null
        ? currentIndex
        : (currentIndex - 1 + photos.length) % photos.length
    );
  }, []);

  const showNextPhoto = useCallback(() => {
    setSelectedPhotoIndex((currentIndex) =>
      currentIndex === null ? currentIndex : (currentIndex + 1) % photos.length
    );
  }, []);

  const closeLightbox = useCallback(() => setSelectedPhotoIndex(null), []);

  return (
    <section className="section gallery-section" id="gallery" aria-label="Gallery">
      <div className="section-heading">
        <p className="eyebrow">Gallery</p>
      </div>

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
          index={selectedPhotoIndex}
          photo={selectedPhoto}
          onClose={closeLightbox}
          onNext={showNextPhoto}
          onPrevious={showPreviousPhoto}
        />
      )}
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

function Lightbox({ index, photo, onClose, onNext, onPrevious }) {
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
    preloadPhoto(photos[(index + 1) % photos.length]);
    preloadPhoto(photos[(index - 1 + photos.length) % photos.length]);
  }, [index]);

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
  return (
    <>
      <Header />
      <main>
        <Home />
        <About />
        <Gallery />
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
