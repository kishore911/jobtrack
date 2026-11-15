import { useCallback, useEffect, useState } from "react";
import Auth from "./Auth";
import { createApp, deleteApp, getApps, getStats, isAuthed, logout, updateApp } from "./api";

const COLUMNS = [
  ["wishlist", "Wishlist"], ["applied", "Applied"], ["interview", "Interview"],
  ["offer", "Offer"], ["rejected", "Rejected"],
];
const EMPTY = { company: "", role: "", status: "applied", location: "", follow_up_date: "", job_url: "" };
const today = () => new Date().toISOString().slice(0, 10);

function Card({ app, onDelete, onDragStart }) {
  const overdue = app.follow_up_date && app.follow_up_date < today() && ["applied", "interview"].includes(app.status);
  return (
    <article className="card" draggable onDragStart={() => onDragStart(app.id)}>
      <h3>{app.company}</h3>
      <p>{app.role}</p>
      {app.location && <p className="muted">{app.location}</p>}
      {app.follow_up_date && (
        <p className={overdue ? "due overdue" : "due"}>
          {overdue ? "Follow-up overdue: " : "Follow up: "}{app.follow_up_date}
        </p>
      )}
      <div className="card-actions">
        {app.job_url && <a href={app.job_url} target="_blank" rel="noreferrer">Job post</a>}
        <button className="link danger" onClick={() => onDelete(app)}>Delete</button>
      </div>
    </article>
  );
}

function Board() {
  const [apps, setApps] = useState([]);
  const [stats, setStats] = useState(null);
  const [q, setQ] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [dragId, setDragId] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [a, s] = await Promise.all([getApps(q), getStats()]);
      setApps(a); setStats(s); setError("");
    } catch (e) { setError(e.message); }
  }, [q]);
  useEffect(() => { load(); }, [load]);

  async function drop(status) {
    const app = apps.find((a) => a.id === dragId);
    setDragId(null);
    if (!app || app.status === status) return;
    setApps(apps.map((a) => (a.id === app.id ? { ...a, status } : a))); // update screen first
    try { await updateApp(app.id, { status }); } catch (e) { setError(e.message); }
    load();
  }
  async function add(e) {
    e.preventDefault();
    try {
      await createApp({ ...form, follow_up_date: form.follow_up_date || null });
      setForm(EMPTY); setShowForm(false); load();
    } catch (err) { setError(err.message); }
  }
  const remove = async (app) => { if (confirm(`Delete ${app.company}?`)) { await deleteApp(app.id); load(); } };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <header className="top">
        <h1>JobTrack</h1>
        <input type="search" placeholder="Search company or role" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
        <button className="primary" onClick={() => setShowForm(!showForm)}>{showForm ? "Close" : "Add application"}</button>
        <button className="link" onClick={() => { logout(); location.reload(); }}>Sign out</button>
      </header>
      <main className="wrap">
        {error && <p className="error" role="alert">{error}</p>}
        {showForm && (
          <form className="panel form" onSubmit={add}>
            <input placeholder="Company" value={form.company} onChange={set("company")} required />
            <input placeholder="Role" value={form.role} onChange={set("role")} required />
            <select value={form.status} onChange={set("status")} aria-label="Status">
              {COLUMNS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <input placeholder="Location" value={form.location} onChange={set("location")} />
            <input type="date" value={form.follow_up_date} onChange={set("follow_up_date")} aria-label="Follow-up date" />
            <input type="url" placeholder="Job post link" value={form.job_url} onChange={set("job_url")} />
            <button className="primary">Save application</button>
          </form>
        )}
        {stats && (
          <section className="panel summary">
            <div><p className="big">{stats.interview_rate}%</p><p className="muted">of sent applications reached interview or offer</p></div>
            <div>
              <h2>Follow up this week</h2>
              {stats.followups.length === 0 ? <p className="muted">Nothing due. Add follow-up dates to your applied cards.</p> :
                <ul>{stats.followups.map((f) => <li key={f.id}><strong>{f.company}</strong> ({f.role}) on {f.date}</li>)}</ul>}
            </div>
          </section>
        )}
        <section className="board">
          {COLUMNS.map(([key, label]) => {
            const items = apps.filter((a) => a.status === key);
            return (
              <div key={key} className={`col ${key}`} onDragOver={(e) => e.preventDefault()} onDrop={() => drop(key)}>
                <h2>{label} <span>{items.length}</span></h2>
                {items.map((a) => <Card key={a.id} app={a} onDelete={remove} onDragStart={setDragId} />)}
                {items.length === 0 && <p className="muted empty">Drag a card here</p>}
              </div>
            );
          })}
        </section>
      </main>
    </>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(isAuthed());
  return authed ? <Board /> : <Auth title="JobTrack" tagline="Keep every application, follow-up and interview in one board." onDone={() => setAuthed(true)} />;
}
