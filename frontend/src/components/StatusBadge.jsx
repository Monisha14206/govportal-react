export default function StatusBadge({ status }) {
  const slug = status.replace(/\s+/g, '-').toLowerCase();
  return <span className={`badge status-badge status-${slug}`}>{status}</span>;
}
