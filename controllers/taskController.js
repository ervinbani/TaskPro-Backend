const Task = require("../models/Task");
const Project = require("../models/Project");

// Helper function to verify project access
const checkProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);

  if (!project) {
    return { authorized: false, error: "Project not found" };
  }

  const isOwner = project.owner.toString() === userId.toString();
  const isCollaborator = project.collaborators.some(
    (collab) => collab.toString() === userId.toString(),
  );

  if (!isOwner && !isCollaborator) {
    return {
      authorized: false,
      error: "Not authorized to access this project",
    };
  }

  return { authorized: true, project };
};

// @desc    Create a new task in a project
// @route   POST /api/projects/:projectId/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, tags, comments } =
      req.body;
    const projectId = req.params.projectId;

    // Validation: check that the title is present
    if (!title) {
      return res.status(400).json({ message: "Please provide a task title" });
    }

    // Verify project access
    const access = await checkProjectAccess(projectId, req.user._id);
    if (!access.authorized) {
      return res
        .status(access.error === "Project not found" ? 404 : 403)
        .json({ message: access.error });
    }

    // Create the task
    const task = await Task.create({
      title,
      description,
      status: status || "To Do",
      priority: priority || "Medium",
      dueDate,
      project: projectId,
      tags: tags || [],
      comments: comments || [],
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tasks for a specific project
// @route   GET /api/projects/:projectId/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // Verify project access
    const access = await checkProjectAccess(projectId, req.user._id);
    if (!access.authorized) {
      return res
        .status(access.error === "Project not found" ? 404 : 403)
        .json({ message: access.error });
    }

    // Find all tasks of the project
    const tasks = await Task.find({ project: projectId }).sort({
      createdAt: -1,
    }); // Sort by creation date

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("project");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify access to the task's project
    const access = await checkProjectAccess(task.project._id, req.user._id);
    if (!access.authorized) {
      return res.status(403).json({ message: access.error });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("project");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify access to the task's project
    const access = await checkProjectAccess(task.project._id, req.user._id);
    if (!access.authorized) {
      return res.status(403).json({ message: access.error });
    }

    // Update fields
    const { title, description, status, priority, dueDate, tags, comments } =
      req.body;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) {
      // Validate that the status is one of the allowed values
      const validStatuses = ["To Do", "In Progress", "Done"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: `Status must be one of: ${validStatuses.join(", ")}`,
        });
      }
      task.status = status;
    }
    if (priority) {
      // Validate that the priority is one of the allowed values
      const validPriorities = ["Low", "Medium", "High"];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({
          message: `Priority must be one of: ${validPriorities.join(", ")}`,
        });
      }
      task.priority = priority;
    }
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (tags !== undefined) task.tags = tags;
    if (comments !== undefined) task.comments = comments;

    const updatedTask = await task.save();

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("project");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify access to the task's project
    const access = await checkProjectAccess(task.project._id, req.user._id);
    if (!access.authorized) {
      return res.status(403).json({ message: access.error });
    }

    await task.deleteOne();

    res.json({ message: "Task removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
