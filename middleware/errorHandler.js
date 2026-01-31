// Middleware per gestire errori di validazione Mongoose
const errorHandler = (err, req, res, next) => {
  // Status code di default è 500 (Internal Server Error)
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Errore Mongoose: risorsa non trovata (CastError)
  // Es: ID non valido nel database
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    message = "Resource not found";
  }

  // Errore Mongoose: campo duplicato (es. email già esistente)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // Errore Mongoose: validazione fallita
  if (err.name === "ValidationError") {
    statusCode = 400;
    // Estrae tutti i messaggi di errore di validazione
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // Invia risposta JSON con l'errore
  res.status(statusCode).json({
    message,
    // Mostra lo stack trace solo in development
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = { errorHandler };
