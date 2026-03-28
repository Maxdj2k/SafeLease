import axios from 'axios';

// Prefer same-origin /api in dev (Vite proxy) so port mismatches don’t break the app.
const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({ baseURL });

export function fetchProperties(search) {
  const params = {};
  if (search && search.trim()) params.search = search.trim();
  return api.get('/properties/', { params });
}

export function fetchProperty(id) {
  return api.get(`/properties/${id}/`);
}

export function submitReport(payload) {
  return api.post('/reports/', payload, {
    headers: payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
}

export function submitPulse(payload) {
  return api.post('/pulses/', payload);
}
