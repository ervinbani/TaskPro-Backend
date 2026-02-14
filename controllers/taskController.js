const Task = require("../models/Task");
const Project = require("../models/Project");
const {
  createNotifications,
  getProjectMembers,
} = require("../utils/notificationService");

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

    // Notify all project members except the creator
    const members = getProjectMembers(access.project, req.user._id);
    if (members.length > 0) {
      await createNotifications(members, {
        sender: req.user._id,
        type: "TASK_CREATED",
        message: `${req.user.username} created a new task: '${task.title}'`,
        project: projectId,
        task: task._id,
      });
    }

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

    // Track if status changed for notification
    const oldStatus = task.status;
    let statusChanged = false;

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
      if (status !== oldStatus) {
        statusChanged = true;
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

    // Notify project members if status changed
    if (statusChanged) {
      const members = getProjectMembers(access.project, req.user._id);
      if (members.length > 0) {
        await createNotifications(members, {
          sender: req.user._id,
          type: "TASK_STATUS_CHANGED",
          message: `${req.user.username} moved '${task.title}' to ${status}`,
          project: task.project._id,
          task: task._id,
          metadata: { oldStatus, newStatus: status },
        });
      }
    }

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

    // Store task info before deletion for notification
    const taskTitle = task.title;
    const projectId = task.project._id;

    await task.deleteOne();

    // Notify project members about task deletion
    const members = getProjectMembers(access.project, req.user._id);
    if (members.length > 0) {
      await createNotifications(members, {
        sender: req.user._id,
        type: "TASK_DELETED",
        message: `${req.user.username} deleted the task: '${taskTitle}'`,
        project: projectId,
      });
    }

    res.json({ message: "Task removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a todo to a task
// @route   POST /api/tasks/:id/todos
// @access  Private
const addTodo = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Todo text is required" });
    }

    const task = await Task.findById(req.params.id).populate("project");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify access to the task's project
    const access = await checkProjectAccess(task.project._id, req.user._id);
    if (!access.authorized) {
      return res.status(403).json({ message: access.error });
    }

    // Check max todos limit (50)
    if (task.todos && task.todos.length >= 50) {
      return res
        .status(400)
        .json({ message: "Maximum 50 todos per task allowed" });
    }

    // Add the todo
    task.todos.push({
      text: text.trim(),
      completed: false,
      completedAt: null,
      completedBy: null,
      createdAt: new Date(),
    });

    await task.save();

    // Notify project members about new todo
    const members = getProjectMembers(access.project, req.user._id);
    if (members.length > 0) {
      await createNotifications(members, {
        sender: req.user._id,
        type: "TODO_ADDED",
        message: `${req.user.username} added a todo in task '${task.title}': '${text.trim()}'`,
        project: task.project._id,
        task: task._id,
      });
    }

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a todo (toggle completed or edit text)
// @route   PUT /api/tasks/:id/todos/:todoId
// @access  Private
const updateTodo = async (req, res) => {
  try {
    const { text, completed } = req.body;

    const task = await Task.findById(req.params.id).populate("project");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify access to the task's project
    const access = await checkProjectAccess(task.project._id, req.user._id);
    if (!access.authorized) {
      return res.status(403).json({ message: access.error });
    }

    // Find the todo
    const todo = task.todos.id(req.params.todoId);

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    // Track if completed status changed
    const wasCompleted = todo.completed;
    let notifyCompletion = false;

    // Update text if provided
    if (text !== undefined) {
      if (text.trim() === "") {
        return res.status(400).json({ message: "Todo text cannot be empty" });
      }
      todo.text = text.trim();
    }

    // Update completed status if provided
    if (completed !== undefined) {
      todo.completed = completed;

      if (completed && !wasCompleted) {
        // Mark as completed
        todo.completedAt = new Date();
        todo.completedBy = req.user._id;
        notifyCompletion = true;
      } else if (!completed && wasCompleted) {
        // Mark as not completed
        todo.completedAt = null;
        todo.completedBy = null;
      }
    }

    await task.save();

    // Notify if todo was completed
    if (notifyCompletion) {
      const members = getProjectMembers(access.project, req.user._id);
      if (members.length > 0) {
        await createNotifications(members, {
          sender: req.user._id,
          type: "TODO_COMPLETED",
          message: `${req.user.username} completed a todo in task '${task.title}'`,
          project: task.project._id,
          task: task._id,
        });
      }

      // Check if all todos are completed
      const allCompleted =
        task.todos.length > 0 && task.todos.every((t) => t.completed);
      if (allCompleted && members.length > 0) {
        await createNotifications(members, {
          sender: req.user._id,
          type: "ALL_TODOS_COMPLETED",
          message: `All todos completed in task '${task.title}'! 🎉`,
          project: task.project._id,
          task: task._id,
        });
      }
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a todo from a task
// @route   DELETE /api/tasks/:id/todos/:todoId
// @access  Private
const deleteTodo = async (req, res) => {
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

    // Find and remove the todo
    const todo = task.todos.id(req.params.todoId);

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    // Remove the todo (MongoDB subdocument method)
    todo.deleteOne();

    await task.save();

    res.json({ message: "Todo removed successfully", task });
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
  addTodo,
  updateTodo,
  deleteTodo,
};
