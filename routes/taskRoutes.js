const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { protect } = require("../middleware/auth");

// Apply the protect middleware to ALL routes
// All routes below require authentication
router.use(protect);

// @route   POST /api/projects/:projectId/tasks
// @desc    Create a new task in a project
// @access  Private
router.post("/projects/:projectId/tasks", taskController.createTask);

// @route   GET /api/projects/:projectId/tasks
// @desc    Get all tasks for a specific project
// @access  Private
router.get("/projects/:projectId/tasks", taskController.getTasks);

// @route   GET /api/tasks/:id
// @desc    Get single task by ID
// @access  Private
router.get("/:id", taskController.getTaskById);

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put("/:id", taskController.updateTask);

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete("/:id", taskController.deleteTask);

module.exports = router;
