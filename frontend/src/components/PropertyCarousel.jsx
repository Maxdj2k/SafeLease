import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export default function PropertyCarousel({ properties, offlinePreview = false }) {
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);

  const count = properties.length;

  const scrollToIdx = useCallback(
    (idx) => {
      const el = trackRef.current;
      if (!el || count === 0) return;
      const clamped = Math.max(0, Math.min(idx, count - 1));
      const w = el.offsetWidth || 1;
      el.scrollTo({ left: clamped * w, behavior: 'smooth' });
      setIndex(clamped);
    },
    [count],
  );

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el || count === 0) return;
    requestAnimationFrame(() => {
      el.scrollTo({ left: 0, behavior: 'auto' });
      setIndex(0);
    });
  }, [properties, count]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || count === 0) return;

    const onScroll = () => {
      const w = el.offsetWidth || 1;
      const i = Math.round(el.scrollLeft / w);
      setIndex(Math.max(0, Math.min(i, count - 1)));
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [count]);

  if (count === 0) {
    return null;
  }

  return (
    <div className="carousel">
      <div className="carousel-controls">
        <button
          type="button"
          className="carousel-btn"
          aria-label="Previous property"
          disabled={index <= 0}
          onClick={() => scrollToIdx(index - 1)}
        >
          ‹
        </button>
        <span className="carousel-counter">
          {index + 1} / {count}
        </span>
        <button
          type="button"
          className="carousel-btn"
          aria-label="Next property"
          disabled={index >= count - 1}
          onClick={() => scrollToIdx(index + 1)}
        >
          ›
        </button>
      </div>

      <div ref={trackRef} className="carousel-track">
        {properties.map((p) => (
          <article key={p.id} className="carousel-slide">
            <div className="carousel-slide-inner">
              <div className="carousel-slide-top">
                <h3>{p.name}</h3>
                <span className={`chip ${p.risk_label}`}>{p.risk_label}</span>
              </div>
              <p className="carousel-address">{p.address_display}</p>
              <p className="muted">{p.management_company}</p>
              <p className="carousel-score">{p.risk_score} demo risk points</p>
              <p className="muted carousel-hint">Swipe or tap arrows to browse Norfolk listings.</p>
              {offlinePreview ? (
                <p className="muted carousel-offline-hint">
                  Start the API to open full detail pages and submit reports.
                </p>
              ) : (
                <Link className="btn carousel-cta" to={`/properties/${p.id}`}>
                  Open details &amp; community thread
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="carousel-dots" role="tablist" aria-label="Property slides">
        {properties.map((p, i) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            className={`carousel-dot ${i === index ? 'carousel-dot-active' : ''}`}
            aria-label={`Show ${p.name}`}
            onClick={() => scrollToIdx(i)}
          />
        ))}
      </div>
    </div>
  );
}
