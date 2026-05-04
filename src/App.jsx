import { useMemo, useState } from 'react';
import { ArrowUpRight, Mail, Plus, X } from 'lucide-react';
import { categories, photos } from './data/photos.js';

const email = 'hello@zizyfuz.com';

function Logo() {
  return (
    <a className="logo" href="#home" aria-label="zizyfuz home">
      <span className="logo-mark">zf</span>
      <span className="logo-word">zizyfuz</span>
    </a>
  );
}

function Header() {
  return (
    <header className="site-header">
      <Logo />
      <nav className="nav-links" aria-label="Primary navigation">
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="#gallery">Gallery</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>
  );
}

function Home() {
  const featured = photos.find((photo) => photo.featured) ?? photos[0];

  return (
    <section className="hero" id="home" aria-labelledby="hero-title">
      <div className="hero-image-wrap">
        <img className="hero-image" src={featured.src} alt={featured.title} />
      </div>
      <div className="hero-copy">
        <p className="eyebrow">Photography portfolio</p>
        <h1 id="hero-title">zizyfuz</h1>
        <p>
          Quiet landscapes, watchful wildlife, coastal light, and city fragments
          collected with a calm eye.
        </p>
        <a className="text-link" href="#gallery">
          View gallery
          <ArrowUpRight aria-hidden="true" size={18} />
        </a>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="section about-section" id="about" aria-labelledby="about-title">
      <div>
        <p className="eyebrow">About</p>
        <h2 id="about-title">A personal archive of light, distance, and detail.</h2>
      </div>
      <div className="about-copy">
        <p>
          zizyfuz works across landscape, wildlife, travel, and candid human
          scenes. The portfolio is built to keep the photographs generous on the
          page, with enough quiet space for each frame to breathe.
        </p>
        <p>
          This site is ready to grow: new photographs can be added through a
          single photo list, without changing the core design.
        </p>
      </div>
    </section>
  );
}

function Gallery() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const visiblePhotos = useMemo(() => {
    if (activeCategory === 'All') {
      return photos;
    }

    return photos.filter((photo) => photo.category === activeCategory);
  }, [activeCategory]);

  return (
    <section className="section gallery-section" id="gallery" aria-labelledby="gallery-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Gallery</p>
          <h2 id="gallery-title">Selected photographs</h2>
        </div>
        <p>{visiblePhotos.length} frames</p>
      </div>

      <div className="category-tabs" aria-label="Filter gallery by category">
        {categories.map((category) => (
          <button
            className={category === activeCategory ? 'active' : ''}
            key={category}
            onClick={() => setActiveCategory(category)}
            type="button"
          >
            {category}
          </button>
        ))}
      </div>

      <div className="photo-grid">
        {visiblePhotos.map((photo, index) => (
          <button
            className={`photo-card ${photo.orientation}`}
            key={photo.slug}
            onClick={() => setSelectedPhoto(photo)}
            type="button"
          >
            <img
              src={photo.src}
              alt={photo.title}
              loading={index < 6 ? 'eager' : 'lazy'}
            />
            <span className="photo-meta">
              <span>{photo.title}</span>
              <span>{photo.category}</span>
            </span>
          </button>
        ))}
      </div>

      {selectedPhoto && (
        <Lightbox photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}
    </section>
  );
}

function Lightbox({ photo, onClose }) {
  return (
    <div
      className="lightbox"
      onClick={onClose}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          onClose();
        }
      }}
      role="presentation"
    >
      <button className="lightbox-close" onClick={onClose} type="button" aria-label="Close">
        <X size={22} aria-hidden="true" />
      </button>
      <figure className="lightbox-frame" onClick={(event) => event.stopPropagation()}>
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
    <section className="section contact-section" id="contact" aria-labelledby="contact-title">
      <div>
        <p className="eyebrow">Contact</p>
        <h2 id="contact-title">For prints, projects, or future updates.</h2>
      </div>
      <div className="contact-panel">
        <a className="email-link" href={`mailto:${email}`}>
          <Mail size={20} aria-hidden="true" />
          {email}
        </a>
        <div className="update-note">
          <Plus size={18} aria-hidden="true" />
          <span>Add future photographs through the photo manifest.</span>
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
