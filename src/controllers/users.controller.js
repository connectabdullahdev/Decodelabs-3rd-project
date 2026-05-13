// ============================================================
// users.controller.js — User CRUD Operations via MongoDB
// PDF: UNIQUE constraint on email (MongoDB enforces at DB level)
//      1:Many relationship — One User → Many Tasks
// ============================================================

const User = require('../models/User.model');
const Task = require('../models/Task.model');
const { sendSuccess, sendError } = require('../utils/response');

// ── READ ALL — GET /api/v1/users ─────────────────────────────
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort('-createdAt');
    return sendSuccess(res, 200, `${users.length} user(s) retrieved.`, users, { total: users.length });
  } catch (err) { next(err); }
};

// ── READ ONE — GET /api/v1/users/:id ─────────────────────────
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, `User with id "${req.params.id}" not found.`);
    return sendSuccess(res, 200, 'User retrieved successfully.', user);
  } catch (err) { next(err); }
};

// ── READ RELATIONSHIP — GET /api/v1/users/:id/tasks ──────────
// PDF: "One-to-Many — a single Customer connects to multiple Orders"
// Here: One User → Many Tasks via Foreign Key (Task.userId = User._id)
exports.getUserTasks = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, `User with id "${req.params.id}" not found.`);

    // Foreign Key lookup — find all tasks WHERE userId = this user's _id
    const tasks = await Task.find({ userId: req.params.id }).sort('-createdAt');

    return sendSuccess(
      res, 200,
      `${tasks.length} task(s) found for user "${user.name}".`,
      { user, tasks },
      { total: tasks.length }
    );
  } catch (err) { next(err); }
};

// ── CREATE — POST /api/v1/users ──────────────────────────────
// UNIQUE constraint on email is enforced by MongoDB (error code 11000)
// → handled by errorHandler middleware → returns 409 Conflict
exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create({
      name : req.body.name,
      email: req.body.email,
    });
    return sendSuccess(res, 201, 'User registered successfully.', user);
  } catch (err) { next(err); }
};

// ── UPDATE — PUT /api/v1/users/:id ───────────────────────────
exports.updateUser = async (req, res, next) => {
  try {
    const allowed = ['name', 'role'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    if (!Object.keys(updates).length)
      return sendError(res, 400, 'At least one field (name, role) must be provided.');

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) return sendError(res, 404, `User with id "${req.params.id}" not found.`);
    return sendSuccess(res, 200, 'User updated successfully.', user);
  } catch (err) { next(err); }
};

// ── DELETE — DELETE /api/v1/users/:id ────────────────────────
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return sendError(res, 404, `User with id "${req.params.id}" not found.`);
    // Also remove all tasks belonging to this user (referential integrity)
    await Task.deleteMany({ userId: req.params.id });
    return res.status(204).send();
  } catch (err) { next(err); }
};
