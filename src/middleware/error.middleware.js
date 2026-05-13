// ============================================================
// error.middleware.js — Centralized Error Handling
// Handles: 404, Mongoose ValidationError, Duplicate Key (11000),
//          CastError (invalid ObjectId), and generic 500
// ============================================================

const { sendError } = require('../utils/response');

// 404 — route not found
function notFound(req, res, next) {
  sendError(res, 404, `Cannot ${req.method} ${req.originalUrl} — Route not found.`);
}

// Global error handler
function errorHandler(err, req, res, next) {
  console.error(`[Error] ${err.message}`);

  // Mongoose: schema validation failed (required, enum, maxlength, etc.)
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field  : e.path,
      message: e.message,
    }));
    return sendError(res, 400, 'Database validation failed.', errors);
  }

  // MongoDB: UNIQUE constraint violated (e.g. duplicate email)
  // PDF: "UNIQUE — Enforces that all values are entirely distinct"
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return sendError(res, 409, `A record with this ${field} already exists. Please use a different value.`);
  }

  // Mongoose: invalid ObjectId format (e.g. /tasks/abc instead of /tasks/507f...)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return sendError(res, 400, `Invalid ID format: "${err.value}". Must be a valid MongoDB ObjectId (24-character hex string).`);
  }

  // Generic server error
  const statusCode = err.statusCode || err.status || 500;
  const message    = statusCode === 500 ? 'Internal server error. Please try again later.' : err.message;
  sendError(res, statusCode, message);
}

module.exports = { notFound, errorHandler };
