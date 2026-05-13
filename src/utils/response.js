// ============================================================
// response.js — Consistent JSON Response Helpers
// ============================================================

function sendSuccess(res, statusCode = 200, message, data = null, meta = null) {
  const body = { success: true, status: statusCode, message };
  if (data !== null) body.data = data;
  if (meta !== null) body.meta = meta;
  body.timestamp = new Date().toISOString();
  return res.status(statusCode).json(body);
}

function sendError(res, statusCode = 500, message, errors = null) {
  const body = { success: false, status: statusCode, message };
  if (errors) body.errors = errors;
  body.timestamp = new Date().toISOString();
  return res.status(statusCode).json(body);
}

module.exports = { sendSuccess, sendError };
