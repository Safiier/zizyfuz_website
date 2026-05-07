import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { photos } from './data/photos.js';

const email = 'zizyfuz@gmail.com';

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

function Header({ visible }) {
  return (
    <header className={`site-header ${visible ? '' : 'site-header-hidden'}`}>
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
  const heroPhoto = photos.find((photo) => photo.slug === 'bipenggou-11') ?? photos[0];

  return (
    <section className="hero" id="home" aria-label="zizyfuz photography home">
      <div className="hero-image-wrap">
        <img className="hero-image" src={heroPhoto.src} alt={heroPhoto.title} />
      </div>
    </section>
  );
}

function About() {
  const aboutPhoto = photos.find((photo) => photo.slug === 'death-water') ?? photos[0];

  return (
    <section className="section about-section" id="about" aria-labelledby="about-title">
      <div className="about-image-frame">
        <img src={aboutPhoto.src} alt={aboutPhoto.title} />
      </div>
      <div className="about-copy">
        <p className="eyebrow">About</p>
        <h2 id="about-title">"You are the first audience of your own life."</h2>
        <p>
          I lived in Chongqing, Singapore, and currently pursuing a degree in
          the UK. Photography is the channel that allows me to explore the world
          and myself.
        </p>
      </div>
    </section>
  );
}

function Gallery() {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const selectedPhoto =
    selectedPhotoIndex === null ? null : photos[selectedPhotoIndex];

  const showPreviousPhoto = () => {
    setSelectedPhotoIndex((currentIndex) =>
      currentIndex === null
        ? currentIndex
        : (currentIndex - 1 + photos.length) % photos.length
    );
  };

  const showNextPhoto = () => {
    setSelectedPhotoIndex((currentIndex) =>
      currentIndex === null ? currentIndex : (currentIndex + 1) % photos.length
    );
  };

  return (
    <section className="section gallery-section" id="gallery" aria-label="Gallery">
      <div className="section-heading">
        <p className="eyebrow">Gallery</p>
      </div>

      <div className="photo-grid">
        {photos.map((photo, index) => (
          <button
            className={`photo-card ${photo.orientation}`}
            key={photo.slug}
            onClick={() => setSelectedPhotoIndex(index)}
            type="button"
          >
            <img
              src={photo.src}
              alt={photo.title}
              loading={index < 6 ? 'eager' : 'lazy'}
            />
          </button>
        ))}
      </div>

      {selectedPhoto && (
        <Lightbox
          photo={selectedPhoto}
          onClose={() => setSelectedPhotoIndex(null)}
          onNext={showNextPhoto}
          onPrevious={showPreviousPhoto}
        />
      )}
    </section>
  );
}

function Lightbox({ photo, onClose, onNext, onPrevious }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'ArrowLeft') {
        onPrevious();
      }
      if (event.key === 'ArrowRight') {
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onNext, onPrevious]);

  return (
    <div
      className="lightbox"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${photo.title} enlarged view`}
    >
      <button className="lightbox-close" onClick={onClose} type="button" aria-label="Close">
        <X size={22} aria-hidden="true" />
      </button>
      <button
        className="lightbox-nav lightbox-nav-previous"
        onClick={(event) => {
          event.stopPropagation();
          onPrevious();
        }}
        type="button"
        aria-label="Previous photo"
      >
        <ChevronLeft size={30} aria-hidden="true" />
      </button>
      <button
        className="lightbox-nav lightbox-nav-next"
        onClick={(event) => {
          event.stopPropagation();
          onNext();
        }}
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
        <img src={photo.src} alt={photo.title} />
        <figcaption>
          <span>{photo.title}</span>
          <span>{photo.category}</span>
        </figcaption>
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
          <a href="https://www.instagram.com/zizyfuzfoto?igsh=YTB0ZDBoZHlpMGQ%3D&utm_source=qr">Instagram</a>
          <a href="https://xhslink.com/m/2RsUq7tFlJr">Xiaohongshu</a>
        </div>
      </div>
    </section>
  );
}

function App() {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  useEffect(() => {
    const updateHeaderVisibility = () => {
      setIsHeaderVisible(window.scrollY < window.innerHeight * 0.72);
    };

    updateHeaderVisibility();
    window.addEventListener('scroll', updateHeaderVisibility, { passive: true });
    window.addEventListener('resize', updateHeaderVisibility);

    return () => {
      window.removeEventListener('scroll', updateHeaderVisibility);
      window.removeEventListener('resize', updateHeaderVisibility);
    };
  }, []);

  return (
    <>
      <Header visible={isHeaderVisible} />
      <main>
        <Home />
        <About />
        <Gallery />
        <Contact />
      </main>
      <footer className="site-footer">
        <Logo />
        <p>(c) 2026 zizyfuz. All photographs reserved.</p>
      </footer>
    </>
  );
}

export default App;
