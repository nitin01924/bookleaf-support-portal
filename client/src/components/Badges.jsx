export function StatusBadge({ value }) {
  const key = String(value || "Open").toLowerCase().replaceAll(" ", "-");
  return <span className={`badge status-${key}`}>{value || "Unknown"}</span>;
}

export function PriorityBadge({ value }) {
  const key = String(value || "Medium").toLowerCase();
  return <span className={`badge priority-${key}`}>{value || "Medium"}</span>;
}
