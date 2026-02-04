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
      ref: "Project", // Riferimento al progetto a cui appartiene
      required: true,
    },
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
  },
  {
    timestamps: true, // Aggiunge createdAt e updatedAt
  },
);

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
