const COLORS = {
  Low: '#16a34a',
  Medium: '#2563eb',
  High: '#d97706',
  Urgent: '#dc2626',
};

const PriorityBadge = ({ priority }) => (
  <span className="badge badge-outline" style={{ borderColor: COLORS[priority] || '#6b7280', color: COLORS[priority] || '#6b7280' }}>
    {priority}
  </span>
);

export default PriorityBadge;
