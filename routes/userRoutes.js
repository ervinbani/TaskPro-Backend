const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect } = require("../middleware/auth");

// @route   POST /api/user/register
// @desc    Register a new user
// @access  Public
router.post("/register", userController.register);

// @route   POST /api/user/login
// @desc    Login user
// @access  Public
router.post("/login", userController.login);

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get("/profile", protect, userController.getProfile);

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", protect, userController.updateProfile);

// @route   PUT /api/user/update-password
// @desc    Update user password
// @access  Private
router.put("/update-password", protect, userController.updatePassword);

module.exports = router;
