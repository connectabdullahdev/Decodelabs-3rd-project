// ============================================================
// tasks.routes.js — Task Resource Routes
// PDF: "Resources are Nouns. Methods are Verbs."
// ============================================================

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/tasks.controller');
const { validateCreateTask, validateUpdateTask } = require('../middleware/validate.middleware');

// /stats MUST come before /:id — otherwise Express matches "stats" as an :id
router.get('/stats', ctrl.getStats);

router.route('/')
  .get(ctrl.getAllTasks)
  .post(validateCreateTask, ctrl.createTask);

router.route('/:id')
  .get(ctrl.getTaskById)
  .put(validateUpdateTask, ctrl.updateTask)
  .delete(ctrl.deleteTask);

module.exports = router;
