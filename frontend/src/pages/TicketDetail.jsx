import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import CommentSection from '../components/CommentSection';
import ActivityTimeline from '../components/ActivityTimeline';

const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const TicketDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [tab, setTab] = useState('conversation');

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [ticketRes, commentsRes, activityRes] = await Promise.all([
        api.get(`/tickets/${id}`),
        api.get(`/tickets/${id}/comments`),
        api.get(`/tickets/${id}/activity`),
      ]);
      setTicket(ticketRes.data.data);
      setComments(commentsRes.data.data);
      setActivity(activityRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleAddComment = async (message) => {
    setPostingComment(true);
    try {
      const { data } = await api.post(`/tickets/${id}/comments`, { message });
      setComments((prev) => [...prev, data.data]);
      const { data: activityData } = await api.get(`/tickets/${id}/activity`);
      setActivity(activityData.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setPostingComment(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      const { data } = await api.patch(`/tickets/${id}/status`, { status });
      setTicket(data.data);
      const { data: activityData } = await api.get(`/tickets/${id}/activity`);
      setActivity(activityData.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handlePriorityChange = async (priority) => {
    try {
      const { data } = await api.patch(`/tickets/${id}`, { priority });
      setTicket(data.data);
      const { data: activityData } = await api.get(`/tickets/${id}/activity`);
      setActivity(activityData.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update priority');
    }
  };

  if (loading) return <div className="page"><p className="muted">Loading...</p></div>;
  if (error && !ticket) return <div className="page"><p className="error-text">{error}</p></div>;
  if (!ticket) return null;

  const isAdmin = user?.role === 'admin';

  return (
    <div className="page narrow">
      <Link to="/tickets" className="back-link">&larr; Back to tickets</Link>
      <div className="ticket-detail-header">
        <h1>{ticket.title}</h1>
        <StatusBadge status={ticket.status} />
      </div>
      {error && <p className="error-text">{error}</p>}

      <div className="ticket-detail-meta">
        <span className="tag">{ticket.category}</span>
        <PriorityBadge priority={ticket.priority} />
        <span className="tag-muted">Created by {ticket.createdBy?.name}</span>
        <span className="tag-muted">{new Date(ticket.createdAt).toLocaleString()}</span>
      </div>

      <p className="ticket-description">{ticket.description}</p>

      {isAdmin && (
        <div className="admin-controls">
          <div>
            <label>Status</label>
            <select value={ticket.status} onChange={(e) => handleStatusChange(e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Priority</label>
            <select value={ticket.priority} onChange={(e) => handlePriorityChange(e.target.value)}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="tabs">
        <button className={tab === 'conversation' ? 'tab active' : 'tab'} onClick={() => setTab('conversation')}>
          Conversation ({comments.length})
        </button>
        <button className={tab === 'activity' ? 'tab active' : 'tab'} onClick={() => setTab('activity')}>
          Activity Timeline
        </button>
      </div>

      {tab === 'conversation' ? (
        <CommentSection comments={comments} onAdd={handleAddComment} submitting={postingComment} />
      ) : (
        <ActivityTimeline activity={activity} />
      )}
    </div>
  );
};

export default TicketDetail;
