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
}
// Task functions
export async function getAllTasks(userId) {
  const tasks = await prisma.task.findMany({
    where: {
      OR: [{ creatorId: userId }, { assignedUsers: { some: { id: userId } } }],
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true },
      },
      assignedUsers: {
        select: { id: true, name: true, email: true },
      },
      appliedUsers: {
        select: { id: true, name: true, email: true },
      },
      parentTask: {
        select: { id: true, title: true },
      },
      subtasks: {
        select: { id: true, title: true, status: true },
      },
    },
  });
  return tasks;
}

export async function getTaskById(taskId) {
  const task = await prisma.task.findUnique({
    where: { id: taskId }, // No parseInt, usando UUID
    include: {
      creator: {
        select: { id: true, name: true, email: true },
      },
      assignedUsers: {
        select: { id: true, name: true, email: true },
      },
      parentTask: {
        select: { id: true, title: true },
      },
      subtasks: {
        select: { id: true, title: true, status: true },
      },
    },
  });
  return task;
}

export async function createTask(
  userId,
  title,
  description,
  deadline,
  parentTaskId,
  assignedUserIds,
) {
  // Prepare the data object
  const data = {
    title,
    description,
    deadline: deadline ? new Date(deadline) : null,
    creatorId: userId,
    assignedUsers: {
      connect: [{ id: userId }], // Always assign the creator
    },
  };

  // Add parent task if it's a subtask
  if (parentTaskId) {
    data.parentTaskId = parentTaskId; // No parseInt, using UUID
  }

  // Add additional assigned users if provided
  if (assignedUserIds && Array.isArray(assignedUserIds) && assignedUserIds.length > 0) {
    // Connect additional users (avoid duplicating the creator)
    const uniqueUserIds = [...new Set([userId, ...assignedUserIds])];
    data.assignedUsers.connect = uniqueUserIds.map((id) => ({ id }));
  }

  const task = await prisma.task.create({
    data,
    include: {
      creator: {
        select: { id: true, name: true, email: true },
      },
      // DO NOT include assignedUsers as requested
      parentTask: {
        select: { id: true, title: true },
      },
      subtasks: {
        select: { id: true, title: true, status: true },
      },
    },
  });
  return task;
}

export async function updateTask(taskId, userId, data) {
  const updatedTask = await prisma.task.update({
    where: { id: taskId }, // No parseInt, using UUID
    data,
    include: {
      creator: {
        select: { id: true, name: true, email: true },
      },
    },
  });
  return updatedTask;
}

export async function deleteTask(taskId, userId) {
  await prisma.task.delete({
    where: { id: taskId }, // No parseInt, using UUID
  });
  return { message: "Task deleted" };
}

export async function assignUserToTask(currentUserId, taskId, userIdToAssign) {
  // Simple DB operation, validations are in requestHandler
  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      assignedUsers: {
        connect: { id: userIdToAssign },
      },
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true },
      },
      assignedUsers: {
        select: { id: true, name: true, email: true },
      },
      parentTask: {
        select: { id: true, title: true },
      },
      subtasks: {
        select: { id: true, title: true, status: true },
      },
    },
  });

  return updatedTask;
}

export async function unassignUserFromTask(
  currentUserId,
  taskId,
  userIdToUnassign,
) {
  // Simple DB operation, validations are in requestHandler
  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      assignedUsers: {
        disconnect: { id: userIdToUnassign },
      },
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true },
      },
      assignedUsers: {
        select: { id: true, name: true, email: true },
      },
      parentTask: {
        select: { id: true, title: true },
      },
      subtasks: {
        select: { id: true, title: true, status: true },
      },
    },
  });

  return updatedTask;
}

export async function applyUserToTask(currentUserId, taskId) {
  // Simple DB operation, validations are in requestHandler
  const result = await prisma.task.update({
    where: { id: taskId },
    data: {
      assignedUsers: {
        connect: { id: currentUserId },
      },
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true },
      },
      assignedUsers: {
        select: { id: true, name: true, email: true },
      },
    },
  });
  return result;
}
