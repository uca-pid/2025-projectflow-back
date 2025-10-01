import { validationResult } from "express-validator";
import { throwError } from "./errorHandler.js";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth.js";

export const validateAuthorization = async (req, res, next) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session || !session.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  req.user = session.user;
  next();
};

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throwError(400);
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
