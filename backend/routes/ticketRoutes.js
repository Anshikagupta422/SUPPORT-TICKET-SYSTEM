const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  updateTicket,
  deleteTicket,
  getTicketActivity,
} = require('../controllers/ticketController');
const { addComment, getComments } = require('../controllers/commentController');
const { protect, adminOnly } = require('../middleware/auth');
const {
  createTicketRules,
  updateStatusRules,
  updateTicketRules,
  commentRules,
  idParamRule,
  handleValidation,
} = require('../utils/validators');

router.use(protect); // every ticket route requires a logged-in user

router.route('/').post(createTicketRules, handleValidation, createTicket).get(getTickets);

router
  .route('/:id')
  .get(idParamRule, handleValidation, getTicketById)
  .patch(adminOnly, updateTicketRules, handleValidation, updateTicket)
  .delete(adminOnly, idParamRule, handleValidation, deleteTicket);

router.patch('/:id/status', adminOnly, updateStatusRules, handleValidation, updateTicketStatus);

router.get('/:id/activity', idParamRule, handleValidation, getTicketActivity);

router
  .route('/:id/comments')
  .get(idParamRule, handleValidation, getComments)
  .post(commentRules, handleValidation, addComment);

module.exports = router;
