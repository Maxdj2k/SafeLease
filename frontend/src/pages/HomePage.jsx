import { useEffect, useMemo, useState } from 'react';
import { fetchProperties } from '../api';
import HubTopbar from '../components/HubTopbar';
import PropertyFeedCard from '../components/PropertyFeedCard';
import PropertyMap from '../components/PropertyMap';
import { DEMO_FALLBACK_PROPERTIES } from '../data/demoFallbackProperties';

function filterDemoList(list, q) {
  if (!q?.trim()) return list;
  const t = q.trim().toLowerCase();
  return list.filter(
    (p) =>
      p.name.toLowerCase().includes(t) ||
      p.address_display.toLowerCase().includes(t) ||
      p.management_company.toLowerCase().includes(t),
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [apiItems, setApiItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usedFallback, setUsedFallback] = useState(false);
  const [hubView, setHubView] = useState('feed');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchProperties(query)
      .then((res) => {
        if (cancelled) return;
        const rows = Array.isArray(res.data) ? res.data : [];
        if (rows.length === 0 && !query.trim()) {
          setUsedFallback(true);
          setApiItems([]);
        } else {
          setUsedFallback(false);
          setApiItems(rows);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setUsedFallback(true);
        setApiItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const properties = useMemo(() => {
    if (usedFallback) {
      return filterDemoList(DEMO_FALLBACK_PROPERTIES, query);
    }
    return apiItems ?? [];
  }, [usedFallback, apiItems, query]);

  const stats = useMemo(() => {
    if (!properties.length) return { avg: 0, low: 0, medium: 0, high: 0 };
    const sum = properties.reduce((a, p) => a + Number(p.risk_score), 0);
    const low = properties.filter((p) => p.risk_label === 'low').length;
    const medium = properties.filter((p) => p.risk_label === 'medium').length;
    const high = properties.filter((p) => p.risk_label === 'high').length;
    return {
      avg: Math.round((sum / properties.length) * 10) / 10,
      low,
      medium,
      high,
    };
  }, [properties]);

  const maxRiskBucket = Math.max(stats.low, stats.medium, stats.high, 1);
  const pct = (n) => `${Math.round((n / maxRiskBucket) * 100)}%`;

  const noMatches =
    !loading && !usedFallback && apiItems !== null && properties.length === 0 && query.trim();

  const showFeedColumn = hubView !== 'map';
  const showMapInSidebar = hubView !== 'map' && properties.length > 0 && !loading;
  const showMapMain = hubView === 'map';

  return (
    <div className="hub-page">
      <HubTopbar variant="home" hubView={hubView} onHubView={setHubView} />

      <div className="hub-app-container">
        <aside className="hub-column-nav">
          {usedFallback && (
            <div className="hub-card hub-alert-card">
              <span className="hub-icon-circle hub-ic-orange hub-icon-sm">
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
              </span>
              <div>
                <div className="hub-text-body hub-text-strong">Sample listings mode</div>
                <div className="hub-text-sub hub-text-tight">Connect the API for live scores and full detail pages.</div>
              </div>
            </div>
          )}

          <div className="hub-card">
            <div className="hub-text-label hub-mb-md">Explore neighborhood</div>
            <div className="hub-list-group">
              <button type="button" className="hub-list-item" onClick={() => setHubView('listings')}>
                <span className="hub-icon-circle hub-ic-orange">
                  <svg viewBox="0 0 24 24" aria-hidden>
                    <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
                  </svg>
                </span>
                <span className="hub-list-item-content hub-text-body">Norfolk properties</span>
                <span className="hub-list-item-action">
                  <ChevronRight />
                </span>
              </button>
              <button type="button" className="hub-list-item" onClick={() => setHubView('map')}>
                <span className="hub-icon-circle hub-ic-green">
                  <svg viewBox="0 0 24 24" aria-hidden>
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </span>
                <span className="hub-list-item-content hub-text-body">Area map</span>
                <span className="hub-list-item-action">
                  <ChevronRight />
                </span>
              </button>
              <button type="button" className="hub-list-item" onClick={() => setHubView('feed')}>
                <span className="hub-icon-circle hub-ic-blue">
                  <svg viewBox="0 0 24 24" aria-hidden>
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                  </svg>
                </span>
                <span className="hub-list-item-content hub-text-body">Community feed</span>
                <span className="hub-list-item-action">
                  <ChevronRight />
                </span>
              </button>
            </div>
          </div>

          <div className="hub-card">
            <div className="hub-text-label hub-mb-md">Property search</div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setQuery(search);
              }}
              className="hub-search-form"
            >
              <input
                className="hub-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Address, name, manager…"
                aria-label="Search properties"
              />
              <button type="submit" className="hub-btn-primary">
                Search
              </button>
            </form>
          </div>
        </aside>

        <main className="hub-column-feed">
          {showFeedColumn && (
            <>
              {hubView === 'feed' && (
                <article className="hub-card hub-community-card">
                  <div className="hub-post-header">
                    <div className="hub-avatar hub-avatar-lg hub-avatar-slate" aria-hidden />
                    <div>
                      <div className="hub-text-title hub-text-title-sm">SafeLease</div>
                      <div className="hub-text-sub hub-text-tight">Norfolk • renter-reported signals</div>
                    </div>
                    <span className="hub-pill hub-pill-blue-soft">Announcement</span>
                  </div>
                  <p className="hub-text-body">
                    Scores blend anonymous reports and issue types—use them as one input, not the whole story.
                    Verify in person, read your lease, and check anything that affects your decision.
                  </p>
                </article>
              )}

              {loading && (
                <div className="hub-card">
                  <p className="hub-text-sub">Loading properties…</p>
                </div>
              )}
              {noMatches && (
                <div className="hub-card">
                  <p className="hub-text-body">No properties match your search.</p>
                </div>
              )}
              {!loading &&
                properties.length > 0 &&
                (hubView === 'listings' || hubView === 'feed') &&
                properties.map((p) => <PropertyFeedCard key={p.id} property={p} />)}
            </>
          )}

          {showMapMain && (
            <div className="hub-card hub-map-main-card">
              {loading ? (
                <p className="hub-text-sub">Loading map…</p>
              ) : (
                <>
                  <PropertyMap properties={properties} offlinePreview={usedFallback} />
                  <ul className="hub-map-chip-list">
                    {properties.map((p) => (
                      <li key={p.id}>
                        <span className={`hub-pill hub-pill-outline hub-pill-tiny ${p.risk_label}`}>{p.risk_label}</span>
                        <span className="hub-text-sub">{p.name}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </main>

        <aside className="hub-column-data">
          {showMapInSidebar && (
            <div className="hub-card hub-map-preview hub-p-0">
              <div className="hub-map-preview-inner">
                <PropertyMap properties={properties} offlinePreview={usedFallback} compact />
              </div>
            </div>
          )}

          <div className="hub-card hub-card-yellow">
            <div className="hub-text-label hub-label-amber">Norfolk avg (visible)</div>
            <div className="hub-stat-row">
              <div className="hub-text-hero">{stats.avg || '—'}</div>
            </div>
            <div className="hub-text-sub hub-text-amber">risk points across visible listings</div>
            <span className="hub-icon-circle hub-ic-black hub-icon-sm hub-mt">
              <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden>
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
              </svg>
            </span>
          </div>

          <div className="hub-card">
            <div className="hub-text-title hub-mb-md">Risk mix (visible)</div>
            <div className="hub-h-bar-block">
              <div className="hub-text-label hub-h-bar-label">
                <span>Lower</span>
                <span>{stats.low}</span>
              </div>
              <div className="hub-h-bar-track">
                <div className="hub-h-bar-fill hub-fill-green" style={{ width: pct(stats.low) }} />
              </div>
            </div>
            <div className="hub-h-bar-block">
              <div className="hub-text-label hub-h-bar-label">
                <span>Medium</span>
                <span>{stats.medium}</span>
              </div>
              <div className="hub-h-bar-track">
                <div className="hub-h-bar-fill hub-fill-yellow" style={{ width: pct(stats.medium) }} />
              </div>
            </div>
            <div className="hub-h-bar-block">
              <div className="hub-text-label hub-h-bar-label">
                <span>Higher</span>
                <span>{stats.high}</span>
              </div>
              <div className="hub-h-bar-track">
                <div className="hub-h-bar-fill hub-fill-pink" style={{ width: pct(stats.high) }} />
              </div>
            </div>
          </div>

          <div className="hub-card">
            <div className="hub-text-title">Listing pulse</div>
            <div className="hub-text-sub hub-text-tight hub-mb">Illustrative activity trend</div>
            <div className="hub-v-chart">
              <div className="hub-v-bar" style={{ height: '40%' }}>
                <div className="hub-v-bar-inner hub-fill-blue" />
              </div>
              <div className="hub-v-bar" style={{ height: '60%' }}>
                <div className="hub-v-bar-inner hub-fill-blue" />
              </div>
              <div className="hub-v-bar" style={{ height: '30%' }}>
                <div className="hub-v-bar-inner hub-fill-orange" />
              </div>
              <div className="hub-v-bar" style={{ height: '50%' }}>
                <div className="hub-v-bar-inner hub-fill-orange" />
              </div>
              <div className="hub-v-bar" style={{ height: '80%' }}>
                <div className="hub-v-bar-inner hub-fill-green" />
              </div>
              <div className="hub-v-bar" style={{ height: '45%' }}>
                <div className="hub-v-bar-inner hub-fill-green" />
              </div>
              <div className="hub-v-bar" style={{ height: '90%' }}>
                <div className="hub-v-bar-inner hub-fill-pink" />
              </div>
              <div className="hub-v-bar" style={{ height: '70%' }}>
                <div className="hub-v-bar-inner hub-fill-pink" />
              </div>
            </div>
            <div className="hub-v-chart-labels">
              <span>Q1</span>
              <span>Q2</span>
              <span>Q3</span>
              <span>Q4</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
