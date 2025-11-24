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
import { prisma } from "../services/databaseService.js";


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

const ACHIEVEMENT_DEFINITIONS = [
  { code: "1-TASK", name: "Jude", avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Jude", requiredTasks: 1 },
  { code: "5-TASK", name: "Chase", avatar: "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Chase", requiredTasks: 5 },
  { code: "10-TASK", name: "Kimberly", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Kimberly", requiredTasks: 10 },
  { code: "25-TASK", name: "Mason", avatar: "https://api.dicebear.com/9.x/bottts/svg?seed=Mason", requiredTasks: 25 },
  { code: "50-TASK", name: "Jameson", avatar: "https://api.dicebear.com/9.x/bottts/svg?seed=Jameson", requiredTasks: 50 },
  { code: "100-TASK", name: "Maria", avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Maria", requiredTasks: 100 },
];

router.get("/achievements", validateAuthorization, async (req, res) => {
  try {
    const userId = req.user.id;

    const completedTasksCount = await prisma.task.count({
      where: {
        completedById: userId,
        status: "DONE",
      },
    });

    const achievementsToUnlock = ACHIEVEMENT_DEFINITIONS.filter(
      (achievement) => completedTasksCount >= achievement.requiredTasks
    );

    for (const achievementDef of ACHIEVEMENT_DEFINITIONS) {
      await prisma.achievement.upsert({
        where: { code: achievementDef.code },
        update: {},
        create: {
          code: achievementDef.code,
          name: achievementDef.name,
          avatar: achievementDef.avatar,
        },
      });
    }

    for (const achievement of achievementsToUnlock) {
      const existingAchievement = await prisma.achievement.findUnique({
        where: { code: achievement.code },
      });

      if (existingAchievement) {
        await prisma.userAchievement.upsert({
          where: {
            userId_achievementId: {
              userId: userId,
              achievementId: existingAchievement.id,
            },
          },
          update: {},
          create: {
            userId: userId,
            achievementId: existingAchievement.id,
          },
        });
      }
    }

    const unlockedAchievements = await prisma.userAchievement.findMany({
      where: { userId: userId },
      include: {
        achievement: true,
      },
    });

    const achievements = unlockedAchievements.map((ua) => ({
      id: ua.achievement.id,
      code: ua.achievement.code,
      name: ua.achievement.name,
      avatar: ua.achievement.avatar,
      unlockedAt: ua.unlockedAt,
    }));

    res.json({ data: achievements });
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
