const { PrismaClient } = require("@prisma/client");
dotenv.config({ path: __dirname + "/../.env" });
const dotenv = require("dotenv");

const prisma = new PrismaClient();

async function connectToDatabase() {
  try {
    await prisma.$connect();
    console.log("Connected to database");
  } catch (err) {
    console.error("Database connection failed:", err);
    throw err;
  }
}

async function disconnectFromDatabase() {
  await prisma.$disconnect();
}

module.exports = {
  connectToDatabase,
  disconnectFromDatabase,
  prisma,
};
