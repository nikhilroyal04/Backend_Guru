class ResponseManager {
    static sendSuccess(res, data = [], statusCode = 200, message = "Success", errorCode = "NO", errorMessage = "") {
      const response = {
        statusCode,
        message,
        data,
        errorCode,
        errorMessage
      };
      res.status(statusCode).json(response);
    }
  
    static sendError(res, statusCode = 500, errorCode = "INTERNAL_ERROR", errorMessage = "Internal Server Error") {
      const response = {
        statusCode,
        errorCode,
        errorMessage
      };
      res.status(statusCode).json(response);
    }
  
    static handleNotFoundError(res, message = "Not Found") {
      const response = {
        statusCode: 404,
        errorCode: "NOT_FOUND",
        errorMessage: message
      };
      res.status(404).json(response);
    }
  
    static handleBadRequestError(res, message = "Bad Request") {
      const response = {
        statusCode: 400,
        errorCode: "BAD_REQUEST",
        errorMessage: message
      };
      res.status(400).json(response);
    }
  
  
    static handleUnauthorizedError(res, message = "Unauthorized") {
      const response = {
        statusCode: 401,
        errorCode: "UNAUTHORIZED",
        errorMessage: message
      };
      res.status(401).json(response);
    }
  
    static handleForbiddenError(res, message = "Forbidden") {
      const response = {
        statusCode: 403,
        errorCode: "FORBIDDEN",
        errorMessage: message
      };
      res.status(403).json(response);
    }
  
    static handleValidationError(res, message = "Validation Error") {
      const response = {
        statusCode: 422,
        errorCode: "VALIDATION_ERROR",
        errorMessage: message
      };
      res.status(422).json(response);
    }
  }
  
  module.exports = ResponseManager;
  