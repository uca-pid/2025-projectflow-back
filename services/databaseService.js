import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config({ path: __dirname + "/../.env" });

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
