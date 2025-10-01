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
    where: { id: parseInt(taskId) },
    include: {
      creator: {
        select: { id: true, name: true, email: true },
      },
      assignedUsers: {
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
    // Verify parent task exists and user has access
    const parentTask = await prisma.task.findUnique({
      where: { id: parseInt(parentTaskId) },
      include: { assignedUsers: { where: { id: userId } } },
    });

    if (
      !parentTask ||
      (parentTask.creatorId !== userId && parentTask.assignedUsers.length === 0)
    ) {
      throw new Error("No access to parent task");
    }

    data.parentTaskId = parseInt(parentTaskId);
  }

  // Add additional assigned users if provided
  if (
    assignedUserIds &&
    Array.isArray(assignedUserIds) &&
    assignedUserIds.length > 0
  ) {
    // Verify all users exist
    const users = await prisma.user.findMany({
      where: { id: { in: assignedUserIds } },
    });

    if (users.length !== assignedUserIds.length) {
      throw new Error("Some assigned users do not exist");
    }

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

export async function updateTask(taskId, userId, data) {
  // Check if user has access to task
  const task = await prisma.task.findUnique({
    where: { id: parseInt(taskId) },
    include: {
      assignedUsers: { where: { id: userId } },
    },
  });

  if (!task || (task.creatorId !== userId && task.assignedUsers.length === 0)) {
    throw new Error("No access to this task");
  }

  const updatedTask = await prisma.task.update({
    where: { id: parseInt(taskId) },
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
  // Check if user is creator
  const task = await prisma.task.findUnique({
    where: { id: parseInt(taskId) },
  });

  if (!task || task.creatorId !== userId) {
    throw new Error("Only creator can delete task");
  }

  await prisma.task.delete({
    where: { id: parseInt(taskId) },
  });
  return { message: "Task deleted" };
}

export async function assignUserToTask(currentUserId, taskId, userIdToAssign) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignedUsers: { where: { id: currentUserId } },
    },
  });

  if (
    !task ||
    (task.creatorId !== currentUserId && task.assignedUsers.length === 0)
  ) {
    throw new Error("No access to this task");
  }

  // Verify the user to assign exists
  const userToAssign = await prisma.user.findUnique({
    where: { id: userIdToAssign },
  });

  if (!userToAssign) {
    throw new Error("User to assign does not exist");
  }

  // Check if user is already assigned
  const existingAssignment = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignedUsers: { where: { id: userIdToAssign } },
    },
  });

  if (existingAssignment.assignedUsers.length > 0) {
    throw new Error("User is already assigned to this task");
  }

  // Assign the user to the task
  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      assignedUsers: {
        connect: { id: userIdToAssign },
      },
      appliedUsers: {
        disconnect: { id: userIdToAssign },
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
  // Check if current user has access to task
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignedUsers: { where: { id: currentUserId } },
    },
  });

  if (
    !task ||
    (task.creatorId !== currentUserId && task.assignedUsers.length === 0)
  ) {
    throw new Error("No access to this task");
  }

  // Verify the user to unassign exists
  const userToUnassign = await prisma.user.findUnique({
    where: { id: userIdToUnassign },
  });

  if (!userToUnassign) {
    throw new Error("User to unassign does not exist");
  }

  // Check if user is actually assigned to the task
  const existingAssignment = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignedUsers: { where: { id: userIdToUnassign } },
    },
  });

  if (existingAssignment.assignedUsers.length === 0) {
    throw new Error("User is not assigned to this task");
  }

  // Prevent unassigning the creator
  if (task.creatorId === userIdToUnassign) {
    throw new Error("Cannot unassign the task creator");
  }

  // Unassign the user from the task
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
  const task = await prisma.user.update({
    where: { id: currentUserId },
    data: {
      appliedTasks: {
        connect: { id: taskId },
      },
    },
  });
  return task;
}
