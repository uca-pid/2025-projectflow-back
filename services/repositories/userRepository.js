import prisma from "../databaseService.js";
import { ACHIEVEMENT_DEFINITIONS } from "../../utils/achievements.js";

export async function getAllUsers() {
  const users = await prisma.user.findMany();
  return users;
}

export async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id } });
  return user;
}

export async function getUserByEmail(email) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { invitations: true },
  });
  return user;
}

export async function updateUser(userToUpdate, deleteSessions = false) {
  const updatedUser = await prisma.user.update({
    where: {
      id: userToUpdate.id,
    },
    data: userToUpdate,
  });

  if (deleteSessions) {
    await prisma.session.deleteMany({
      where: {
        userId: userToUpdate.id,
      },
    });
  }

  return updatedUser;
}

export async function deleteUser(id) {
  const deletedUser = await prisma.user.delete({
    where: {
      id,
    },
  });
  return deletedUser;
}

export const isAdmin = (userId) => {
  const user = getUserById(userId);
  return user.role === "admin";
};

export async function completedTasksCount(userId) {
  return await prisma.task.count({
    where: {
      completedById: userId,
      status: "DONE",
    },
  });
}

export async function unlockAchievement(userId, achievementCode) {
  const achievement = await prisma.achievement.findUnique({
    where: {
      code: achievementCode,
    },
  });

  if (!achievement) {
    return;
  }

  const achievementId = achievement.id;

  await prisma.userAchievement.upsert({
    where: {
      userId_achievementId: {
        userId,
        achievementId,
      },
    },
    update: {},
    create: {
      userId,
      achievementId,
    },
  });
}

export async function getUserAchievements(userId) {
  const unlockedAchievements = await prisma.userAchievement.findMany({
    where: {
      userId,
    },
    include: {
      achievement: true,
    },
  });

  return unlockedAchievements.map((ua) => ({
    id: ua.achievement.id,
    code: ua.achievement.code,
    name: ua.achievement.name,
    avatar: ua.achievement.avatar,
    unlockedAt: ua.unlockedAt,
  }));
}

export async function getAllAchievements() {
  return ACHIEVEMENT_DEFINITIONS;
}
