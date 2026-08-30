const Ticket = require('../models/Ticket');
const Activity = require('../models/Activity');
const Comment = require('../models/Comment');
const logActivity = require('../utils/logActivity');

// @desc   Create a new support ticket
// @route  POST /api/tickets
// @access Private (user or admin)
const createTicket = async (req, res, next) => {
  try {
    const { title, description, category, priority } = req.body;

    const ticket = await Ticket.create({
      title,
      description,
      category,
      priority: priority || 'Medium',
      createdBy: req.user._id,
    });

    await logActivity({
      ticket: ticket._id,
      actor: req.user._id,
      action: 'TICKET_CREATED',
      detail: `Ticket created with priority "${ticket.priority}" in category "${ticket.category}"`,
    });

    res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

// @desc   Get tickets (admin sees all, user sees only their own) with search + filters
// @route  GET /api/tickets?search=&status=&priority=&category=&page=&limit=
// @access Private
const getTickets = async (req, res, next) => {
  try {
    const { search, status, priority, category, page = 1, limit = 10 } = req.query;

    const query = {};

    // Regular users only ever see their own tickets; admins see everything.
    if (req.user.role !== 'admin') {
      query.createdBy = req.user._id;
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: regex }, { description: regex }];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [tickets, total] = await Promise.all([
      Ticket.find(query)
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Ticket.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: tickets,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Get a single ticket (with permission check for non-admins)
// @route  GET /api/tickets/:id
// @access Private
const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const createdById = ticket.createdBy?._id || ticket.createdBy;
    if (req.user.role !== 'admin' && String(createdById) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this ticket' });
    }

    res.json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

// @desc   Update ticket status (admin only)
// @route  PATCH /api/tickets/:id/status
// @access Private/Admin
const updateTicketStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const oldStatus = ticket.status;
    if (oldStatus === status) {
      return res.json({ success: true, data: ticket });
    }

    ticket.status = status;
    await ticket.save();

    await logActivity({
      ticket: ticket._id,
      actor: req.user._id,
      action: 'STATUS_CHANGED',
      detail: `${oldStatus} -> ${status}`,
    });

    if (status === 'Resolved') {
      await logActivity({
        ticket: ticket._id,
        actor: req.user._id,
        action: 'STATUS_CHANGED',
        detail: 'Ticket marked as Resolved',
      });
    }

    res.json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

// @desc   Update ticket priority/category/assignment (admin only)
// @route  PATCH /api/tickets/:id
// @access Private/Admin
const updateTicket = async (req, res, next) => {
  try {
    const { priority, category, assignedTo } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (priority && priority !== ticket.priority) {
      await logActivity({
        ticket: ticket._id,
        actor: req.user._id,
        action: 'PRIORITY_CHANGED',
        detail: `${ticket.priority} -> ${priority}`,
      });
      ticket.priority = priority;
    }

    if (category && category !== ticket.category) {
      await logActivity({
        ticket: ticket._id,
        actor: req.user._id,
        action: 'CATEGORY_CHANGED',
        detail: `${ticket.category} -> ${category}`,
      });
      ticket.category = category;
    }

    if (assignedTo !== undefined && String(assignedTo) !== String(ticket.assignedTo || '')) {
      ticket.assignedTo = assignedTo || null;
      await logActivity({
        ticket: ticket._id,
        actor: req.user._id,
        action: 'TICKET_ASSIGNED',
        detail: assignedTo ? 'Ticket assigned to an agent' : 'Ticket unassigned',
      });
    }

    await ticket.save();
    res.json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

// @desc   Delete a ticket (admin only)
// @route  DELETE /api/tickets/:id
// @access Private/Admin
const deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    await Promise.all([
      ticket.deleteOne(),
      Comment.deleteMany({ ticket: ticket._id }),
      Activity.deleteMany({ ticket: ticket._id }),
    ]);
    res.json({ success: true, message: 'Ticket deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc   Get activity/history timeline for a ticket
// @route  GET /api/tickets/:id/activity
// @access Private
const getTicketActivity = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    const createdById = ticket.createdBy?._id || ticket.createdBy;
    if (req.user.role !== 'admin' && String(createdById) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this ticket' });
    }

    const activity = await Activity.find({ ticket: ticket._id })
      .populate('actor', 'name role')
      .sort({ createdAt: 1 });

    res.json({ success: true, data: activity });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  updateTicket,
  deleteTicket,
  getTicketActivity,
};
