const { throwError } = require("../managers/errorHandler");
const jwt = require("jsonwebtoken");

const generateToken = () => {
  return "Token";
};

const validateAuthorization = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      throwError(400);
    }

    // TODO: Implement token validation
    console.log("Token validated");

    next();
  } catch (err) {
    handleError(err);
    res.status(err.statusCode).json({ message: err.message });
  }
};

module.exports = {
  generateToken,
  validateAuthorization,
};
