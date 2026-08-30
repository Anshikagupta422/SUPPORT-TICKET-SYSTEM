const { body, param, validationResult } = require('express-validator');
const { TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_STATUSES } = require('../models/Ticket');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors
        .array()
        .map((e) => e.msg)
        .join(', '),
    });
  }
  next();
};

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const createTicketRules = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 150 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 5000 }),
  body('category').isIn(TICKET_CATEGORIES).withMessage(`Category must be one of: ${TICKET_CATEGORIES.join(', ')}`),
  body('priority')
    .optional()
    .isIn(TICKET_PRIORITIES)
    .withMessage(`Priority must be one of: ${TICKET_PRIORITIES.join(', ')}`),
];

const updateStatusRules = [
  param('id').isMongoId().withMessage('Invalid ticket id'),
  body('status').isIn(TICKET_STATUSES).withMessage(`Status must be one of: ${TICKET_STATUSES.join(', ')}`),
];

const updateTicketRules = [
  param('id').isMongoId().withMessage('Invalid ticket id'),
  body('priority').optional().isIn(TICKET_PRIORITIES),
  body('category').optional().isIn(TICKET_CATEGORIES),
];

const commentRules = [
  param('id').isMongoId().withMessage('Invalid ticket id'),
  body('message').trim().notEmpty().withMessage('Comment message is required').isLength({ max: 3000 }),
];

const idParamRule = [param('id').isMongoId().withMessage('Invalid ticket id')];

module.exports = {
  handleValidation,
  registerRules,
  loginRules,
  createTicketRules,
  updateStatusRules,
  updateTicketRules,
  commentRules,
  idParamRule,
};
