const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

// Applica il middleware protect a TUTTE le routes
// Tutte le routes sotto richiedono autenticazione
router.use(protect);

// @route   POST /api/projects/:projectId/tasks
// @desc    Create a new task in a project
// @access  Private
router.post('/projects/:projectId/tasks', createTask);

// @route   GET /api/projects/:projectId/tasks
// @desc    Get all tasks for a specific project
// @access  Private
router.get('/projects/:projectId/tasks', getTasks);

// @route   GET /api/tasks/:id
// @desc    Get single task by ID
// @access  Private
router.get('/:id', getTaskById);

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', updateTask);

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', deleteTask);

module.exports = router;
