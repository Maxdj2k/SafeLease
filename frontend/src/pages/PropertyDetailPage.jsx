import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProperty } from '../api';
import HubTopbar from '../components/HubTopbar';
import ReportForm from '../components/ReportForm';
import PulseForm from '../components/PulseForm';

function fmt(ts) {
  try { return new Date(ts).toLocaleString(); } catch { return ts; }
}

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    fetchProperty(id)
      .then((res) => {
        setData(res.data);
        setError('');
      })
      .catch((err) => setError(err.message || 'Network error'));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <div className="hub-page hub-page-detail">
        <HubTopbar variant="detail" />
        <p className="hub-detail-error">{error}</p>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="hub-page hub-page-detail">
        <HubTopbar variant="detail" />
        <p className="hub-detail-loading">Loading…</p>
      </div>
    );
  }

  return (
    <div className="hub-page hub-page-detail">
      <HubTopbar variant="detail" />
      <div className="detail-page">
      <div className="detail-hero panel">
        <div>
          <h2>{data.name}</h2>
          <p>{data.address_line1}, {data.city}, {data.state} {data.postal_code}</p>
          <p className="muted">Managed by {data.management_company}</p>
        </div>
        <div className="hero-score">
          <span className={`chip ${data.risk_label}`}>{data.overall_livability}</span>
          <p>{data.risk_score} points</p>
        </div>
      </div>

      <section className="panel lease-snapshot">
        <h3>Lease &amp; management snapshot</h3>
        <p className="muted lease-disclaimer">
          Sample lease snapshot — not your actual lease. Read every document, ask questions,
          and get legal help if you need it.
        </p>
        {data.lease_type_hint && (
          <p className="lease-type-hint">
            <strong>Typical lease shape (summary):</strong> {data.lease_type_hint}
          </p>
        )}
        <div className="lease-columns">
          {data.lease_insight && (
            <div>
              <h4>What you might be signing up for</h4>
              <p>{data.lease_insight}</p>
            </div>
          )}
          {data.management_insight && (
            <div>
              <h4>How management shows up (renter-reported pattern)</h4>
              <p>{data.management_insight}</p>
            </div>
          )}
        </div>
        {!(data.lease_insight || data.management_insight || data.lease_type_hint) && (
          <p className="muted">No lease snapshot for this listing yet.</p>
        )}
      </section>

      <div className="detail-grid">
        <section className="panel">
          <h3>Current sentiment</h3>
          <p>
            Approve: {data.resident_approval?.approve_count || 0} | Disapprove: {data.resident_approval?.disapprove_count || 0}
          </p>
          <ul className="feed">
            {(data.pulse_feed || []).map((p) => (
              <li key={p.id}>
                <strong>{p.approves ? 'Approve' : 'Disapprove'}</strong>
                <div>{p.note || 'No note provided.'}</div>
                <small className="muted">{fmt(p.created_at)}</small>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h3>Issue scores</h3>
          <ul className="issue-badges">
            {Object.entries(data.issue_counts || {}).map(([issue, count]) => (
              <li key={issue}>
                <span>{issue}</span>
                <strong>{count}</strong>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="panel">
        <h3>Community report feed</h3>
        <ul className="feed">
          {(data.reports || []).map((r) => (
            <li key={r.id}>
              <div className="feed-row">
                <span className={`chip ${r.severity === 'high' ? 'high' : r.severity === 'medium' ? 'medium' : 'low'}`}>
                  {r.issue_type}
                </span>
                <span className="muted">{r.severity} severity</span>
              </div>
              <div>{r.description}</div>
              {r.image_url && <img className="report-photo" src={r.image_url} alt="uploaded report" />}
              <small className="muted">{fmt(r.created_at)}</small>
            </li>
          ))}
        </ul>
      </section>

      <div className="detail-grid">
        <section className="panel">
          <ReportForm propertyId={data.id} onSubmitted={load} />
        </section>
        <section className="panel">
          <PulseForm propertyId={data.id} onSubmitted={load} />
        </section>
      </div>
      </div>
    </div>
  );
}
