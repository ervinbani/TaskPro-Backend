// Middleware to handle Mongoose validation errors
const errorHandler = (err, req, res, next) => {
  // Default status code is 500 (Internal Server Error)
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Mongoose error: resource not found (CastError)
  // E.g.: Invalid ID in the database
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    message = "Resource not found";
  }

  // Mongoose error: duplicate field (e.g. email already exists)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // Mongoose error: validation failed
  if (err.name === "ValidationError") {
    statusCode = 400;
    // Extract all validation error messages
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // Send JSON response with the error
  res.status(statusCode).json({
    message,
    // Show stack trace only in development
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = { errorHandler };
