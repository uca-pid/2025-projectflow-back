import express from "express";
import { auth } from "../auth.js";
import { fromNodeHeaders } from "better-auth/node";
import { getAllUsers } from "../services/requestHandler.js";
import { handleError } from "../services/errorHandler.js";

// Middleware Function to protect routes, later move it elsewhere
const loadUser = async (req, res, next) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.userSession = session;
  next();
};

const router = express.Router();
router.use(express.json());

// Get user data [Deprecated, Better Auth does this for us]
router.get("/", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json({ user: session.user });
});

// Get all users
router.get("/getAll", loadUser, async (req, res) => {
  try {
    const users = await getAllUsers(req.userSession.user);
    res.json({ data: users });
  } catch (error) {
    handleError(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
