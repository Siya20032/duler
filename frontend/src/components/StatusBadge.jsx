function StatusBadge({ status = "unknown" }) {
  const normalized = String(status).toLowerCase();

  let className = "status-badge";

  if (
    normalized === "running" ||
    normalized === "active" ||
    normalized === "success" ||
    normalized === "completed"
  ) {
    className += " status-success";
  } else if (
    normalized === "failed" ||
    normalized === "error" ||
    normalized === "dead"
  ) {
    className += " status-danger";
  } else if (
    normalized === "pending" ||
    normalized === "queued" ||
    normalized === "waiting"
  ) {
    className += " status-warning";
  } else {
    className += " status-neutral";
  }

  return <span className={className}>{status}</span>;
}

export default StatusBadge;