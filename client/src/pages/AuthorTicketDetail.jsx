import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { apiRequest } from "../api/client.js";
import { PriorityBadge, StatusBadge } from "../components/Badges.jsx";
import Icon from "../components/Icon.jsx";
import { EmptyState, ErrorState, LoadingState } from "../components/States.jsx";
import { formatDate, getTicketId } from "../utils/format.js";

export default function AuthorTicketDetail() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      // The backend scopes this list to the signed-in author and removes internal notes.
      const result = await apiRequest("/api/author/tickets");
      const found = (result?.tickets || []).find((item) => item._id === ticketId);
      setTicket(found || null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [ticketId]);

  const messages = (ticket?.messages || []).filter((message) => !message.isInternal);
  const conversation = messages.filter((message) => !(message.senderRole === "author" && message.body === ticket?.description));

  return (
    <>
      <Link className="back-link" to="/author/tickets"><Icon name="arrow" size={15} className="back-arrow" />Back to tickets</Link>
      {loading ? <LoadingState label="Loading ticket conversation…" /> : error ? <ErrorState message={error} onRetry={load} /> : !ticket ? <div className="surface-card"><EmptyState title="Ticket not found" message="This ticket may have been removed or may not belong to your account." /></div> : (
        <>
          <div className="detail-heading">
            <div><span className="eyebrow">TICKET #{getTicketId(ticket)}</span><h1>{ticket.subject}</h1><p>Created {formatDate(ticket.createdAt)}{ticket.bookId ? ` · Book ${ticket.bookId}` : " · Account or general request"}</p></div>
            <div className="badge-stack"><StatusBadge value={ticket.status} /><PriorityBadge value={ticket.priority} /></div>
          </div>
          <div className="detail-grid">
            <section className="surface-card conversation-card">
              <div className="card-heading"><div><span className="eyebrow">CONVERSATION</span><h2>Messages</h2></div><span className="message-count">{conversation.length + 1} messages</span></div>
              <article className="message-item author-message">
                <div className="message-avatar">You</div><div className="message-content"><div className="message-meta"><strong>Your request</strong><time>{formatDate(ticket.createdAt, { dateStyle: "medium", timeStyle: "short" })}</time></div><p>{ticket.description}</p></div>
              </article>
              {conversation.map((message) => <article className={`message-item ${message.senderRole === "admin" ? "support-message" : "author-message"}`} key={message._id || `${message.body}-${message.createdAt}`}>
                <div className="message-avatar">{message.senderRole === "admin" ? "BL" : "You"}</div><div className="message-content"><div className="message-meta"><strong>{message.senderRole === "admin" ? "BookLeaf Support" : "You"}</strong><time>{formatDate(message.createdAt, { dateStyle: "medium", timeStyle: "short" })}</time></div><p>{message.body}</p></div>
              </article>)}
              {conversation.length === 0 && <p className="conversation-hint">The support team’s replies will appear here.</p>}
            </section>
            <aside className="surface-card detail-aside">
              <span className="eyebrow">TICKET DETAILS</span>
              <div className="aside-detail"><span>Category</span><strong>{ticket.category || "General Inquiry"}</strong></div>
              <div className="aside-detail"><span>Priority</span><PriorityBadge value={ticket.priority} /></div>
              <div className="aside-detail"><span>Status</span><StatusBadge value={ticket.status} /></div>
              {ticket.bookId && <div className="aside-detail"><span>Related book</span><strong>{ticket.bookId}</strong></div>}
              <div className="reply-note"><Icon name="message" size={17} /><p>Replies from BookLeaf support are stored in this ticket. You’ll see them here when the team responds.</p></div>
            </aside>
          </div>
        </>
      )}
    </>
  );
}
