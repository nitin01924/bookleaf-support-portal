import { useEffect, useState } from "react";
import { Link } from "react-router";
import { apiRequest } from "../api/client.js";
import { EmptyState, ErrorState, LoadingState } from "../components/States.jsx";
import { PriorityBadge, StatusBadge } from "../components/Badges.jsx";
import Icon from "../components/Icon.jsx";
import { formatDate, getTicketId } from "../utils/format.js";

export default function AuthorDashboard() {
  const [data, setData] = useState({ books: [], tickets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [bookResult, ticketResult] = await Promise.all([
        apiRequest("/api/author/books"),
        apiRequest("/api/author/tickets"),
      ]);
      setData({ books: bookResult?.books || [], tickets: ticketResult?.tickets || [] });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const openTickets = data.tickets.filter((ticket) => !["Resolved", "Closed"].includes(ticket.status)).length;
  const latestTickets = data.tickets.slice(0, 5);

  return (
    <>
      <div className="page-heading">
        <div><span className="eyebrow">YOUR PUBLISHING DESK</span><h1>Good to see you</h1><p>Keep your books moving and your questions in one place.</p></div>
        <Link className="button button-primary" to="/author/tickets/new"><Icon name="plus" size={17} />Create a ticket</Link>
      </div>
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={load} /> : (
        <>
          <div className="stat-grid">
            <StatCard label="Your books" value={data.books.length} detail="In your BookLeaf catalogue" icon="books" tint="green" />
            <StatCard label="Open tickets" value={openTickets} detail="Waiting for a resolution" icon="ticket" tint="gold" />
            <StatCard label="All support tickets" value={data.tickets.length} detail="Your complete support history" icon="message" tint="blue" />
          </div>

          <div className="dashboard-columns">
            <section className="surface-card recent-card">
              <div className="card-heading"><div><span className="eyebrow">SUPPORT</span><h2>Recent tickets</h2></div><Link className="text-link" to="/author/tickets">View all <Icon name="arrow" size={15} /></Link></div>
              {latestTickets.length ? <div className="ticket-mini-list">
                {latestTickets.map((ticket) => <Link to={`/author/tickets/${ticket._id}`} className="ticket-mini-row" key={ticket._id}>
                  <span className="ticket-mini-icon"><Icon name="ticket" size={17} /></span>
                  <span className="ticket-mini-main"><strong>{ticket.subject}</strong><small>#{getTicketId(ticket)} · {formatDate(ticket.createdAt)}</small></span>
                  <StatusBadge value={ticket.status} />
                </Link>)}
              </div> : <EmptyState title="No tickets yet" message="Create a support ticket whenever you need help with a book or your account." action={<Link to="/author/tickets/new" className="button button-secondary">Create your first ticket</Link>} />}
            </section>
            <section className="surface-card welcome-card">
              <div className="welcome-card-icon"><Icon name="sparkle" size={21} /></div>
              <span className="eyebrow">A LITTLE GUIDANCE</span>
              <h2>Your next step, made simpler.</h2>
              <p>Share a clear subject and a few details. Our support team will review your request and reply in your ticket conversation.</p>
              <Link to="/author/books" className="text-link">Browse your books <Icon name="arrow" size={15} /></Link>
            </section>
          </div>

          <section className="surface-card books-preview">
            <div className="card-heading"><div><span className="eyebrow">CATALOGUE</span><h2>Books at a glance</h2></div><Link className="text-link" to="/author/books">See all books <Icon name="arrow" size={15} /></Link></div>
            {data.books.length ? <div className="book-preview-grid">
              {data.books.slice(0, 3).map((book) => <div className="book-preview" key={book.bookId}>
                <span className="book-cover"><Icon name="books" size={23} /></span>
                <span><strong>{book.title}</strong><small>{book.bookId} · {book.status || "Status unavailable"}</small></span>
              </div>)}
            </div> : <p className="muted">No books were returned for this account.</p>}
          </section>
        </>
      )}
    </>
  );
}

function StatCard({ label, value, detail, icon, tint }) {
  return <article className="stat-card"><span className={`stat-icon stat-${tint}`}><Icon name={icon} size={19} /></span><div><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong><span className="stat-detail">{detail}</span></div></article>;
}
