export function errorHandler(error, _request, response, _next) {
  console.error(error);

  const statusCode = error.statusCode || 500;

  response.status(statusCode).json({
    message: statusCode === 500 ? 'Internal server error' : error.message
  });
}
