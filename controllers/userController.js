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

module.exports = {
  register,
  login,
};
