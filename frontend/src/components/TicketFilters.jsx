const CATEGORIES = ['Technical', 'Billing', 'Account', 'General', 'Feature Request'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];

// Reusable search + filter bar used by both the user ticket list and admin dashboard.
const TicketFilters = ({ filters, onChange }) => {
  const update = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="filters-bar">
      <input
        className="search-input"
        placeholder="Search by title or description..."
        value={filters.search || ''}
        onChange={(e) => update('search', e.target.value)}
      />
      <select value={filters.status || ''} onChange={(e) => update('status', e.target.value)}>
        <option value="">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <select value={filters.priority || ''} onChange={(e) => update('priority', e.target.value)}>
        <option value="">All priorities</option>
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
      <select value={filters.category || ''} onChange={(e) => update('category', e.target.value)}>
        <option value="">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
};

export default TicketFilters;
