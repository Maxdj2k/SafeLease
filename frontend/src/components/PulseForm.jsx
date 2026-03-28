import { useState } from 'react';
import { submitPulse } from '../api';

export default function PulseForm({ propertyId, onSubmitted }) {
  const [approves, setApproves] = useState(true);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setStatus('Submitting...');
    try {
      await submitPulse({ property: propertyId, approves, note });
      setStatus('Submitted');
      setNote('');
      onSubmitted?.();
    } catch (err) {
      setStatus(err.message || 'Submit failed');
    }
  }

  return (
    <form className="report-form" onSubmit={onSubmit}>
      <h3>Resident pulse</h3>
      <select value={approves ? 'yes' : 'no'} onChange={(e) => setApproves(e.target.value === 'yes')}>
        <option value="yes">Yes, I still approve</option>
        <option value="no">No, I do not approve</option>
      </select>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note" />
      <button className="btn" type="submit">Submit pulse</button>
      {status && <p className="muted">{status}</p>}
    </form>
  );
}
