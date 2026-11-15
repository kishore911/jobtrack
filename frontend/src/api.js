export const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const token = () => localStorage.getItem("access");
export const isAuthed = () => !!token();
export const logout = () => localStorage.removeItem("access");

async function req(path, opts = {}, raw = false) {
  const res = await fetch(`${API}/api${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(token() ? { Authorization: `Bearer ${token()}` } : {}) },
  });
  if (res.status === 401 && token()) { logout(); location.reload(); }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || Object.values(body).flat().join(" ") || "Request failed");
  }
  if (raw) return res;
  return res.status === 204 ? null : res.json();
}
const send = (method, body) => ({ method, body: JSON.stringify(body || {}) });

export async function login(username, password) {
  const data = await req("/auth/token/", send("POST", { username, password }));
  localStorage.setItem("access", data.access);
}
export const register = (username, password) => req("/auth/register/", send("POST", { username, password }));

export const getApps = (q) => req(`/applications/${q ? `?q=${encodeURIComponent(q)}` : ""}`);
export const createApp = (data) => req("/applications/", send("POST", data));
export const updateApp = (id, patch) => req(`/applications/${id}/`, send("PATCH", patch));
export const deleteApp = (id) => req(`/applications/${id}/`, { method: "DELETE" });
export const getStats = () => req("/stats/");
