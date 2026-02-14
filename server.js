// Import dependencies
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/errorHandler");

// Import routes
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Enable CORS
// Allow requests from a specific origin
const corsOptions = {
  origin:
    process.env.CLIENT_URL || "https://taskpro-frontend-6016.onrender.com",
};

app.use(cors(corsOptions));

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
connectDB();

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to TaskPro API" });
});

// Mount routes
app.use("/api/user", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);

// Error handler middleware (deve essere DOPO le routes)
app.use(errorHandler);

// Define PORT
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
