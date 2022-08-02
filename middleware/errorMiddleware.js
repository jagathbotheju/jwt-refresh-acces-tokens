const ErrorResponse = require("../utils/ErrorResponse");

exports.errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  res.status(error.statusCode || 500).json({
    error: error.message || "Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
