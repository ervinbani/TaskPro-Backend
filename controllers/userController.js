const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Funzione helper per generare JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token valido per 30 giorni
  });
};

// @desc    Register a new user
// @route   POST /api/user/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Validazione: controlla che tutti i campi siano presenti
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    // Controlla se l'utente esiste già (per email)
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Crea nuovo utente
    // La password viene automaticamente hashata dal pre-save hook nel modello
    const user = await User.create({
      username,
      email,
      password,
    });

    // Se l'utente è stato creato con successo
    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id), // Genera e invia il JWT token
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

    // Validazione: controlla che email e password siano presenti
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Trova l'utente per email
    const user = await User.findOne({ email });

    // Controlla se l'utente esiste e se la password è corretta
    // matchPassword è il metodo che abbiamo creato nel modello User
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id), // Genera e invia il JWT token
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
    // req.user è stato impostato dal middleware auth
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

    // Aggiorna solo i campi forniti
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
    // Gestisce errori di duplicazione (email o username già esistenti)
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

    // Trova l'utente
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Importa i modelli necessari
    const Project = require("../models/Project");
    const Task = require("../models/Task");

    // 1. Trova tutti i progetti dove l'utente è owner
    const ownedProjects = await Project.find({ owner: userId });
    const ownedProjectIds = ownedProjects.map((project) => project._id);

    // 2. Elimina tutti i task associati a questi progetti
    if (ownedProjectIds.length > 0) {
      await Task.deleteMany({ project: { $in: ownedProjectIds } });
    }

    // 3. Elimina tutti i progetti di cui è owner
    await Project.deleteMany({ owner: userId });

    // 4. Rimuovi l'utente come collaboratore da tutti i progetti di altri
    await Project.updateMany(
      { collaborators: userId },
      { $pull: { collaborators: userId } },
    );

    // 5. Elimina l'account utente
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
