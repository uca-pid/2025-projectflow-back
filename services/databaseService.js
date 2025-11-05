import { PrismaClient } from "../prisma/generated/prisma/index.js";

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

export async function getUserByEmail(email) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { invitations: true },
  });
  return user;
}

export async function createInvitation(taskId, inviterId, invitedId) {
  const invitation = await prisma.invitation.create({
    data: {
      taskId,
      inviterId,
      invitedId,
    },
  });
  return invitation;
}

export async function getUserInvites(userId) {
  const invites = await prisma.invitation.findMany({
    where: {
      invitedId: userId,
    },
    include: {
      inviter: {
        select: { name: true, email: true },
      },
      task: {
        select: { title: true },
      },
    },
  });
  return invites;
}

export async function updateUser(userToUpdate) {
  const updatedUser = await prisma.user.update({
    where: {
      id: userToUpdate.id,
    },
    data: userToUpdate,
  });

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

async function getSubTasksRecursively(taskId) {
  const subTasks = await prisma.task.findMany({
    where: { parentTaskId: taskId },
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
      trackedUsers: {
        select: { id: true, name: true, email: true },
      },
      parentTask: {
        select: { id: true, title: true },
      },
      completedBy: true,
      invitations: true,
    },
  });

  for (const subTask of subTasks) {
    subTask.subTasks = await getSubTasksRecursively(subTask.id);
  }

  return subTasks;
}

export async function getAllTasks(userId) {
  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { creatorId: userId },
        { assignedUsers: { some: { id: userId } } },
        { trackedUsers: { some: { id: userId } } },
      ],
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
      trackedUsers: {
        select: { id: true, name: true, email: true },
      },
      parentTask: {
        select: { id: true, title: true },
      },
      completedBy: true,
      invitations: true,
    },
  });

  for (const task of tasks) {
    task.subTasks = await getSubTasksRecursively(task.id);
  }

  return tasks;
}

export async function getTaskById(taskId) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
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
      trackedUsers: {
        select: { id: true, name: true, email: true },
      },
      parentTask: {
        select: { id: true, title: true },
      },
      completedBy: true,
      invitations: true,
      notes: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (task) {
    task.subTasks = await getSubTasksRecursively(task.id);
  }

  return task;
}

export async function createTask(
  userId,
  title,
  description,
  deadline,
  parentTaskId,
) {
  const data = {
    title,
    description,
    deadline: deadline ? new Date(deadline) : null,
    creatorId: userId,
    assignedUsers: {
      connect: [{ id: userId }],
    },
    parentTaskId: parentTaskId || null,
  };

  const task = await prisma.task.create({
    data,
    include: {
      creator: {
        select: { id: true, name: true, email: true },
      },
      parentTask: {
        select: { id: true, title: true },
      },
      subTasks: {
        select: { id: true, title: true, status: true },
      },
    },
  });
  return task;
}

export async function updateTask(taskId, data) {
  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data,
    include: {
      creator: {
        select: { id: true, name: true, email: true },
      },
    },
  });
  return updatedTask;
}

export async function deleteTask(taskId) {
  await prisma.task.delete({
    where: { id: taskId },
  });
  return { message: "Task deleted" };
}

export async function assignUserToTask(
  taskId,
  userIdToAssign,
  type = "assign",
  role = "viewer",
) {
  let updatedTask;

  if (role === "viewer") {
    await prisma.task.update({
      where: { id: taskId },
      data: {
        trackedUsers: {
          connect: { id: userIdToAssign },
        },
        appliedUsers: {
          disconnect: { id: userIdToAssign },
        },
      },
    });
  } else if (role === "assignee") {
    updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        assignedUsers: {
          connect: { id: userIdToAssign },
        },
        appliedUsers: {
          disconnect: { id: userIdToAssign },
        },
      },
    });
  }

  if (type === "invite") {
    await prisma.invitation.deleteMany({
      where: {
        invitedId: userIdToAssign,
        taskId: taskId,
      },
    });
  }

  return await getTaskById(taskId);
}

export async function rejectInvite(invitationId) {
  const result = await prisma.invitation.delete({
    where: { invitationId },
  });
  return result;
}

export async function unassignUserFromTask(taskId, userIdToUnassign) {
  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      assignedUsers: {
        disconnect: { id: userIdToUnassign },
      },
      trackedUsers: {
        disconnect: { id: userIdToUnassign },
      },
    },
  });

  return updatedTask;
}

export async function applyUserToTask(currentUserId, taskId) {
  const result = await prisma.task.update({
    where: { id: taskId },
    data: {
      appliedUsers: {
        connect: { id: currentUserId },
      },
    },
  });
  return result;
}

export async function rejectUserFromTask(userId, taskId) {
  const result = await prisma.task.update({
    where: { id: taskId },
    data: {
      appliedUsers: {
        disconnect: { id: userId },
      },
    },
  });
  return result;
}

export async function markTaskAsCompleted(taskId, completedByUserId) {
  const result = await prisma.task.update({
    where: { id: taskId },
    data: {
      completedById: completedByUserId,
      completedAt: new Date(),
    },
  });
  return result;
}

export async function unmarkTaskAsCompleted(taskId) {
  const result = await prisma.task.update({
    where: { id: taskId },
    data: {
      completedById: null,
      completedAt: null,
    },
  });
  return result;
}

export async function createNote(taskId, userId, text, isPositive = true) {
  const note = await prisma.note.create({
    data: {
      taskId,
      userId,
      text,
      isPositive,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
  return note;
}

export async function getTaskNotes(taskId) {
  const notes = await prisma.note.findMany({
    where: { taskId },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return notes;
}

export async function deleteNote(noteId) {
  const result = await prisma.note.delete({
    where: { id: noteId },
  });
  return result;
}
