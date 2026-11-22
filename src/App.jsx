// Design A — "Night Drive"
// Dark, cinematic. Each series is a full-screen chapter with a giant
// condensed title; series pages run like a sequence of film frames.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { heroPhotos, photos } from './data/photos.js';
import { photoCoordinates } from './data/places.js';
import { featuredPhotos, seriesByKey, seriesList } from './data/series.js';
import {
  Lightbox,
  distributeIntoColumns,
  email,
  heroInterval,
  prefersReducedMotion,
  useColumnCount,
  useHeaderMode,
  useRoute,
  useSwipe,
} from './core.jsx';

const logoSrc = `${import.meta.env.BASE_URL}logo-zizyfuz-mark.png`;

// Where the subject sits in each full-screen photo (CSS object-position),
// so cropping for wide or tall screens keeps it in view.
const focus = {
  'bipenggou-11': '50% 50%',
  'dawn-tree-end': '72% 50%',
  'genie-tree-and-peak': '70% 45%',
  'ulan-butong-watering-place': '72% 60%',
  'ulan-butong-birch-wall': '50% 40%',
  'huangshan-first-light': '78% 30%',
  'wytham-dawn-horse': '56% 55%',
  'chongqing-10': '50% 45%',
};
const focusStyle = (photo) => ({ objectPosition: focus[photo.slug] ?? '50% 50%' });

// Series titles stay on one line on computer screens and are sized so they
// sit in the empty lower part of each cover. Only covers whose lower part
// is open ground get the larger title.
const largeTitles = new Set(['western-sichuan']);
const chapterClass = (series) => (largeTitles.has(series.key) ? 'title-large' : 'title-medium');

// ---------------------------------------------------------------------------
// Lightbox state shared by every grid on a page
function useLightbox(items) {
  const [index, setIndex] = useState(null);
  const open = useCallback((i) => setIndex(i), []);
  const close = useCallback(() => setIndex(null), []);
  const next = useCallback(
    () => setIndex((i) => (i === null ? i : (i + 1) % items.length)),
    [items]
  );
  const previous = useCallback(
    () => setIndex((i) => (i === null ? i : (i - 1 + items.length) % items.length)),
    [items]
  );
  const view =
    index === null ? null : (
      <Lightbox
        items={items}
        index={index}
        photo={items[index]}
        onClose={close}
        onNext={next}
        onPrevious={previous}
      />
    );
  return { open, view };
}

function Photo({ photo, sizes, eager = false, onOpen }) {
  return (
    <button
      className={`frame ${photo.orientation === 'landscape' ? '' : 'is-upright'}`}
      type="button"
      onClick={onOpen}
      style={{ '--ratio': `${photo.width} / ${photo.height}`, '--grow': photo.width / photo.height }}
      aria-label={`Open ${photo.title}`}
    >
      <img
        src={photo.src}
        srcSet={photo.srcSet}
        sizes={sizes}
        alt={photo.alt ?? photo.title}
        width={photo.width}
        height={photo.height}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
    </button>
  );
}

// Ordered masonry (Selected work, All works)
function Masonry({ items }) {
  const columnCount = useColumnCount();
  const columns = useMemo(() => distributeIntoColumns(items, columnCount), [items, columnCount]);
  const { open, view } = useLightbox(items);

  return (
    <>
      <div className="masonry">
        {columns.map((column, c) => (
          <div className="masonry-column" key={c}>
            {column.map(({ photo, index }) => (
              <Photo
                key={photo.slug}
                photo={photo}
                eager={index < 6}
                sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw"
                onOpen={() => open(index)}
              />
            ))}
          </div>
        ))}
      </div>
      {view}
    </>
  );
}

// Series pages: landscapes run full width, portraits and squares pair up,
// like a sequence of frames.
function Sequence({ items }) {
  const { open, view } = useLightbox(items);
  const rows = useMemo(() => {
    const result = [];
    let pending = null;
    items.forEach((photo, index) => {
      const upright = photo.orientation !== 'landscape';
      if (upright) {
        if (pending) {
          result.push([pending, { photo, index }]);
          pending = null;
        } else {
          pending = { photo, index };
        }
      } else {
        result.push([{ photo, index }]);
      }
    });
    if (pending) result.push([pending]);
    return result;
  }, [items]);

  return (
    <>
      <div className="sequence">
        {rows.map((row) => (
          <div className={`sequence-row sequence-row-${row.length}`} key={row[0].photo.slug}>
            {row.map(({ photo, index }) => (
              <Photo
                key={photo.slug}
                photo={photo}
                eager={index < 2}
                sizes={row.length === 1 ? '(max-width: 1600px) 100vw, 1600px' : '(max-width: 700px) 100vw, 50vw'}
                onOpen={() => open(index)}
              />
            ))}
          </div>
        ))}
      </div>
      {view}
    </>
  );
}

// ---------------------------------------------------------------------------
function Header({ overHero }) {
  const mode = useHeaderMode(overHero);
  return (
    <header className={`header header-${mode}`}>
      <a className="brand" href="#home" aria-label="zizyfuz home">
        <img src={logoSrc} alt="" aria-hidden="true" />
        <span>zizyfuz</span>
      </a>
      <nav className="nav" aria-label="Primary navigation">
        <a href="#about">About</a>
        <a href="#series">Series</a>
        <a href="#selected">Selected</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>
  );
}

function Hero() {
  const slides = heroPhotos.length ? heroPhotos : [photos[0]];
  const count = slides.length;
  const [startIndex] = useState(() => Math.floor(Math.random() * count));
  const [index, setIndex] = useState(startIndex);
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const previous = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);
  const { handlers } = useSwipe(next, previous);

  useEffect(() => {
    if (count < 2 || prefersReducedMotion()) return undefined;
    const timer = window.setInterval(() => {
      if (!document.hidden) next();
    }, heroInterval);
    return () => window.clearInterval(timer);
  }, [count, next, index]);

  const current = slides[index];

  return (
    <section className="hero" id="home" aria-label="zizyfuz photography" {...handlers}>
      <h1 className="visually-hidden">
        Zizyfuz Photography — landscape, wildlife and travel photography
      </h1>
      {slides.map((photo, i) => (
        <div className={`hero-slide ${i === index ? 'is-active' : ''}`} key={photo.slug} aria-hidden={i !== index}>
          <img
            src={photo.src}
            srcSet={photo.srcSet}
            sizes="(max-aspect-ratio: 16/9) 178vh, 100vw"
            alt={photo.alt ?? photo.title}
            style={focusStyle(photo)}
            fetchPriority={i === startIndex ? 'high' : 'low'}
          />
        </div>
      ))}
      <div className="hero-shade" aria-hidden="true" />
      <div className="hero-foot">
        <p className="hero-wordmark" aria-hidden="true">zizyfuz</p>
        <p className="hero-caption" key={current.slug}>
          <span>{current.place}</span>
          <span className="coordinates">{photoCoordinates(current)}</span>
        </p>
      </div>
      {count > 1 && (
        <>
          <button className="hero-arrow hero-arrow-previous" onClick={previous} type="button" aria-label="Previous photo">
            <ChevronLeft size={28} strokeWidth={1.25} aria-hidden="true" />
          </button>
          <button className="hero-arrow hero-arrow-next" onClick={next} type="button" aria-label="Next photo">
            <ChevronRight size={28} strokeWidth={1.25} aria-hidden="true" />
          </button>
        </>
      )}
    </section>
  );
}

// The chapter is clickable but deliberately not an <a href>: a real link makes
// the browser show its address in the bottom-left corner on hover, right over
// the coordinates.
function Chapter({ series }) {
  const cover = series.coverPhoto;
  const open = () => {
    window.location.hash = `series-${series.key}`;
  };
  return (
    <div
      className={`chapter ${chapterClass(series)}`}
      role="link"
      tabIndex={0}
      aria-label={`${series.title}, ${series.years}`}
      onClick={open}
      onKeyDown={(event) => {
        if (event.key === 'Enter') open();
      }}
    >
      <img
        className="chapter-image"
        src={cover.src}
        srcSet={cover.srcSet}
        sizes="(max-aspect-ratio: 16/9) 178vh, 100vw"
        alt={cover.alt ?? series.title}
        style={focusStyle(cover)}
        loading="lazy"
        decoding="async"
      />
      <span className="chapter-shade" aria-hidden="true" />
      <span className="chapter-text">
        <span className="chapter-title">{series.title}</span>
        <span className="chapter-meta">
          <span>{series.years}</span>
          <span className="coordinates">{series.coordinates}</span>
        </span>
      </span>
    </div>
  );
}

function SeriesChapters() {
  return (
    <section className="chapters" id="series" aria-label="Series">
      {/* Invisible stops, one screen apart, that the page snaps to so each
          cover fills the screen exactly after a scroll. (The covers themselves
          are sticky, so they can't be used as stops.) */}
      {seriesList.map((series, i) => (
        <span className="chapter-stop" style={{ '--i': i }} key={`stop-${series.key}`} aria-hidden="true" />
      ))}
      {seriesList.map((series) => (
        <Chapter series={series} key={series.key} />
      ))}
    </section>
  );
}

function Selected() {
  return (
    <section className="block selected" id="selected" aria-labelledby="selected-title">
      <h2 className="block-title" id="selected-title">Selected work</h2>
      <Masonry items={featuredPhotos} />
      <a className="text-link" href="#archive">View all works</a>
    </section>
  );
}

function About() {
  const photo = photos.find((p) => p.slug === 'genyen-walking-on') ?? photos[0];
  return (
    <section className="block about" id="about" aria-labelledby="about-title">
      <div className="about-photo" style={{ aspectRatio: `${photo.width} / ${photo.height}` }}>
        <img src={photo.src} srcSet={photo.srcSet} sizes="(max-width: 900px) 100vw, 55vw" alt={photo.alt} loading="lazy" />
      </div>
      <div className="about-text">
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

function Contact() {
  return (
    <section className="block contact" id="contact" aria-labelledby="contact-title">
      <h2 className="visually-hidden" id="contact-title">Contact</h2>
      <a className="contact-email" href={`mailto:${email}`}>{email}</a>
      <div className="contact-links">
        <a href="https://www.instagram.com/zizyfuzfoto">Instagram</a>
        <a href="https://xhslink.com/m/2RsUq7tFlJr">Xiaohongshu</a>
      </div>
    </section>
  );
}

function SeriesPage({ series }) {
  const position = seriesList.findIndex((s) => s.key === series.key);
  const next = seriesList[(position + 1) % seriesList.length];
  const cover = series.coverPhoto;

  return (
    <>
      <header className={`series-cover ${chapterClass(series)}`}>
        <img
          src={cover.src}
          srcSet={cover.srcSet}
          sizes="(max-aspect-ratio: 16/9) 178vh, 100vw"
          alt={cover.alt}
          style={focusStyle(cover)}
        />
        <span className="chapter-shade" aria-hidden="true" />
        <div className="chapter-text">
          <a className="back-link" href="#series">All series</a>
          <h1 className="chapter-title">{series.title}</h1>
          <p className="chapter-meta">
            <span>{series.years}</span>
            <span className="coordinates">{series.coordinates}</span>
          </p>
          {series.intro && <p className="series-intro">{series.intro}</p>}
        </div>
      </header>
      <section className="block" aria-label={`${series.title} photographs`}>
        <Sequence items={series.items} />
      </section>
      {next.key !== series.key && (
        <nav className="next-chapter" aria-label="Next series">
          <p className="next-label">Next series</p>
          <Chapter series={next} />
        </nav>
      )}
    </>
  );
}

function ArchivePage() {
  return (
    <section className="block archive" aria-labelledby="archive-title">
      <a className="back-link" href="#selected">Selected work</a>
      <h1 className="page-title" id="archive-title">All works</h1>
      <Masonry items={photos} />
    </section>
  );
}

export default function App() {
  const route = useRoute();
  const series = route.view === 'series' ? seriesByKey[route.key] : null;

  useEffect(() => {
    document.title = series
      ? `${series.title} · Zizyfuz Photography`
      : route.view === 'archive'
        ? 'All works · Zizyfuz Photography'
        : 'Zizyfuz Photography';
  }, [route, series]);

  return (
    <>
      <Header overHero={route.view !== 'archive'} key={route.view + (route.key ?? '')} />
      <main>
        {route.view === 'main' && (
          <>
            <Hero />
            <About />
            <SeriesChapters />
            <Selected />
          </>
        )}
        {series && <SeriesPage series={series} key={series.key} />}
        {route.view === 'archive' && <ArchivePage />}
        <Contact />
      </main>
      <footer className="footer">
        <span>© 2026 zizyfuz</span>
        <span>All photographs reserved</span>
      </footer>
    </>
  );
}
