import { Link } from 'react-router-dom';

const pillClass = (label) => {
  if (label === 'high') return 'hub-pill hub-pill-orange';
  if (label === 'medium') return 'hub-pill hub-pill-warn';
  return 'hub-pill hub-pill-outline';
};

const pillText = (label) => {
  if (label === 'high') return 'Higher risk';
  if (label === 'medium') return 'Medium risk';
  return 'Lower risk';
};

export default function PropertyFeedCard({ property: p }) {
  return (
    <article className="hub-card hub-listing-card">
      <Link to={`/properties/${p.id}`} className="hub-listing-link">
        <div className="hub-listing-image">
          <span className={pillClass(p.risk_label)}>{pillText(p.risk_label)}</span>
          <span className="hub-icon-circle hub-ic-muted hub-fav" aria-hidden>
            <svg viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </span>
        </div>
        <div className="hub-listing-price-row">
          <div className="hub-text-hero">{p.risk_score}</div>
          <div className="hub-text-sub">composite score (pts)</div>
        </div>
        <h2 className="hub-text-title hub-listing-title">{p.name}</h2>
        <div className="hub-text-sub">{p.address_display}</div>
        <div className="hub-tag-row">
          <span className="hub-pill hub-pill-outline">{p.risk_label} risk</span>
          <span className="hub-pill hub-pill-outline">{p.management_company}</span>
        </div>
      </Link>
    </article>
  );
}
