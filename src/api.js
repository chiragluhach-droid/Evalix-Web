import API_BASE_URL from './apiConfig.js';

// Centralized fetch helper with JWT auth + JSON handling.
export async function api(path, { method = 'GET', body, auth = true, raw = false } = {}) {
  const headers = {};
  if (body && !raw) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? (raw ? body : JSON.stringify(body)) : undefined
  });

  if (raw) return res; // caller handles blob/text (e.g. exports)

  let data = null;
  try { data = await res.json(); } catch { /* no body */ }

  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export { API_BASE_URL };
