import express from "express";
import { auth } from "../auth.js";
import { fromNodeHeaders } from "better-auth/node";
import {
  getAllUsers,
  updateUser,
  deleteUser,
} from "../services/requestHandler.js";
import { handleError } from "../services/errorHandler.js";

// Middleware Function to protect routes, later move it elsewhere
const authUser = async (req, res, next) => {
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
router.get("/getAll", authUser, async (req, res) => {
  try {
    const users = await getAllUsers(req.userSession.user);
    res.status(200).json({ data: users });
  } catch (error) {
    handleError(error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/update/:userId", authUser, async (req, res) => {
  try {
    const userToUpdateId = req.params.userId;
    const { userToUpdateData } = req.body;

    const updatedUser = await updateUser(
      req.userSession.user,
      userToUpdateId,
      userToUpdateData,
    );

    res.json({ data: updatedUser });
  } catch (error) {
    console.log(error);
    handleError(error);
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:userId", authUser, async (req, res) => {
  try {
    const userToDeleteId = req.params.userId;
    const deletedUser = await deleteUser(req.userSession.user, userToDeleteId);
    res.json({ data: deletedUser });
  } catch (error) {
    handleError(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
