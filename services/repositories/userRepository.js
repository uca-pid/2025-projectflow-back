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

export async function getUserStats(userId) {
  const stats = await prisma.userStats.findUnique({
    where: {
      userId,
    },
  });
  return stats;
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

  await prisma.userAchievement.upsert({
    where: {
      userId_achievementCode: {
        userId,
        achievementCode,
      },
    },
    update: {},
    create: {
      userId,
      achievementCode,
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
    code: ua.achievement.code,
    name: ua.achievement.name,
    avatar: ua.achievement.avatar,
    unlockedAt: ua.unlockedAt,
  }));
}

export async function incrementUserStat(userId, statKey) {
  console.log("incrementUserStat", userId, statKey);
  await prisma.userStats.upsert({
    where: {
      userId,
    },
    update: {
      [statKey]: {
        increment: 1,
      },
    },
    create: {
      userId,
      [statKey]: 1,
    },
  });
}

export async function getAllAchievements() {
  return ACHIEVEMENT_DEFINITIONS;
}
