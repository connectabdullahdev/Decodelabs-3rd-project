// ============================================================
// validate.middleware.js — Input Validation (Gatekeeper Rule)
// PDF: "Never Trust the Client — Validate Everything Server-Side"
//      Layer 1 — Syntactic: Is the format correct?
//      Layer 2 — Semantic:  Is the logic valid?
// ============================================================

const { sendError } = require('../utils/response');

const VALID_STATUS   = ['pending', 'in-progress', 'completed'];
const VALID_PRIORITY = ['low', 'medium', 'high'];

// ── Validate POST /tasks ─────────────────────────────────────
function validateCreateTask(req, res, next) {
  const errors = [];
  const { title, status, priority } = req.body;

  // Syntactic — is the format correct?
  if (!title || typeof title !== 'string' || !title.trim())
    errors.push({ field: 'title', message: 'Title is required and must be a non-empty string.' });
  else if (title.trim().length > 100)
    errors.push({ field: 'title', message: 'Title must not exceed 100 characters.' });

  // Semantic — is the value logically valid?
  if (status !== undefined && !VALID_STATUS.includes(status))
    errors.push({ field: 'status', message: `Status must be one of: ${VALID_STATUS.join(', ')}.` });

  if (priority !== undefined && !VALID_PRIORITY.includes(priority))
    errors.push({ field: 'priority', message: `Priority must be one of: ${VALID_PRIORITY.join(', ')}.` });

  if (errors.length) return sendError(res, 400, 'Validation failed. Please fix the errors below.', errors);
  next();
}

// ── Validate PUT/PATCH /tasks/:id ────────────────────────────
function validateUpdateTask(req, res, next) {
  const errors = [];
  const { title, description, status, priority } = req.body;

  if (title === undefined && description === undefined && status === undefined && priority === undefined)
    return sendError(res, 400, 'At least one field (title, description, status, priority) must be provided.');

  if (title !== undefined) {
    if (typeof title !== 'string' || !title.trim())
      errors.push({ field: 'title', message: 'Title must be a non-empty string.' });
    else if (title.trim().length > 100)
      errors.push({ field: 'title', message: 'Title must not exceed 100 characters.' });
  }

  if (status !== undefined && !VALID_STATUS.includes(status))
    errors.push({ field: 'status', message: `Status must be one of: ${VALID_STATUS.join(', ')}.` });

  if (priority !== undefined && !VALID_PRIORITY.includes(priority))
    errors.push({ field: 'priority', message: `Priority must be one of: ${VALID_PRIORITY.join(', ')}.` });

  if (errors.length) return sendError(res, 400, 'Validation failed. Please fix the errors below.', errors);
  next();
}

// ── Validate POST /users ─────────────────────────────────────
function validateCreateUser(req, res, next) {
  const errors = [];
  const { name, email } = req.body;

  if (!name || typeof name !== 'string' || !name.trim())
    errors.push({ field: 'name', message: 'Name is required.' });
  else if (name.trim().length < 2)
    errors.push({ field: 'name', message: 'Name must be at least 2 characters.' });
  else if (name.trim().length > 60)
    errors.push({ field: 'name', message: 'Name must not exceed 60 characters.' });

  if (!email || typeof email !== 'string' || !email.trim())
    errors.push({ field: 'email', message: 'Email is required.' });
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    errors.push({ field: 'email', message: 'Must be a valid email address.' });

  if (errors.length) return sendError(res, 400, 'Validation failed. Please fix the errors below.', errors);
  next();
}

module.exports = { validateCreateTask, validateUpdateTask, validateCreateUser };
