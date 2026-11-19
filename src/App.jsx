// Design B — "Exhibition"
// A light gallery wall. Photographs hang as framed, matted prints with
// wall labels; the series read as a big-type index of the show.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { heroPhotos, photos } from './data/photos.js';
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

// ---------------------------------------------------------------------------
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

// A framed print: thin frame, white mat, the photograph, a soft shadow.
function Print({ photo, sizes, eager = false, framed = true, onOpen, className = '', style }) {
  const img = (
    <img
      src={photo.src}
      srcSet={photo.srcSet}
      sizes={sizes}
      alt={photo.alt ?? photo.title}
      width={photo.width}
      height={photo.height}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
    />
  );
  const classes = `print ${framed ? 'print-framed' : 'print-plain'} ${className}`;
  if (!onOpen) {
    return (
      <span className={classes} style={style}>
        <span className="print-mat">{img}</span>
      </span>
    );
  }
  return (
    <button className={classes} style={style} type="button" onClick={onOpen} aria-label={`Open ${photo.title}`}>
      <span className="print-mat">{img}</span>
    </button>
  );
}

function WallLabel({ photo, className = '' }) {
  return (
    <span className={`wall-label ${className}`}>
      <span>{photo.place}</span>
      <span>{photo.year}</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
function Header() {
  const mode = useHeaderMode(false);
  return (
    <header className={`header header-${mode}`}>
      <a className="brand" href="#home" aria-label="zizyfuz home">
        <img src={logoSrc} alt="" aria-hidden="true" />
      </a>
      <nav className="nav" aria-label="Primary navigation">
        <a href="#series">Series</a>
        <a href="#selected">Selected</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>
  );
}

// First screen: the wordmark, then one print on the wall, changing every 8s.
function Entrance() {
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
    <section className="entrance" id="home" aria-label="zizyfuz photography">
      <h1 className="visually-hidden">
        Zizyfuz Photography — landscape, wildlife and travel photography
      </h1>
      <p className="wordmark" aria-hidden="true">zizyfuz</p>
      <p className="strapline">Landscape, wildlife and road-trip photography</p>

      <div className="feature-wall" {...handlers}>
        <div className="feature-stage">
          {slides.map((photo, i) => (
            <div
              className={`feature-slide ${i === index ? 'is-active' : ''}`}
              key={photo.slug}
              aria-hidden={i !== index}
            >
              <Print
                photo={photo}
                eager={i === startIndex}
                sizes="(max-width: 700px) 92vw, 70vw"
              />
            </div>
          ))}
        </div>
        <WallLabel photo={current} className="feature-label" key={current.slug} />
        {count > 1 && (
          <>
            <button className="hero-arrow hero-arrow-previous" onClick={previous} type="button" aria-label="Previous photo">
              <ChevronLeft size={26} strokeWidth={1.25} aria-hidden="true" />
            </button>
            <button className="hero-arrow hero-arrow-next" onClick={next} type="button" aria-label="Next photo">
              <ChevronRight size={26} strokeWidth={1.25} aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}

// Series as a big-type index. On hover, the cover floats beside the cursor.
function SeriesIndex() {
  const [hover, setHover] = useState(null);
  const floatRef = useRef(null);

  const move = (event) => {
    const el = floatRef.current;
    if (el) el.style.transform = `translate3d(${event.clientX + 28}px, ${event.clientY - 120}px, 0)`;
  };

  return (
    <section className="block series-index" id="series" aria-labelledby="series-title">
      <h2 className="section-title" id="series-title">Series</h2>
      <ul className="index-list" onMouseMove={move} onMouseLeave={() => setHover(null)}>
        {seriesList.map((series) => (
          <li key={series.key}>
            <a
              className={`index-row ${hover === series.key ? 'is-hovered' : ''}`}
              href={`#series-${series.key}`}
              onMouseEnter={() => setHover(series.key)}
            >
              <Print
                photo={series.coverPhoto}
                framed={false}
                className="index-thumb"
                sizes="30vw"
              />
              <span className="index-title">{series.title}</span>
              <span className="index-years">{series.years}</span>
            </a>
          </li>
        ))}
      </ul>
      <div className={`index-float ${hover ? 'is-visible' : ''}`} ref={floatRef} aria-hidden="true">
        {seriesList.map((series) => (
          <Print
            key={series.key}
            photo={series.coverPhoto}
            className={hover === series.key ? 'is-current' : ''}
            sizes="22rem"
          />
        ))}
      </div>
    </section>
  );
}

// Salon hang: rows of two or three prints of deliberately different sizes,
// centred on a shared line, keeping the curated order.
const rowPattern = [3, 2, 3, 2, 2];
const scalePattern = [1, 0.8, 1.15, 0.9, 1.05, 0.85, 1.2];

function salonRows(items) {
  const rows = [];
  let i = 0;
  let r = 0;
  while (i < items.length) {
    const count = Math.min(rowPattern[r % rowPattern.length], items.length - i);
    const row = items.slice(i, i + count).map((photo, k) => {
      const index = i + k;
      const scale = scalePattern[index % scalePattern.length];
      const aspect = photo.width / photo.height;
      // Upright prints hang a little taller so they don't look lost.
      const weight = aspect * scale * (aspect < 1 ? 1.45 : 1);
      return { photo, index, scale, weight };
    });
    rows.push(row);
    i += count;
    r += 1;
  }
  return rows;
}

function Salon({ items }) {
  const rows = useMemo(() => salonRows(items), [items]);
  const { open, view } = useLightbox(items);
  return (
    <>
      <div className="salon">
        {rows.map((row) => (
          <div className={`salon-row salon-row-${row.length}`} key={row[0].photo.slug}>
            {row.map(({ photo, index, weight }) => (
              <figure
                className={`salon-item ${photo.orientation === 'landscape' ? 'is-landscape' : 'is-upright'}`}
                key={photo.slug}
                style={{ '--grow': weight }}
              >
                <Print
                  photo={photo}
                  eager={index < 4}
                  sizes="(max-width: 700px) 90vw, 40vw"
                  onOpen={() => open(index)}
                />
                <figcaption className="wall-label">
                  <span>{photo.place}</span>
                  <span>{photo.year}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        ))}
      </div>
      {view}
    </>
  );
}

function Selected() {
  return (
    <section className="block selected" id="selected" aria-labelledby="selected-title">
      <h2 className="section-title" id="selected-title">Selected works</h2>
      <Salon items={featuredPhotos} />
      <p className="link-row">
        <a className="text-link" href="#archive">View all works</a>
      </p>
    </section>
  );
}

function About() {
  const photo = photos.find((p) => p.slug === 'genyen-walking-on') ?? photos[0];
  return (
    <section className="block about" id="about" aria-labelledby="about-title">
      <div className="about-print">
        <Print photo={photo} sizes="(max-width: 900px) 90vw, 45vw" />
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
      <h2 className="section-title" id="contact-title">Contact</h2>
      <a className="contact-email" href={`mailto:${email}`}>{email}</a>
      <div className="contact-links">
        <a href="https://www.instagram.com/zizyfuzfoto">Instagram</a>
        <a href="https://xhslink.com/m/2RsUq7tFlJr">Xiaohongshu</a>
      </div>
    </section>
  );
}

// Series page: one print at a time, alternating sides, label opposite.
function SeriesPage({ series }) {
  const position = seriesList.findIndex((s) => s.key === series.key);
  const next = seriesList[(position + 1) % seriesList.length];
  const { open, view } = useLightbox(series.items);

  return (
    <>
      <section className="block series-head" aria-labelledby="series-page-title">
        <a className="back-link" href="#series">All series</a>
        <h1 className="series-name" id="series-page-title">{series.title}</h1>
        <p className="series-years">{series.years}</p>
        {series.intro && <p className="series-intro">{series.intro}</p>}
      </section>
      <section className="block hang" aria-label={`${series.title} photographs`}>
        {series.items.map((photo, index) => (
          <div
            className={`hang-row ${index % 2 ? 'hang-right' : 'hang-left'} ${
              photo.orientation === 'landscape' ? 'is-landscape' : 'is-upright'
            }`}
            key={photo.slug}
          >
            <Print
              photo={photo}
              eager={index < 2}
              sizes="(max-width: 700px) 92vw, 60vw"
              onOpen={() => open(index)}
            />
            <WallLabel photo={photo} />
          </div>
        ))}
        {view}
      </section>
      {next.key !== series.key && (
        <nav className="block next-series" aria-label="Next series">
          <span className="next-label">Next series</span>
          <a className="next-title" href={`#series-${next.key}`}>{next.title}</a>
        </nav>
      )}
    </>
  );
}

function Archive() {
  const columnCount = useColumnCount();
  const columns = useMemo(() => distributeIntoColumns(photos, columnCount), [columnCount]);
  const { open, view } = useLightbox(photos);
  return (
    <section className="block archive" aria-labelledby="archive-title">
      <a className="back-link" href="#selected">Selected works</a>
      <h1 className="series-name" id="archive-title">All works</h1>
      <div className="masonry">
        {columns.map((column, c) => (
          <div className="masonry-column" key={c}>
            {column.map(({ photo, index }) => (
              <Print
                key={photo.slug}
                photo={photo}
                framed={false}
                eager={index < 6}
                sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw"
                onOpen={() => open(index)}
              />
            ))}
          </div>
        ))}
      </div>
      {view}
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
      <Header key={route.view + (route.key ?? '')} />
      <main>
        {route.view === 'main' && (
          <>
            <Entrance />
            <SeriesIndex />
            <Selected />
            <About />
          </>
        )}
        {series && <SeriesPage series={series} key={series.key} />}
        {route.view === 'archive' && <Archive />}
        <Contact />
      </main>
      <footer className="footer">
        <span>© 2026 zizyfuz</span>
        <span>All photographs reserved</span>
      </footer>
    </>
  );
}
