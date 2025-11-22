import { validateAuthorization } from "../services/validationService.js";
import express from "express";
import { auth } from "../auth.js";
import { fromNodeHeaders } from "better-auth/node";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserInvites,
} from "../services/handlers/userHandler.js";
import { handleError } from "../services/errorHandler.js";

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

router.get("/invites", validateAuthorization, async (req, res) => {
  try {
    const invites = await getUserInvites(req.user);
    res.json({ data: invites });
  } catch (error) {
    console.log(error);
    handleError(error);
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get("/getAll", validateAuthorization, async (req, res) => {
  try {
    const users = await getAllUsers(req.user);
    res.status(200).json({ data: users });
  } catch (error) {
    handleError(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/achievements", validateAuthorization, async (_, res) => {
  try {
    res.json({
      data: [
        { name: "Complete 50 tasks", code: "50-TASK", avatar: "Jude" },
        { name: "Complete 100 tasks", code: "100-TASK", avatar: "Chase" },
      ],
    });
  } catch (error) {
    console.log(error);
    handleError(error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/update/:userId", validateAuthorization, async (req, res) => {
  try {
    const userToUpdateId = req.params.userId;
    const { userToUpdateData } = req.body;

    const updatedUser = await updateUser(
      req.user,
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

router.delete("/:userId", validateAuthorization, async (req, res) => {
  try {
    const userToDeleteId = req.params.userId;
    const deletedUser = await deleteUser(req.user, userToDeleteId);
    res.json({ data: deletedUser });
  } catch (error) {
    handleError(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/:userId", validateAuthorization, async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await getUserById(req.user, userId);
    res.json({ data: user });
  } catch (error) {
    console.log(error);
    handleError(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
