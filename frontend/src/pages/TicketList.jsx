import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import TicketCard from '../components/TicketCard';
import TicketFilters from '../components/TicketFilters';
import Pagination from '../components/Pagination';

// User-facing "My Tickets" view. Admins hitting this route see only their own
// created tickets too -- the full list lives on /admin.
const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', category: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { ...filters, page, limit: 9 };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await api.get('/tickets', { params });
      setTickets(data.data);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleFilterChange = (next) => {
    setFilters(next);
    setPage(1);
  };

  return (
    <div className="page">
      <h1>My Tickets</h1>
      <TicketFilters filters={filters} onChange={handleFilterChange} />
      {error && <p className="error-text">{error}</p>}
      {loading ? (
        <p className="muted">Loading tickets...</p>
      ) : tickets.length === 0 ? (
        <p className="muted">No tickets found. Create one to get started.</p>
      ) : (
        <div className="ticket-grid">
          {tickets.map((t) => (
            <TicketCard key={t._id} ticket={t} />
          ))}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
};

export default TicketList;
