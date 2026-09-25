module.exports = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Erro interno no servidor";

  return res.status(status).json({
    status: "error",
    statusCode: status,
    message: message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
};