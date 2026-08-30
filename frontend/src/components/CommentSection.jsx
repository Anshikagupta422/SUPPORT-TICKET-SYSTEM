import { useState } from 'react';

// Displays the conversation chronologically and lets the user post a new reply.
const CommentSection = ({ comments, onAdd, submitting }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    await onAdd(message.trim());
    setMessage('');
  };

  return (
    <div className="comment-section">
      <h3>Conversation</h3>
      <div className="comment-list">
        {comments.length === 0 && <p className="muted">No comments yet. Start the conversation below.</p>}
        {comments.map((c) => (
          <div key={c._id} className={`comment-bubble ${c.author?.role === 'admin' ? 'comment-admin' : 'comment-user'}`}>
            <div className="comment-meta">
              <strong>{c.author?.name || 'Unknown'}</strong>
              <span className="tag-muted">{c.author?.role}</span>
              <span className="tag-muted">{new Date(c.createdAt).toLocaleString()}</span>
            </div>
            <p>{c.message}</p>
          </div>
        ))}
      </div>
      <form className="comment-form" onSubmit={handleSubmit}>
        <textarea
          placeholder="Write a reply..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
        />
        <button type="submit" disabled={submitting || !message.trim()}>
          {submitting ? 'Posting...' : 'Post Reply'}
        </button>
      </form>
    </div>
  );
};

export default CommentSection;
