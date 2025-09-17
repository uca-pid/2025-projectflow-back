import { PrismaClient } from "../prisma/generated/prisma/index.js";
import { auth } from "../auth.js";

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

export async function getAllUsers() {
  const users = await prisma.user.findMany();
  return users;
}

export async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id } });
  return user;
}

export async function updateUser(userToUpdate) {
  // Update user
  const updatedUser = await prisma.user.update({
    where: {
      id: userToUpdate.id,
    },
    data: userToUpdate,
  });

  // Delete all user sessions
  await prisma.session.deleteMany({
    where: {
      userId: userToUpdate.id,
    },
  });

  return updatedUser;
}

export async function deleteUser(id) {
  const deletedUser = await prisma.user.delete({
    where: {
      id,
    },
  });
  return deletedUser;

// Task functions
export async function getAllTasks(userId) {
  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { creatorId: userId },
        { assignedUsers: { some: { id: userId } } }
      ]
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true }
      },
      assignedUsers: {
        select: { id: true, name: true, email: true }
      }
    }
  });
  return tasks;
}

export async function createTask(userId, title, description, deadline) {
  const task = await prisma.task.create({
    data: {
      title,
      description,
      deadline: deadline ? new Date(deadline) : null,
      creatorId: userId,
      assignedUsers: {
        connect: { id: userId }
      }
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true }
      }
    }
  });
  return task;
}

export async function updateTask(taskId, userId, data) {
  // Check if user has access to task
  const task = await prisma.task.findUnique({
    where: { id: parseInt(taskId) },
    include: {
      assignedUsers: { where: { id: userId } }
    }
  });
  
  if (!task || (task.creatorId !== userId && task.assignedUsers.length === 0)) {
    throw new Error("No access to this task");
  }

  const updatedTask = await prisma.task.update({
    where: { id: parseInt(taskId) },
    data,
    include: {
      creator: {
        select: { id: true, name: true, email: true }
      }
    }
  });
  return updatedTask;
}

export async function deleteTask(taskId, userId) {
  // Check if user is creator
  const task = await prisma.task.findUnique({
    where: { id: parseInt(taskId) }
  });
  
  if (!task || task.creatorId !== userId) {
    throw new Error("Only creator can delete task");
  }

  await prisma.task.delete({
    where: { id: parseInt(taskId) }
  });
  return { message: "Task deleted" };
}
