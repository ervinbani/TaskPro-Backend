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

// ============ TODO ROUTES ============

// @route   POST /api/tasks/:id/todos
// @desc    Add a todo to a task
// @access  Private
router.post("/:id/todos", taskController.addTodo);

// @route   PUT /api/tasks/:id/todos/:todoId
// @desc    Update a todo (toggle completed or edit text)
// @access  Private
router.put("/:id/todos/:todoId", taskController.updateTodo);

// @route   DELETE /api/tasks/:id/todos/:todoId
// @desc    Delete a todo from a task
// @access  Private
router.delete("/:id/todos/:todoId", taskController.deleteTodo);

// ============ COMMENT ROUTES ============

// @route   POST /api/tasks/:id/comments
// @desc    Add a comment to a task
// @access  Private
router.post("/:id/comments", taskController.addComment);

// @route   PUT /api/tasks/:id/comments/:commentId
// @desc    Update a comment (only your own or project owner)
// @access  Private
router.put("/:id/comments/:commentId", taskController.updateComment);

// @route   DELETE /api/tasks/:id/comments/:commentId
// @desc    Delete a comment (only your own or project owner)
// @access  Private
router.delete("/:id/comments/:commentId", taskController.deleteComment);

module.exports = router;
