import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext.jsx";
import Icon from "../components/Icon.jsx";

const demoAccounts = {
  admin: { email: "admin@bookleaf.local" },
  author: { email: "priya.sharma@email.com" },
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      const requestedPath = location.state?.from?.pathname;
      const allowedPath = user.role === "admin"
        ? requestedPath?.startsWith("/admin")
        : requestedPath?.startsWith("/author");
      navigate(allowedPath ? requestedPath : user.role === "admin" ? "/admin/tickets" : "/author", { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Unable to sign in. Check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function useDemo(role) {
    setEmail(demoAccounts[role].email);
    setPassword("");
    setError("");
  }

  return (
    <main className="login-layout">
      <section className="login-story">
        <NavBrand />
        <div className="story-copy">
          <span className="eyebrow light-eyebrow">BOOKLEAF AUTHOR CARE</span>
          <h1>Your publishing journey, supported at every step.</h1>
          <p>Get clear updates, track your books, and connect with the people who can help.</p>
          <div className="story-mark" aria-hidden="true"><span>“</span><i /><i /><i /></div>
        </div>
        <div className="story-footer">Thoughtful support for every story.</div>
      </section>

      <section className="login-panel">
        <div className="login-form-wrap">
          <span className="eyebrow">WELCOME BACK</span>
          <h2>Sign in to your portal</h2>
          <p className="muted">Use your BookLeaf account to continue.</p>
          {error && <div className="form-error" role="alert"><Icon name="alert" size={17} />{error}</div>}
          <form className="form-stack" onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="email">Email address</label>
            <input id="email" className="field" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <label className="field-label" htmlFor="password">Password</label>
            <input id="password" className="field" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <button className="button button-primary login-submit" type="submit" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}<Icon name="arrow" size={17} />
            </button>
          </form>
          <details className="demo-access">
            <summary>Need demo access?</summary>
            <p>These accounts are created by the server seed script.</p>
            <div className="demo-buttons">
              <button type="button" onClick={() => useDemo("author")}><strong>Author demo</strong><small>priya.sharma@email.com</small></button>
              <button type="button" onClick={() => useDemo("admin")}><strong>Admin demo</strong><small>admin@bookleaf.local</small></button>
            </div>
            <p className="login-footnote">Use the local demo password printed by the server seed command.</p>
          </details>
        </div>
      </section>
    </main>
  );
}

function NavBrand() {
  return <div className="login-brand"><span className="brand-mark brand-mark-light">B</span><strong>BookLeaf</strong></div>;
}
