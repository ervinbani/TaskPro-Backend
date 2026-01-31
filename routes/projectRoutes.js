const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

// Applica il middleware protect a TUTTE le routes
// Tutte le routes sotto richiedono autenticazione
router.use(protect);

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post('/', createProject);

// @route   GET /api/projects
// @desc    Get all projects for logged-in user
// @access  Private
router.get('/', getProjects);

// @route   GET /api/projects/:id
// @desc    Get single project by ID
// @access  Private
router.get('/:id', getProjectById);

// @route   PUT /api/projects/:id
// @desc    Update a project
// @access  Private (only owner)
router.put('/:id', updateProject);

// @route   DELETE /api/projects/:id
// @desc    Delete a project
// @access  Private (only owner)
router.delete('/:id', deleteProject);

module.exports = router;
