import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { apiRequest } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { PriorityBadge, StatusBadge } from "../components/Badges.jsx";
import Icon from "../components/Icon.jsx";
import { EmptyState, ErrorState, LoadingState, Notice } from "../components/States.jsx";
import { formatDate, getTicketId } from "../utils/format.js";

const categories = ["Royalty & Payments", "ISBN & Metadata Issues", "Printing & Quality", "Distribution & Availability", "Book Status & Production Updates", "General Inquiry"];
const priorities = ["Critical", "High", "Medium", "Low"];
const statuses = ["Open", "In Progress", "Resolved", "Closed"];

export default function AdminTicketDetail() {
  const { ticketId } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [fields, setFields] = useState({ category: "", priority: "", status: "" });
  const [saving, setSaving] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [sending, setSending] = useState(false);
  const [messageBody, setMessageBody] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [draftSource, setDraftSource] = useState("");

  async function load() {
    setLoading(true);
    setLoadError("");
    try {
      // The existing admin queue includes complete ticket records and is capped at 200.
      const result = await apiRequest("/api/admin/tickets");
      const found = (result?.tickets || []).find((item) => item._id === ticketId);
      setTicket(found || null);
    } catch (requestError) {
      setLoadError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [ticketId]);
  useEffect(() => {
    if (ticket) setFields({ category: ticket.category, priority: ticket.priority, status: ticket.status });
  }, [ticket]);

  async function saveTicket(event) {
    event.preventDefault();
    setSaving(true); setActionError(""); setNotice("");
    try {
      const result = await apiRequest(`/api/admin/tickets/${ticketId}`, { method: "PATCH", body: fields });
      setTicket(result.ticket);
      setNotice("Ticket details updated.");
    } catch (requestError) { setActionError(requestError.message); }
    finally { setSaving(false); }
  }

  async function assignToMe() {
    setAssigning(true); setActionError(""); setNotice("");
    try {
      const result = await apiRequest(`/api/admin/tickets/${ticketId}/assign`, { method: "PATCH", body: {} });
      setTicket(result.ticket);
      setNotice("Ticket assigned to your account.");
    } catch (requestError) { setActionError(requestError.message); }
    finally { setAssigning(false); }
  }

  async function generateDraft() {
    setDrafting(true); setActionError(""); setNotice("");
    try {
      const result = await apiRequest(`/api/admin/tickets/${ticketId}/draft-reply`, { method: "POST" });
      if (!result?.draft) throw new Error("The server did not return a draft.");
      setMessageBody(result.draft);
      setDraftSource(result.source || "unknown");
      setIsInternal(false);
      setNotice("Draft added to the editor. Review and edit it before sending.");
    } catch (requestError) { setActionError(requestError.message); }
    finally { setDrafting(false); }
  }

  async function sendMessage(event) {
    event.preventDefault();
    if (!messageBody.trim()) return;
    if (isInternal && !window.confirm("Add this internal note? Authors will not be able to see it.")) return;
    setSending(true); setActionError(""); setNotice("");
    try {
      const result = await apiRequest(`/api/admin/tickets/${ticketId}/messages`, {
        method: "POST",
        body: { body: messageBody.trim(), isInternal },
      });
      setTicket(result.ticket);
      setMessageBody("");
      setDraftSource("");
      setNotice(isInternal ? "Internal note added." : "Public reply stored in the ticket conversation.");
    } catch (requestError) { setActionError(requestError.message); }
    finally { setSending(false); }
  }

  return (
    <>
      <Link className="back-link" to="/admin/tickets"><Icon name="arrow" size={15} className="back-arrow" />Back to queue</Link>
      {loading ? <LoadingState label="Loading ticket details…" /> : loadError ? <ErrorState message={loadError} onRetry={load} /> : !ticket ? <div className="surface-card"><EmptyState title="Ticket not found in queue" message="The admin API returns up to 200 tickets. Return to the queue and open a ticket from the current list." action={<Link className="button button-secondary" to="/admin/tickets">Back to queue</Link>} /></div> : (
        <>
          <div className="detail-heading admin-detail-heading">
            <div><span className="eyebrow">TICKET #{getTicketId(ticket)}</span><h1>{ticket.subject}</h1><p>Submitted {formatDate(ticket.createdAt)}{ticket.bookId ? ` · Book ${ticket.bookId}` : " · General or account request"} · Author {ticket.authorId}</p></div>
            <div className="badge-stack"><StatusBadge value={ticket.status} /><PriorityBadge value={ticket.priority} /></div>
          </div>
          <Notice kind="error">{actionError}</Notice><Notice>{notice}</Notice>
          <div className="admin-detail-grid">
            <div className="admin-detail-main">
              <section className="surface-card original-request">
                <div className="card-heading"><div><span className="eyebrow">AUTHOR REQUEST</span><h2>Original message</h2></div><time>{formatDate(ticket.createdAt, { dateStyle: "medium", timeStyle: "short" })}</time></div>
                <p>{ticket.description}</p>
              </section>
              <section className="surface-card conversation-card admin-conversation">
                <div className="card-heading"><div><span className="eyebrow">TICKET HISTORY</span><h2>Conversation & notes</h2></div><span className="message-count">{(ticket.messages || []).length} messages</span></div>
                {(ticket.messages || []).map((message) => <article className={`message-item ${message.isInternal ? "internal-message" : message.senderRole === "admin" ? "support-message" : "author-message"}`} key={message._id || `${message.body}-${message.createdAt}`}>
                  <div className="message-avatar">{message.senderRole === "admin" ? "BL" : "AU"}</div><div className="message-content"><div className="message-meta"><strong>{message.senderRole === "admin" ? "BookLeaf Support" : "Author"}{message.isInternal && <span className="internal-label">INTERNAL NOTE</span>}</strong><time>{formatDate(message.createdAt, { dateStyle: "medium", timeStyle: "short" })}</time></div><p>{message.body}</p></div>
                </article>)}
                {(!ticket.messages || ticket.messages.length === 0) && <p className="muted">No messages have been added to this ticket.</p>}
              </section>
              <section className="surface-card reply-card">
                <div className="card-heading"><div><span className="eyebrow">COMPOSE</span><h2>Reply or add a note</h2></div></div>
                <div className="composer-toolbar">
                  <div className="message-type-toggle" role="group" aria-label="Message visibility">
                    <button type="button" className={!isInternal ? "selected" : ""} onClick={() => setIsInternal(false)}>Public reply</button>
                    <button type="button" className={isInternal ? "selected internal-selected" : ""} onClick={() => setIsInternal(true)}>Internal note</button>
                  </div>
                  <button className="button button-secondary draft-button" type="button" onClick={generateDraft} disabled={drafting || sending}>{drafting ? <><span className="spinner small-spinner" />Generating…</> : <><Icon name="sparkle" size={16} />Generate AI draft</>}</button>
                </div>
                {draftSource && <div className="draft-source"><Icon name="sparkle" size={14} />Draft source: <strong>{draftSource === "gemini" ? "Gemini" : "fallback"}</strong> · editable before sending</div>}
                <form onSubmit={sendMessage}>
                  <label className="sr-only" htmlFor="admin-message">{isInternal ? "Internal note" : "Public reply"}</label>
                  <textarea id="admin-message" className="field textarea composer-textarea" value={messageBody} onChange={(event) => setMessageBody(event.target.value)} maxLength={5000} rows={6} placeholder={isInternal ? "Write an internal note for the BookLeaf team…" : "Write a reply visible to the author…"} required />
                  <div className="composer-footer"><span>{isInternal ? "Only admins can see this note." : "This reply will be stored in the ticket conversation."} {messageBody.length}/5000</span><button className={`button ${isInternal ? "button-note" : "button-primary"}`} type="submit" disabled={sending || drafting || !messageBody.trim()}>{sending ? "Saving…" : isInternal ? "Add internal note" : "Send reply"}<Icon name="arrow" size={16} /></button></div>
                </form>
              </section>
            </div>
            <aside className="surface-card ticket-controls">
              <div className="card-heading"><div><span className="eyebrow">WORKFLOW</span><h2>Ticket controls</h2></div></div>
              <form className="control-form" onSubmit={saveTicket}>
                <label className="field-label" htmlFor="ticket-category">Category</label><select id="ticket-category" className="field" value={fields.category} onChange={(event) => setFields({ ...fields, category: event.target.value })}>{categories.map((item) => <option key={item}>{item}</option>)}</select>
                <label className="field-label" htmlFor="ticket-priority">Priority</label><select id="ticket-priority" className="field" value={fields.priority} onChange={(event) => setFields({ ...fields, priority: event.target.value })}>{priorities.map((item) => <option key={item}>{item}</option>)}</select>
                <label className="field-label" htmlFor="ticket-status">Status</label><select id="ticket-status" className="field" value={fields.status} onChange={(event) => setFields({ ...fields, status: event.target.value })}>{statuses.map((item) => <option key={item}>{item}</option>)}</select>
                <button className="button button-primary full-button" type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
              </form>
              <div className="assignment-block"><span className="field-label">Assignment</span><div className="assignment-detail">{ticket.assignedAdminId ? <><span className="avatar small-avatar">{String(ticket.assignedAdminId).slice(-2).toUpperCase()}</span><span><strong>{ticket.assignedAdminId === user?.id ? "Assigned to you" : "Assigned"}</strong><small>{ticket.assignedAdminId}</small></span></> : <span className="muted">Not assigned</span>}</div><button type="button" className="button button-secondary full-button" onClick={assignToMe} disabled={assigning}>{assigning ? "Assigning…" : ticket.assignedAdminId === user?.id ? "Reassign to me" : "Assign to me"}</button></div>
              <div className="private-note-hint"><Icon name="alert" size={16} /><span>Internal notes are filtered from author ticket responses by the backend.</span></div>
            </aside>
          </div>
        </>
      )}
    </>
  );
}
