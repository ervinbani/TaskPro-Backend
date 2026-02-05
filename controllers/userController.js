const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token valid for 30 days
  });
};

// @desc    Register a new user
// @route   POST /api/user/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Validation: check that all fields are present
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    // Check if the user already exists (by email)
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    // The password is automatically hashed by the pre-save hook in the model
    const user = await User.create({
      username,
      email,
      password,
    });

    // If the user was created successfully
    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id), // Generate and send JWT token
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/user/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation: check that email and password are present
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and if password is correct
    // matchPassword is the method we created in the User model
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id), // Generate and send JWT token
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    // req.user was set by the auth middleware
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile (username, email)
// @route   PUT /api/user/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update only the provided fields
    if (req.body.username) {
      user.username = req.body.username;
    }
    if (req.body.email) {
      user.email = req.body.email;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
    });
  } catch (error) {
    // Handle duplicate errors (email or username already exists)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }
    next(error);
  }
};

// @desc    Update user password
// @route   PUT /api/user/update-password
// @access  Private
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validazione: controlla che entrambi i campi siano presenti
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Please provide current password and new password",
      });
    }

    // Validazione: nuova password deve essere almeno 6 caratteri
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long",
      });
    }

    // Trova l'utente (con la password)
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verifica che la password corrente sia corretta
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Aggiorna la password
    // Il pre-save hook hashererà automaticamente la nuova password
    user.password = newPassword;
    await user.save();

    res.json({
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account (with cascade)
// @route   DELETE /api/user/account
// @access  Private
const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Import required models
    const Project = require("../models/Project");
    const Task = require("../models/Task");

    // 1. Find all projects where the user is owner
    const ownedProjects = await Project.find({ owner: userId });
    const ownedProjectIds = ownedProjects.map((project) => project._id);

    // 2. Delete all tasks associated with these projects
    if (ownedProjectIds.length > 0) {
      await Task.deleteMany({ project: { $in: ownedProjectIds } });
    }

    // 3. Delete all projects owned by the user
    await Project.deleteMany({ owner: userId });

    // 4. Remove the user as collaborator from all other projects
    await Project.updateMany(
      { collaborators: userId },
      { $pull: { collaborators: userId } },
    );

    // 5. Delete the user account
    await User.findByIdAndDelete(userId);

    res.json({
      message:
        "Account deleted successfully. All your projects and tasks have been removed.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  updatePassword,
  deleteAccount,
};
