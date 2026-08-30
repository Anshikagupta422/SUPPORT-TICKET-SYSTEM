const ACTION_LABELS = {
  TICKET_CREATED: 'created the ticket',
  STATUS_CHANGED: 'changed status',
  PRIORITY_CHANGED: 'changed priority',
  CATEGORY_CHANGED: 'changed category',
  COMMENT_ADDED: 'added a comment',
  TICKET_ASSIGNED: 'updated assignment',
};

// Bonus feature: chronological timeline of everything that happened to a ticket.
const ActivityTimeline = ({ activity }) => {
  if (!activity || activity.length === 0) {
    return <p className="muted">No activity recorded yet.</p>;
  }

  return (
    <ul className="timeline">
      {activity.map((a) => (
        <li key={a._id} className="timeline-item">
          <span className={`timeline-dot dot-${a.action.toLowerCase()}`} />
          <div>
            <p>
              <strong>{a.actor?.name || 'Someone'}</strong> {ACTION_LABELS[a.action] || a.action}
              {a.detail ? `: ${a.detail}` : ''}
            </p>
            <span className="tag-muted">{new Date(a.createdAt).toLocaleString()}</span>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ActivityTimeline;
