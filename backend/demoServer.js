const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Simple in-memory demo stores
let nextId = 1;
const genId = () => String(nextId++);
const genToken = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const users = [];
const tokens = new Map(); // token -> userId
const tickets = [];
const comments = [];
const activities = [];

// Seed an admin user
const adminUser = { _id: genId(), name: 'Admin', email: 'admin@example.com', password: 'admin', role: 'admin' };
users.push(adminUser);

// Middleware: demo protect (checks Authorization: Bearer <token>)
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (!token) return res.status(401).json({ success: false, message: 'Not authorized, no token provided (demo)' });
  const userId = tokens.get(token);
  const user = users.find((u) => u._id === userId);
  if (!user) return res.status(401).json({ success: false, message: 'Not authorized, invalid token (demo)' });
  req.user = { ...user };
  delete req.user.password;
  next();
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required (demo)' });
  next();
};

app.get('/api/health', (req, res) => res.json({ success: true, message: 'Demo API healthy' }));

// Auth
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email and password required' });
  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) return res.status(400).json({ success: false, message: 'Email is already registered' });
  const user = { _id: genId(), name, email: email.toLowerCase(), password, role: role === 'admin' ? 'admin' : 'user' };
  users.push(user);
  const token = genToken();
  tokens.set(token, user._id);
  const { password: pw, ...out } = user;
  return res.status(201).json({ success: true, data: { ...out, token } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase() && u.password === password);
  if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });
  const token = genToken();
  tokens.set(token, user._id);
  const { password: pw, ...out } = user;
  return res.json({ success: true, data: { ...out, token } });
});

app.get('/api/auth/me', protect, (req, res) => res.json({ success: true, data: req.user }));

// Tickets
app.post('/api/tickets', protect, (req, res) => {
  const { title, description, category, priority } = req.body || {};
  if (!title || !description || !category) return res.status(400).json({ success: false, message: 'Title, description and category required' });
  const ticket = {
    _id: genId(),
    title,
    description,
    category,
    priority: priority || 'Medium',
    status: 'Open',
    createdBy: req.user._id,
    assignedTo: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tickets.push(ticket);
  activities.push({ _id: genId(), ticket: ticket._id, actor: req.user._id, action: 'TICKET_CREATED', detail: `Created`, createdAt: new Date().toISOString() });
  return res.status(201).json({ success: true, data: ticket });
});

app.get('/api/tickets', protect, (req, res) => {
  const { search, status, priority, category, page = '1', limit = '10' } = req.query;
  let list = tickets.slice();
  if (req.user.role !== 'admin') list = list.filter((t) => t.createdBy === req.user._id);
  if (status) list = list.filter((t) => t.status === status);
  if (priority) list = list.filter((t) => t.priority === priority);
  if (category) list = list.filter((t) => t.category === category);
  if (search) {
    const s = search.toLowerCase();
    list = list.filter((t) => t.title.toLowerCase().includes(s) || t.description.toLowerCase().includes(s));
  }
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const start = (pageNum - 1) * limitNum;
  const data = list.slice(start, start + limitNum).map((t) => ({ ...t }));
  return res.json({ success: true, data, pagination: { total: list.length, page: pageNum, limit: limitNum, totalPages: Math.ceil(list.length / limitNum) || 1 } });
});

app.get('/api/tickets/:id', protect, (req, res) => {
  const ticket = tickets.find((t) => t._id === req.params.id);
  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
  if (req.user.role !== 'admin' && ticket.createdBy !== req.user._id) return res.status(403).json({ success: false, message: 'Not authorized to view this ticket' });
  return res.json({ success: true, data: ticket });
});

app.patch('/api/tickets/:id/status', protect, adminOnly, (req, res) => {
  const ticket = tickets.find((t) => t._id === req.params.id);
  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ success: false, message: 'Status required' });
  const old = ticket.status;
  ticket.status = status;
  ticket.updatedAt = new Date().toISOString();
  activities.push({ _id: genId(), ticket: ticket._id, actor: req.user._id, action: 'STATUS_CHANGED', detail: `${old} -> ${status}`, createdAt: new Date().toISOString() });
  return res.json({ success: true, data: ticket });
});

app.patch('/api/tickets/:id', protect, adminOnly, (req, res) => {
  const ticket = tickets.find((t) => t._id === req.params.id);
  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
  const { priority, category, assignedTo } = req.body || {};
  if (priority && priority !== ticket.priority) {
    activities.push({ _id: genId(), ticket: ticket._id, actor: req.user._id, action: 'PRIORITY_CHANGED', detail: `${ticket.priority} -> ${priority}`, createdAt: new Date().toISOString() });
    ticket.priority = priority;
  }
  if (category && category !== ticket.category) {
    activities.push({ _id: genId(), ticket: ticket._id, actor: req.user._id, action: 'CATEGORY_CHANGED', detail: `${ticket.category} -> ${category}`, createdAt: new Date().toISOString() });
    ticket.category = category;
  }
  if (assignedTo !== undefined) {
    ticket.assignedTo = assignedTo || null;
    activities.push({ _id: genId(), ticket: ticket._id, actor: req.user._id, action: 'TICKET_ASSIGNED', detail: assignedTo ? 'Assigned' : 'Unassigned', createdAt: new Date().toISOString() });
  }
  ticket.updatedAt = new Date().toISOString();
  return res.json({ success: true, data: ticket });
});

app.delete('/api/tickets/:id', protect, adminOnly, (req, res) => {
  const idx = tickets.findIndex((t) => t._id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Ticket not found' });
  const ticket = tickets[idx];
  tickets.splice(idx, 1);
  // remove comments and activities
  for (let i = comments.length - 1; i >= 0; i--) if (comments[i].ticket === ticket._id) comments.splice(i, 1);
  for (let i = activities.length - 1; i >= 0; i--) if (activities[i].ticket === ticket._id) activities.splice(i, 1);
  return res.json({ success: true, message: 'Ticket deleted' });
});

// Comments
app.post('/api/tickets/:id/comments', protect, (req, res) => {
  const ticket = tickets.find((t) => t._id === req.params.id);
  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
  if (req.user.role !== 'admin' && ticket.createdBy !== req.user._id) return res.status(403).json({ success: false, message: 'Not authorized to comment' });
  const { message } = req.body || {};
  if (!message) return res.status(400).json({ success: false, message: 'Message required' });
  const comment = { _id: genId(), ticket: ticket._id, author: req.user._id, message, createdAt: new Date().toISOString() };
  comments.push(comment);
  activities.push({ _id: genId(), ticket: ticket._id, actor: req.user._id, action: 'COMMENT_ADDED', detail: `${req.user.name} commented`, createdAt: new Date().toISOString() });
  const out = { ...comment, author: { _id: req.user._id, name: req.user.name, role: req.user.role } };
  return res.status(201).json({ success: true, data: out });
});

app.get('/api/tickets/:id/comments', protect, (req, res) => {
  const ticket = tickets.find((t) => t._id === req.params.id);
  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
  if (req.user.role !== 'admin' && ticket.createdBy !== req.user._id) return res.status(403).json({ success: false, message: 'Not authorized to view comments' });
  const out = comments.filter((c) => c.ticket === ticket._id).map((c) => ({ ...c, author: users.find((u) => u._id === c.author) ? { _id: c.author, name: users.find((u) => u._id === c.author).name, role: users.find((u) => u._id === c.author).role } : null }));
  return res.json({ success: true, data: out });
});

// Activity
app.get('/api/tickets/:id/activity', protect, (req, res) => {
  const ticket = tickets.find((t) => t._id === req.params.id);
  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
  if (req.user.role !== 'admin' && ticket.createdBy !== req.user._id) return res.status(403).json({ success: false, message: 'Not authorized to view activity' });
  const out = activities.filter((a) => a.ticket === ticket._id).map((a) => ({ ...a, actor: users.find((u) => u._id === a.actor) ? { _id: a.actor, name: users.find((u) => u._id === a.actor).name, role: users.find((u) => u._id === a.actor).role } : null }));
  return res.json({ success: true, data: out });
});

// Serve frontend in production (optional)
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Demo server running on port ${PORT}`));

module.exports = app;
