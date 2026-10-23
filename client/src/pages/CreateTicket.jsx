import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { apiRequest } from "../api/client.js";
import Icon from "../components/Icon.jsx";
import { ErrorState, LoadingState } from "../components/States.jsx";

export default function CreateTicket() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [booksError, setBooksError] = useState("");
  const [bookId, setBookId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadBooks() {
    setBooksLoading(true);
    setBooksError("");
    try {
      const result = await apiRequest("/api/author/books");
      setBooks(Array.isArray(result?.books) ? result.books : []);
    } catch (requestError) {
      setBooksError(requestError.message);
    } finally {
      setBooksLoading(false);
    }
  }

  useEffect(() => { loadBooks(); }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!subject.trim() || !description.trim()) {
      setError("Enter both a subject and a description.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await apiRequest("/api/author/tickets", {
        method: "POST",
        body: { subject: subject.trim(), description: description.trim(), ...(bookId ? { bookId } : {}) },
      });
      if (result?.ticket?._id) navigate(`/author/tickets/${result.ticket._id}`, { replace: true });
      else navigate("/author/tickets", { replace: true, state: { created: true } });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Link className="back-link" to="/author/tickets"><Icon name="arrow" size={15} className="back-arrow" />Back to tickets</Link>
      <div className="page-heading compact-heading"><div><span className="eyebrow">BOOKLEAF SUPPORT</span><h1>Create a ticket</h1><p>Tell us what you need help with. A team member will review your request.</p></div></div>
      <div className="form-layout">
        <form className="surface-card ticket-form" onSubmit={handleSubmit}>
          {error && <div className="form-error" role="alert"><Icon name="alert" size={17} />{error}</div>}
          <label className="field-label" htmlFor="related-book">Related book <span className="optional-label">Optional</span></label>
          {booksLoading ? <LoadingState label="Loading your books…" /> : booksError ? <ErrorState message={booksError} onRetry={loadBooks} /> : (
            <select id="related-book" className="field" value={bookId} onChange={(event) => setBookId(event.target.value)}>
              <option value="">General or account-related request</option>
              {books.map((book) => <option value={book.bookId} key={book.bookId}>{book.title} · {book.bookId}</option>)}
            </select>
          )}
          <label className="field-label" htmlFor="subject">Subject</label>
          <input id="subject" className="field" type="text" value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={200} required placeholder="A short summary of your question" />
          <div className="field-counter">{subject.length}/200 characters</div>
          <label className="field-label" htmlFor="description">How can we help?</label>
          <textarea id="description" className="field textarea" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={5000} required rows={7} placeholder="Share the details that will help our team understand your request." />
          <div className="field-counter">{description.length}/5000 characters</div>
          <div className="form-actions"><Link className="button button-secondary" to="/author/tickets">Cancel</Link><button className="button button-primary" type="submit" disabled={submitting || booksLoading}>{submitting ? "Submitting…" : "Submit ticket"}<Icon name="arrow" size={16} /></button></div>
        </form>
        <aside className="surface-card form-help"><span className="help-icon"><Icon name="message" /></span><span className="eyebrow">WHAT HAPPENS NEXT?</span><h2>Your request goes straight to our support team.</h2><p>We’ll review your message and reply in your ticket conversation. You can track updates from your support tickets page.</p><div className="help-timing"><Icon name="calendar" size={17} /><span>Typical support response: within 1–2 business days</span></div></aside>
      </div>
    </>
  );
}
