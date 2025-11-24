import { validateAuthorization } from "../services/validationService.js";
import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserInvites,
  checkAndUnlockAchievements,
} from "../services/handlers/userHandler.js";
import {
  getUserAchievements,
  getAllAchievements,
} from "../services/repositories/userRepository.js";
import { handleError } from "../services/errorHandler.js";

const router = express.Router();
router.use(express.json());

router.get("/invites", validateAuthorization, async (req, res) => {
  try {
    const invites = await getUserInvites(req.user);
    res.json({ data: invites, success: true });
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
    res.status(200).json({ data: users, success: true });
  } catch (error) {
    handleError(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/achievements", validateAuthorization, async (req, res) => {
  try {
    const userId = req.user.id;
    await checkAndUnlockAchievements(userId);
    const achievements = await getUserAchievements(userId);
    res.json({ data: achievements, success: true });
  } catch (error) {
    console.log(error);
    handleError(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/allAchievements", validateAuthorization, async (req, res) => {
  try {
    const achievements = await getAllAchievements();
    res.json({ data: achievements, success: true });
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

    res.json({ data: updatedUser, success: true });
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
    res.json({ data: deletedUser, success: true });
  } catch (error) {
    handleError(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/:userId", validateAuthorization, async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await getUserById(req.user, userId);
    res.json({ data: user, success: true });
  } catch (error) {
    console.log(error);
    handleError(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
