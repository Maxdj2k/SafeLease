import { Link } from 'react-router-dom';

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}

export default function HubTopbar({ variant = 'home', hubView, onHubView }) {
  return (
    <header className="hub-topbar">
      <div className="hub-topbar-left">
        <Link to="/" className="hub-logo">
          <span className="hub-icon-circle hub-ic-blue hub-icon-sm">
            <HomeIcon />
          </span>
          SafeLease
        </Link>
      </div>
      <div className="hub-topbar-center">
        {variant === 'home' && (
          <div className="hub-segmented hub-segmented-wide" role="tablist" aria-label="Main view">
            <button
              type="button"
              role="tab"
              aria-selected={hubView === 'feed'}
              className={`hub-segment ${hubView === 'feed' ? 'active' : ''}`}
              onClick={() => onHubView('feed')}
            >
              Feed
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={hubView === 'listings'}
              className={`hub-segment ${hubView === 'listings' ? 'active' : ''}`}
              onClick={() => onHubView('listings')}
            >
              Listings
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={hubView === 'map'}
              className={`hub-segment ${hubView === 'map' ? 'active' : ''}`}
              onClick={() => onHubView('map')}
            >
              Map
            </button>
          </div>
        )}
        {variant === 'detail' && (
          <Link to="/" className="hub-back-link">
            ← Back to hub
          </Link>
        )}
      </div>
      <div className="hub-topbar-right">
        <div className="hub-avatar" aria-hidden />
      </div>
    </header>
  );
}
