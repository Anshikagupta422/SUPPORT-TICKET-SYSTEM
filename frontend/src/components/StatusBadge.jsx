const COLORS = {
  Open: '#2563eb',
  'In Progress': '#d97706',
  Resolved: '#16a34a',
  Closed: '#6b7280',
};

const StatusBadge = ({ status }) => (
  <span className="badge" style={{ backgroundColor: COLORS[status] || '#6b7280' }}>
    {status}
  </span>
);

export default StatusBadge;
