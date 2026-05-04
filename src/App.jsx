import { useMemo, useState } from 'react';
import { Mail, Plus, X } from 'lucide-react';
import { categories, photos } from './data/photos.js';

const email = 'hello@zizyfuz.com';

function Logo() {
  return (
    <a className="logo" href="#home" aria-label="zizyfuz home">
      <img className="logo-image" src="/logo-zizyfuz.png" alt="" aria-hidden="true" />
    </a>
  );
}

function Header() {
  return (
    <header className="site-header">
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
        <h2 id="about-title">"You must be the first audience of your own life."</h2>
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
        <p>(c) 2026 zizyfuz. All photographs reserved.</p>
      </footer>
    </>
  );
}

export default App;
