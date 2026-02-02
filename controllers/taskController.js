const Task = require("../models/Task");
const Project = require("../models/Project");

// Helper function per verificare accesso al progetto
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
    const { title, description, status, tags } = req.body;
    const projectId = req.params.projectId;

    // Validazione: controlla che il titolo sia presente
    if (!title) {
      return res.status(400).json({ message: "Please provide a task title" });
    }

    // Verifica accesso al progetto
    const access = await checkProjectAccess(projectId, req.user._id);
    if (!access.authorized) {
      return res
        .status(access.error === "Project not found" ? 404 : 403)
        .json({ message: access.error });
    }

    // Crea il task
    const task = await Task.create({
      title,
      description,
      status: status || "To Do",
      project: projectId,
      tags: tags || [],
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

    // Verifica accesso al progetto
    const access = await checkProjectAccess(projectId, req.user._id);
    if (!access.authorized) {
      return res
        .status(access.error === "Project not found" ? 404 : 403)
        .json({ message: access.error });
    }

    // Trova tutti i task del progetto
    const tasks = await Task.find({ project: projectId }).sort({
      createdAt: -1,
    }); // Ordina per data creazione

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

    // Verifica accesso al progetto del task
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

    // Verifica accesso al progetto del task
    const access = await checkProjectAccess(task.project._id, req.user._id);
    if (!access.authorized) {
      return res.status(403).json({ message: access.error });
    }

    // Aggiorna i campi
    const { title, description, status, tags } = req.body;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) {
      // Valida che lo status sia uno dei valori ammessi
      const validStatuses = ["To Do", "In Progress", "Done"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: `Status must be one of: ${validStatuses.join(", ")}`,
        });
      }
      task.status = status;
    }
    if (tags !== undefined) task.tags = tags;

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

    // Verifica accesso al progetto del task
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
