import { useEffect, useState } from "react";
import { Link } from "react-router";
import { apiRequest } from "../api/client.js";
import { PriorityBadge, StatusBadge } from "../components/Badges.jsx";
import { EmptyState, ErrorState, LoadingState } from "../components/States.jsx";
import Icon from "../components/Icon.jsx";
import { formatDate, getTicketId } from "../utils/format.js";

export default function AuthorTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const result = await apiRequest("/api/author/tickets");
      setTickets(Array.isArray(result?.tickets) ? result.tickets : []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <>
      <div className="page-heading"><div><span className="eyebrow">YOUR SUPPORT HISTORY</span><h1>Support tickets</h1><p>Follow your requests and read replies from the BookLeaf team.</p></div><Link className="button button-primary" to="/author/tickets/new"><Icon name="plus" size={17} />New ticket</Link></div>
      {loading ? <LoadingState label="Loading your tickets…" /> : error ? <ErrorState message={error} onRetry={load} /> : tickets.length === 0 ? <div className="surface-card"><EmptyState title="Your inbox is clear" message="When you need help, create a ticket and it will appear here." action={<Link className="button button-primary" to="/author/tickets/new">Create a ticket</Link>} /></div> : (
        <div className="surface-card table-card">
          <div className="table-scroll"><table className="data-table">
            <thead><tr><th>Ticket</th><th>Category</th><th>Priority</th><th>Status</th><th>Created</th><th><span className="sr-only">Open</span></th></tr></thead>
            <tbody>{tickets.map((ticket) => <tr key={ticket._id}>
              <td><Link className="table-ticket-title" to={`/author/tickets/${ticket._id}`}>{ticket.subject || "Untitled request"}<small>#{getTicketId(ticket)}</small></Link></td>
              <td>{ticket.category || "General Inquiry"}</td>
              <td><PriorityBadge value={ticket.priority} /></td>
              <td><StatusBadge value={ticket.status} /></td>
              <td>{formatDate(ticket.createdAt)}</td>
              <td><Link className="row-arrow" aria-label={`Open ${ticket.subject}`} to={`/author/tickets/${ticket._id}`}><Icon name="arrow" size={16} /></Link></td>
            </tr>)}</tbody>
          </table></div>
          <p className="table-footnote"><Icon name="check" size={14} />Only messages visible to your author account are shown.</p>
        </div>
      )}
    </>
  );
}
