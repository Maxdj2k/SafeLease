import { useState } from 'react';
import { submitReport } from '../api';

const issueTypes = ['mold', 'maintenance', 'pests', 'flooding', 'safety', 'deposit', 'responsiveness'];
const severities = ['low', 'medium', 'high'];

export default function ReportForm({ propertyId, onSubmitted }) {
  const [issueType, setIssueType] = useState('maintenance');
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setStatus('Submitting...');
    try {
      const formData = new FormData();
      formData.append('property', String(propertyId));
      formData.append('issue_type', issueType);
      formData.append('severity', severity);
      formData.append('description', description);
      if (image) formData.append('image', image);
      await submitReport(formData);
      setStatus('Submitted');
      setDescription('');
      setImage(null);
      onSubmitted?.();
    } catch (err) {
      setStatus(err.message || 'Submit failed');
    }
  }

  return (
    <form className="report-form" onSubmit={onSubmit}>
      <h3>Add anonymous report</h3>
      <select value={issueType} onChange={(e) => setIssueType(e.target.value)}>
        {issueTypes.map((i) => (
          <option key={i} value={i}>{i}</option>
        ))}
      </select>
      <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
        {severities.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
      <button className="btn" type="submit">Submit</button>
      {status && <p className="muted">{status}</p>}
    </form>
  );
}
