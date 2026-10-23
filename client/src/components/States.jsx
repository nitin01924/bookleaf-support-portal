import Icon from "./Icon.jsx";

export function LoadingState({ label = "Loading your information…" }) {
  return <div className="state-card" role="status"><span className="spinner" />{label}</div>;
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state-card state-error" role="alert">
      <Icon name="alert" />
      <span>{message || "Something went wrong. Please try again."}</span>
      {onRetry && <button className="button button-quiet" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><Icon name="ticket" size={22} /></div>
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  );
}

export function Notice({ children, kind = "success" }) {
  if (!children) return null;
  return <div className={`notice notice-${kind}`} role={kind === "error" ? "alert" : "status"}>{children}</div>;
}
