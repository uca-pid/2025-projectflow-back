import prisma from "../databaseService.js";
import { getTaskById } from "./taskRepository.js";
import { getUserById } from "./userRepository.js";

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

// --- REQUESTS ---

export async function hasAppliedToTask(userId, taskId) {
  const result = await prisma.application.findFirst({
    where: {
      taskId,
      userId: userId,
    },
  });
  return result;
}

export async function hasBeenInvitedToTask(userId, taskId) {
  const result = await prisma.invitation.findFirst({
    where: {
      taskId,
      invitedId: userId,
    },
  });
  return result !== null;
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

export async function deleteInvitation(userId, taskId) {
  const result = await prisma.invitation.deleteMany({
    where: { invitedId: userId, taskId },
  });
  return result;
}

export async function createApplication(currentUserId, taskId) {
  const result = await prisma.application.create({
    data: {
      taskId,
      userId: currentUserId,
    },
  });
  return result;
}

export async function deleteApplication(userId, taskId) {
  const result = await prisma.application.deleteMany({
    where: {
      taskId,
      userId,
    },
  });
  return result;
}
export async function getTaskApplications(taskId) {
  const result = await prisma.application.findMany({
    where: {
      taskId,
    },
    include: {
      user: {
        select: { id: true, image: true, name: true, email: true },
      },
    },
  });
  return result;
}
// --- CONNECTIONS ---

export async function createSubscription(taskId, userIdToAssign) {
  const subscription = await prisma.subscription.create({
    data: {
      taskId,
      userId: userIdToAssign,
    },
  });

  return subscription;
}

// In accessRepository.js
export async function getTaskSubscriptions(taskId) {
  console.log("Repository - received taskId:", taskId); // Add this

  const result = await prisma.subscription.findMany({
    where: {
      taskId,
    },
    include: {
      user: {
        select: { id: true, image: true, name: true, email: true },
      },
    },
  });
  return result;
}

export async function createAssignment(taskId, userId) {
  const assignment = await prisma.assignment.create({
    data: {
      taskId,
      userId,
    },
  });
  return assignment;
}

export async function getTaskAssignments(taskId) {
  const result = await prisma.assignment.findMany({
    where: {
      taskId,
    },
    include: {
      user: {
        select: { id: true, image: true, name: true, email: true },
      },
    },
  });
  return result;
}

export async function unlinkUserFromTask(taskId, userIdToUnassign) {
  await prisma.subscription.deleteMany({
    where: {
      taskId,
      userId: userIdToUnassign,
    },
  });
  await prisma.assignment.deleteMany({
    where: {
      taskId,
      userId: userIdToUnassign,
    },
  });
}

// ---- ACCESS CONTROL ----

export const hasAccessToEdit = async (userId, taskId) => {
  let currentTask = await getTaskById(taskId);
  let assignments = [];

  assignments = await prisma.assignment.findMany({
    where: {
      taskId: currentTask.id,
    },
  });

  while (currentTask !== null) {
    if (
      currentTask.creatorId === userId ||
      assignments.some((a) => a.userId === userId)
    ) {
      return true;
    }

    if (currentTask.parentTaskId !== null) {
      const parent = await getTaskById(currentTask.parentTaskId);
      currentTask = parent;

      assignments = await prisma.assignment.findMany({
        where: {
          taskId: currentTask.id,
        },
      });
    } else {
      break;
    }
  }

  return false;
};

export const hasAccessToView = async (userId, taskId) => {
  let currentTask = await getTaskById(taskId);
  if (currentTask.isPublic) {
    return true;
  }

  let subscriptions = await prisma.subscription.findMany({
    where: {
      taskId: currentTask.id,
    },
  });
  let assignments = await prisma.assignment.findMany({
    where: {
      taskId: currentTask.id,
    },
  });

  while (currentTask !== null) {
    if (
      currentTask.creatorId === userId ||
      subscriptions.some((u) => u.userId === userId) ||
      assignments.some((u) => u.userId === userId) ||
      currentTask.isPublic
    ) {
      return true;
    }

    if (currentTask.parentTaskId !== null) {
      const parent = await getTaskById(currentTask.parentTaskId);
      currentTask = parent;

      subscriptions = await prisma.subscription.findMany({
        where: {
          taskId: currentTask.id,
        },
      });
      assignments = await prisma.assignment.findMany({
        where: {
          taskId: currentTask.id,
        },
      });
    } else {
      break;
    }
  }

  return false;
};
