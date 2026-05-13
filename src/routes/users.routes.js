// ============================================================
// users.routes.js — User Resource Routes
// ============================================================

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/users.controller');
const { validateCreateUser } = require('../middleware/validate.middleware');

router.route('/')
  .get(ctrl.getAllUsers)
  .post(validateCreateUser, ctrl.createUser);

// /:id/tasks MUST come before /:id — more specific route first
router.get('/:id/tasks', ctrl.getUserTasks);

router.route('/:id')
  .get(ctrl.getUserById)
  .put(ctrl.updateUser)
  .delete(ctrl.deleteUser);

module.exports = router;
