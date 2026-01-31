const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware per proteggere le routes
const protect = async (req, res, next) => {
  let token;

  // Controlla se c'è un token nell'header Authorization
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Estrai il token dall'header "Bearer TOKEN"
      token = req.headers.authorization.split(" ")[1];

      // Verifica il token e decodifica il payload
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Trova l'utente dal database usando l'id nel token
      // .select('-password') esclude la password dal risultato
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Continua alla prossima funzione (controller)
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };
