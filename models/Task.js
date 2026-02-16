const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: {
        values: ["To Do", "In Progress", "Done"],
        message: "{VALUE} is not a valid status",
      },
      default: "To Do",
    },
    priority: {
      type: String,
      enum: {
        values: ["Low", "Medium", "High"],
        message: "{VALUE} is not a valid priority",
      },
      default: "Medium",
    },
    dueDate: {
      type: Date,
      required: false,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project", // Reference to the project it belongs to
      required: true,
    },
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Users assigned to this task
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    comments: [
      {
        description: {
          type: String,
          required: true,
          trim: true,
        },
        owner: {
          username: {
            type: String,
            required: true,
          },
          email: {
            type: String,
            required: true,
          },
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    todos: [
      {
        text: {
          type: String,
          required: [true, "Todo text is required"],
          trim: true,
          maxlength: [200, "Todo text cannot exceed 200 characters"],
        },
        completed: {
          type: Boolean,
          default: false,
        },
        completedAt: {
          type: Date,
          default: null,
        },
        completedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
        assignedTo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // User assigned to this specific todo
          default: null,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  },
);

// Virtual for calculating todo progress percentage
taskSchema.virtual("todoProgress").get(function () {
  if (!this.todos || this.todos.length === 0) return 0;
  const completedCount = this.todos.filter((todo) => todo.completed).length;
  return Math.round((completedCount / this.todos.length) * 100);
});

// Ensure virtuals are included in JSON output
taskSchema.set("toJSON", { virtuals: true });
taskSchema.set("toObject", { virtuals: true });

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
