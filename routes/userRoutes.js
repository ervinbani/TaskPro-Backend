const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// @route   POST /api/user/register
// @desc    Register a new user
// @access  Public
router.post("/register", userController.register);

// @route   POST /api/user/login
// @desc    Login user
// @access  Public
router.post("/login", userController.login);

module.exports = router;
