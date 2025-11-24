import { PrismaClient } from "../prisma/generated/prisma/index.js";
import { ACHIEVEMENT_DEFINITIONS } from "../utils/achievements.js";

export const prisma = new PrismaClient();

export async function connectToDatabase() {
  try {
    await prisma.$connect();
    console.log("Connected to database");
  } catch (err) {
    console.error("Database connection failed:", err);
    throw err;
  }
}

export async function disconnectFromDatabase() {
  await prisma.$disconnect();
}

async function seedAchievements() {
  for (const definition of ACHIEVEMENT_DEFINITIONS) {
    await prisma.achievement.upsert({
      where: { code: definition.code },
      update: {},
      create: {
        code: definition.code,
        name: definition.name,
        avatar: definition.avatar,
      },
    });
  }
}

seedAchievements();
export default prisma;
