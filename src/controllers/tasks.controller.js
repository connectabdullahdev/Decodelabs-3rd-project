// ============================================================
// tasks.controller.js — Task CRUD Operations via MongoDB
// PDF: CREATE = POST = INSERT
//      READ   = GET  = SELECT
//      UPDATE = PUT  = UPDATE
//      DELETE = DELETE = DELETE
// All queries are parameterized (Mongoose does this automatically)
// PDF: "Parameterized Queries — Input treated as data, never executable logic"
// ============================================================

const Task = require('../models/Task.model');
const { sendSuccess, sendError } = require('../utils/response');

// ── READ ALL — GET /api/v1/tasks ─────────────────────────────
exports.getAllTasks = async (req, res, next) => {
  try {
    const {
      status,
      priority,
      sort  = '-createdAt',
      page  = 1,
      limit = 10,
    } = req.query;

    // Build filter — safe parameterized object, never raw string
    const filter = {};
    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;

    const pageNum  = Math.max(1, parseInt(page)  || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip     = (pageNum - 1) * limitNum;
    const total    = await Task.countDocuments(filter);

    const tasks = await Task
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('userId', 'name email');  // JOIN — brings in user info via Foreign Key

    return sendSuccess(res, 200, `${tasks.length} task(s) retrieved successfully.`, tasks, {
      total,
      page : pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
      filtered: !!(status || priority),
    });

  } catch (err) { next(err); }
};

// ── STATS — GET /api/v1/tasks/stats ─────────────────────────
// Must be defined BEFORE /:id route to avoid conflict
exports.getStats = async (req, res, next) => {
  try {
    const raw = await Task.getStats();
    return sendSuccess(res, 200, 'Task statistics retrieved successfully.', {
      total     : raw.total,
      byStatus  : { pending: raw.pending, inProgress: raw.inProgress, completed: raw.completed },
      byPriority: { low: raw.low, medium: raw.medium, high: raw.high },
    });
  } catch (err) { next(err); }
};

// ── READ ONE — GET /api/v1/tasks/:id ────────────────────────
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task
      .findById(req.params.id)
      .populate('userId', 'name email');

    if (!task) return sendError(res, 404, `Task with id "${req.params.id}" was not found.`);
    return sendSuccess(res, 200, 'Task retrieved successfully.', task);
  } catch (err) { next(err); }
};

// ── CREATE — POST /api/v1/tasks ──────────────────────────────
// PDF: CREATE = HTTP POST = SQL INSERT
// Mongoose validates against schema BEFORE saving to MongoDB
exports.createTask = async (req, res, next) => {
  try {
    const task = await Task.create({
      title      : req.body.title,
      description: req.body.description || '',
      status     : req.body.status     || 'pending',
      priority   : req.body.priority   || 'medium',
      userId     : req.body.userId     || null,
    });

    return sendSuccess(res, 201, 'Task created successfully.', task);
  } catch (err) { next(err); }
};

// ── UPDATE — PUT /api/v1/tasks/:id ──────────────────────────
// PDF: UPDATE = HTTP PUT = SQL UPDATE
// runValidators: true — re-runs schema constraints on update
exports.updateTask = async (req, res, next) => {
  try {
    // Only allow these fields to be updated (prevent unwanted field injection)
    const allowed = ['title', 'description', 'status', 'priority', 'userId'];
    const updates = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }  // new: return updated doc; runValidators: enforce schema
    ).populate('userId', 'name email');

    if (!task) return sendError(res, 404, `Task with id "${req.params.id}" was not found.`);
    return sendSuccess(res, 200, 'Task updated successfully.', task);
  } catch (err) { next(err); }
};

// ── DELETE — DELETE /api/v1/tasks/:id ───────────────────────
// PDF: DELETE = HTTP DELETE = SQL DELETE
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return sendError(res, 404, `Task with id "${req.params.id}" was not found.`);
    return res.status(204).send(); // 204 No Content — deletion confirmed, no body
  } catch (err) { next(err); }
};
