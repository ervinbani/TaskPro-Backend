const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const { protect } = require("../middleware/auth");

// Applica il middleware protect a TUTTE le routes
// Tutte le routes sotto richiedono autenticazione
router.use(protect);

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post("/", projectController.createProject);

// @route   GET /api/projects
// @desc    Get all projects for logged-in user
// @access  Private
router.get("/", projectController.getProjects);

// @route   GET /api/projects/:id
// @desc    Get single project by ID
// @access  Private
router.get("/:id", projectController.getProjectById);

// @route   PUT /api/projects/:id
// @desc    Update a project
// @access  Private (only owner)
router.put("/:id", projectController.updateProject);

// @route   DELETE /api/projects/:id
// @desc    Delete a project
// @access  Private (only owner)
router.delete("/:id", projectController.deleteProject);

// @route   POST /api/projects/:id/collaborators
// @desc    Add a collaborator to a project
// @access  Private (only owner)
router.post("/:id/collaborators", projectController.addCollaborator);

// @route   DELETE /api/projects/:id/collaborators/:userId
// @desc    Remove a collaborator from a project
// @access  Private (only owner)
router.delete("/:id/collaborators/:userId", projectController.removeCollaborator);

module.exports = router;
