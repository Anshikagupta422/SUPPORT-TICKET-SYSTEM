const Ticket = require('../models/Ticket');
const Comment = require('../models/Comment');
const logActivity = require('../utils/logActivity');

// @desc   Add a comment/reply to a ticket
// @route  POST /api/tickets/:id/comments
// @access Private
const addComment = async (req, res, next) => {
  try {
    const { message } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (req.user.role !== 'admin' && String(ticket.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to comment on this ticket' });
    }

    const comment = await Comment.create({
      ticket: ticket._id,
      author: req.user._id,
      message,
    });

    await comment.populate('author', 'name role');

    await logActivity({
      ticket: ticket._id,
      actor: req.user._id,
      action: 'COMMENT_ADDED',
      detail: `${req.user.name} added a comment`,
    });

    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    next(err);
  }
};

// @desc   Get all comments for a ticket, chronological order
// @route  GET /api/tickets/:id/comments
// @access Private
const getComments = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    if (req.user.role !== 'admin' && String(ticket.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view these comments' });
    }

    const comments = await Comment.find({ ticket: ticket._id })
      .populate('author', 'name role')
      .sort({ createdAt: 1 });

    res.json({ success: true, data: comments });
  } catch (err) {
    next(err);
  }
};

module.exports = { addComment, getComments };
