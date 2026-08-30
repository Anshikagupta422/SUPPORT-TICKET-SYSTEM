import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

const TicketCard = ({ ticket }) => (
  <Link to={`/tickets/${ticket._id}`} className="ticket-card">
    <div className="ticket-card-header">
      <h3>{ticket.title}</h3>
      <StatusBadge status={ticket.status} />
    </div>
    <p className="ticket-card-desc">{ticket.description}</p>
    <div className="ticket-card-meta">
      <span className="tag">{ticket.category}</span>
      <PriorityBadge priority={ticket.priority} />
      {ticket.createdBy?.name && <span className="tag-muted">by {ticket.createdBy.name}</span>}
      <span className="tag-muted">{new Date(ticket.createdAt).toLocaleDateString()}</span>
    </div>
  </Link>
);

export default TicketCard;
