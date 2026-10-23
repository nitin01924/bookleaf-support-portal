import { useEffect, useState } from "react";
import { Link } from "react-router";
import { apiRequest } from "../api/client.js";
import { PriorityBadge, StatusBadge } from "../components/Badges.jsx";
import Icon from "../components/Icon.jsx";
import { EmptyState, ErrorState, LoadingState } from "../components/States.jsx";
import { formatDate, getTicketId } from "../utils/format.js";

const categories = ["Royalty & Payments", "ISBN & Metadata Issues", "Printing & Quality", "Distribution & Availability", "Book Status & Production Updates", "General Inquiry"];
const statuses = ["Open", "In Progress", "Resolved", "Closed"];
const priorities = ["Critical", "High", "Medium", "Low"];

export default function AdminTicketQueue() {
  const [filters, setFilters] = useState({ status: "", category: "", priority: "" });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
      const suffix = query.size ? `?${query.toString()}` : "";
      const result = await apiRequest(`/api/admin/tickets${suffix}`);
      setTickets(Array.isArray(result?.tickets) ? result.tickets : []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filters.status, filters.category, filters.priority]);

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  const activeCount = tickets.filter((ticket) => !["Resolved", "Closed"].includes(ticket.status)).length;

  return (
    <>
      <div className="page-heading"><div><span className="eyebrow">SUPPORT OPERATIONS</span><h1>Ticket queue</h1><p>Review author requests and keep each conversation moving.</p></div><span className="count-pill">{tickets.length} tickets</span></div>
      <div className="admin-summary-row">
        <div className="summary-chip"><span className="summary-dot dot-open" /><strong>{activeCount}</strong><span>unresolved in this view</span></div>
        <div className="summary-chip"><span className="summary-dot dot-critical" /><strong>{tickets.filter((ticket) => ticket.priority === "Critical" && !["Resolved", "Closed"].includes(ticket.status)).length}</strong><span>critical and unresolved</span></div>
      </div>
      <section className="surface-card queue-card">
        <div className="queue-toolbar"><div><span className="eyebrow">INBOX</span><h2>All tickets</h2></div><div className="filter-row"><span className="filter-label"><Icon name="filter" size={16} />Filter by</span>
          <label className="sr-only" htmlFor="filter-status">Status</label><select id="filter-status" className="filter-select" value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}><option value="">All statuses</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select>
          <label className="sr-only" htmlFor="filter-category">Category</label><select id="filter-category" className="filter-select category-filter" value={filters.category} onChange={(event) => updateFilter("category", event.target.value)}><option value="">All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select>
          <label className="sr-only" htmlFor="filter-priority">Priority</label><select id="filter-priority" className="filter-select" value={filters.priority} onChange={(event) => updateFilter("priority", event.target.value)}><option value="">All priorities</option>{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select>
        </div></div>
        {loading ? <LoadingState label="Loading ticket queue…" /> : error ? <ErrorState message={error} onRetry={load} /> : tickets.length === 0 ? <EmptyState title="No matching tickets" message="Try a different filter combination or clear the active filters." action={(filters.status || filters.category || filters.priority) && <button className="button button-secondary" onClick={() => setFilters({ status: "", category: "", priority: "" })}>Clear filters</button>} /> : (
          <div className="table-scroll"><table className="data-table admin-table">
            <thead><tr><th>Request</th><th>Category</th><th>Priority</th><th>Status</th><th>Assigned to</th><th>Created</th><th><span className="sr-only">Open</span></th></tr></thead>
            <tbody>{tickets.map((ticket) => <tr className={ticket.priority === "Critical" && !["Resolved", "Closed"].includes(ticket.status) ? "critical-row" : ""} key={ticket._id}>
              <td><Link className="table-ticket-title" to={`/admin/tickets/${ticket._id}`}>{ticket.subject || "Untitled request"}<small>#{getTicketId(ticket)}{ticket.bookId ? ` · ${ticket.bookId}` : " · General"}</small></Link></td>
              <td className="category-cell">{ticket.category || "General Inquiry"}</td><td><PriorityBadge value={ticket.priority} /></td><td><StatusBadge value={ticket.status} /></td>
              <td>{ticket.assignedAdminId ? <span className="assigned-tag">Assigned</span> : <span className="unassigned">Unassigned</span>}</td><td>{formatDate(ticket.createdAt)}</td>
              <td><Link className="row-arrow" aria-label={`Open ${ticket.subject}`} to={`/admin/tickets/${ticket._id}`}><Icon name="arrow" size={16} /></Link></td>
            </tr>)}</tbody>
          </table></div>
        )}
        {!loading && !error && tickets.length > 0 && <p className="table-footnote">Showing tickets in the order provided by the support service.</p>}
      </section>
    </>
  );
}
