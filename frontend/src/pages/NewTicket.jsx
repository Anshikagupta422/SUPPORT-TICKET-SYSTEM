import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CATEGORIES = ['Technical', 'Billing', 'Account', 'General', 'Feature Request'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const NewTicket = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', category: 'General', priority: 'Medium' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const { data } = await api.post('/tickets', form);
      navigate(`/tickets/${data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page narrow">
      <h1>New Support Ticket</h1>
      {error && <p className="error-text">{error}</p>}
      <form className="ticket-form" onSubmit={handleSubmit}>
        <label>Title</label>
        <input
          required
          maxLength={150}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <label>Description</label>
        <textarea
          required
          rows={6}
          maxLength={5000}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div className="form-row">
          <div>
            <label>Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Priority</label>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Create Ticket'}</button>
      </form>
    </div>
  );
};

export default NewTicket;
