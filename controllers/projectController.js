const Project = require("../models/Project");
const User = require("../models/User");
const {
  createNotification,
  createNotifications,
  getProjectMembers,
} = require("../utils/notificationService");

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const { name, description, tags } = req.body;

    // Validation: check that required fields are present
    if (!name || !description) {
      return res
        .status(400)
        .json({ message: "Please provide name and description" });
    }

    // Create the project with the logged-in user as owner
    // req.user comes from the 'protect' middleware
    const project = await Project.create({
      name,
      description,
      owner: req.user._id, // The logged-in user becomes the owner
      tags: tags || [],
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all projects for logged-in user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    // Find all projects where the user is owner OR collaborator
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { collaborators: req.user._id }],
    })
      .populate("owner", "username email") // Populate owner data
      .populate("collaborators", "username email") // Populate collaborators data
      .sort({ createdAt: -1 }); // Sort by creation date (most recent first)

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "username email")
      .populate("collaborators", "username email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Authorization: check that the user is owner or collaborator
    const isOwner = project.owner._id.toString() === req.user._id.toString();
    const isCollaborator = project.collaborators.some(
      (collab) => collab._id.toString() === req.user._id.toString(),
    );

    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this project" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Authorization: ONLY the owner can update the project
    if (project.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this project" });
    }

    // Update fields
    const { name, description, collaborators, tags } = req.body;

    if (name) project.name = name;
    if (description) project.description = description;
    if (collaborators) project.collaborators = collaborators;
    if (tags !== undefined) project.tags = tags;

    const updatedProject = await project.save();

    // Notify all collaborators about the update
    const members = getProjectMembers(project, req.user._id);
    if (members.length > 0) {
      await createNotifications(members, {
        sender: req.user._id,
        type: "PROJECT_UPDATED",
        message: `${req.user.username} has updated the project '${project.name}'`,
        project: project._id,
      });
    }

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Authorization: ONLY the owner can delete the project
    if (project.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this project" });
    }

    // Notify all collaborators about the deletion
    if (project.collaborators.length > 0) {
      await createNotifications(project.collaborators, {
        sender: req.user._id,
        type: "PROJECT_DELETED",
        message: `The project '${project.name}' has been deleted`,
        project: project._id,
      });
    }

    await project.deleteOne();

    res.json({ message: "Project removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a collaborator to a project by email or username
// @route   POST /api/projects/:id/collaborators
// @access  Private (only owner)
const addCollaborator = async (req, res) => {
  try {
    const { email, username } = req.body;

    if (!email && !username) {
      return res
        .status(400)
        .json({ message: "Please provide email or username" });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Authorization: ONLY the owner can add collaborators
    if (project.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to add collaborators" });
    }

    // Find user by email or username
    const user = await User.findOne(email ? { email } : { username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already a collaborator
    if (project.collaborators.includes(user._id)) {
      return res
        .status(400)
        .json({ message: "User is already a collaborator" });
    }

    // Check if the user is the owner
    if (project.owner.toString() === user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Owner cannot be added as collaborator" });
    }

    // Add the collaborator
    project.collaborators.push(user._id);
    await project.save();

    // Create notification for the added collaborator
    await createNotification({
      recipient: user._id,
      sender: req.user._id,
      type: "PROJECT_INVITE",
      message: `${req.user.username} has added you to the project '${project.name}'`,
      project: project._id,
    });

    // Populate collaborators before returning
    await project.populate("collaborators", "username email");

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove a collaborator from a project
// @route   DELETE /api/projects/:id/collaborators/:userId
// @access  Private (only owner)
const removeCollaborator = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Authorization: ONLY the owner can remove collaborators
    if (project.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to remove collaborators" });
    }

    // Create notification before removing
    await createNotification({
      recipient: req.params.userId,
      sender: req.user._id,
      type: "PROJECT_REMOVED",
      message: `You have been removed from the project '${project.name}'`,
      project: project._id,
    });

    // Remove the collaborator
    project.collaborators = project.collaborators.filter(
      (collab) => collab.toString() !== req.params.userId,
    );

    await project.save();

    // Populate collaborators before returning
    await project.populate("collaborators", "username email");

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addCollaborator,
  removeCollaborator,
};
