import { Link } from 'react-router-dom';

function markerColor(label) {
  if (label === 'high') return '#a84d4d';
  if (label === 'medium') return '#b8860b';
  return '#2d6a6a';
}

export default function PropertyMap({ properties, offlinePreview = false, compact = false }) {
  const lats = properties.map((p) => Number(p.latitude));
  const lngs = properties.map((p) => Number(p.longitude));
  const minLat = lats.length ? Math.min(...lats) : 36.82;
  const maxLat = lats.length ? Math.max(...lats) : 36.93;
  const minLng = lngs.length ? Math.min(...lngs) : -76.34;
  const maxLng = lngs.length ? Math.max(...lngs) : -76.14;

  return (
    <div className={`fake-map-wrap${compact ? ' fake-map-wrap--compact' : ''}`}>
      <div className={`fake-map-header${compact ? ' fake-map-header--compact' : ''}`}>
        <strong>Norfolk Demo Map (mock layout)</strong>
        <span className="fake-map-header-meta">
          Markers are approximate demo positions
          <a
            className="fake-map-osm-credit"
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
          >
            © OpenStreetMap
          </a>
        </span>
      </div>
      <div className="fake-map-canvas">
        {properties.map((p) => {
          const lat = Number(p.latitude);
          const lng = Number(p.longitude);
          const top = ((maxLat - lat) / (maxLat - minLat || 1)) * 100;
          const left = ((lng - minLng) / (maxLng - minLng || 1)) * 100;
          const color = markerColor(p.risk_label);
          return (
            <div
              key={p.id}
              className="fake-map-marker"
              style={{ top: `${top}%`, left: `${left}%`, borderColor: color }}
              title={`${p.name} (${p.risk_label}, ${p.risk_score} pts)`}
            >
              <span style={{ background: color }} />
              <div className="fake-map-popup">
                <strong>{p.name}</strong>
                <div>{p.address_display}</div>
                <div>Risk: {p.risk_label} ({p.risk_score} pts)</div>
                {offlinePreview ? (
                  <span className="muted">Details require API</span>
                ) : (
                  <Link to={`/properties/${p.id}`}>Open details</Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
