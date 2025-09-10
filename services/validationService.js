const { throwError } = require("../managers/errorHandler");
const { header, validationResult } = require("express-validator");

const validateAuthorizationHeader = [header("authorization").exists()];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throwError(400);
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validateAuthorizationHeader,
  handleValidationErrors,
};
