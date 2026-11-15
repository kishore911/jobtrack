import { useState } from "react";
import { login, register } from "./api";

export default function Auth({ title, tagline, onDone }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      if (mode === "register") await register(username, password);
      await login(username, password);
      onDone();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="auth">
      <form onSubmit={submit} className="panel">
        <h1>{title}</h1>
        <p className="muted">{tagline}</p>
        <label>Username<input value={username} onChange={(e) => setUsername(e.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="primary">{mode === "login" ? "Sign in" : "Create account"}</button>
        <button type="button" className="link" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "Create a new account" : "I already have an account"}
        </button>
      </form>
    </main>
  );
}
