export function formatDate(value, options = { dateStyle: "medium" }) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", options).format(date);
}

export function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return null;
  const amount = Number(value);
  if (!Number.isFinite(amount)) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getTicketId(ticket) {
  return ticket?.ticketNumber || String(ticket?._id || "").slice(-8).toUpperCase();
}

export function getHomePath(user) {
  if (user?.role === "admin") return "/admin/tickets";
  if (user?.role === "author") return "/author";
  return "/login";
}
