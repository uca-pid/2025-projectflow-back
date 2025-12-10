import prisma from "../databaseService.js";

async function getSubTasksRecursively(taskId) {
  const subTasks = await prisma.task.findMany({
    where: { parentTaskId: taskId },
    include: {
      creator: {
        select: { id: true, name: true, email: true },
      },
      parentTask: {
        select: { id: true, title: true },
      },
    },
  });

  for (const subTask of subTasks) {
    subTask.subTasks = await getSubTasksRecursively(subTask.id);
  }

  return subTasks;
}

export async function getAllOwnedTasks(userId) {
  const tasks = await prisma.task.findMany({
    where: {
      OR: [{ creatorId: userId }],
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true },
      },
      parentTask: {
        select: { id: true, title: true },
      },
    },
  });

  for (const task of tasks) {
    task.subTasks = await getSubTasksRecursively(task.id);
  }

  return tasks;
}

export async function getAllAssignedTasks(userId) {
  const assignments = await prisma.assignment.findMany({
    where: {
      userId,
    },
  });
  const tasks = [];
  for (const assignment of assignments) {
    tasks.push(
      await prisma.task.findUnique({
        where: { id: assignment.taskId },
      }),
    );
  }
  for (const task of tasks) {
    task.subTasks = await getSubTasksRecursively(task.id);
  }

  return tasks;
}

export async function getAllSubscribedTasks(userId) {
  const subsciptions = await prisma.subscription.findMany({
    where: {
      userId,
    },
  });
  const tasks = [];
  for (const subscription of subsciptions) {
    tasks.push(
      await prisma.task.findUnique({
        where: { id: subscription.taskId },
      }),
    );
  }
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
      parentTask: {
        select: { id: true, title: true },
      },
      completedBy: true,
      notes: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: {
          createdAt: "desc",
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
  recurrenceType = null,
  recurrenceExpiresAt = null,
  recurrences = null,
) {
  const data = {
    title,
    description,
    deadline: deadline ? new Date(deadline) : null,
    creatorId: userId,
    parentTaskId: parentTaskId || null,
    recurrenceType,
    recurrenceExpiresAt: recurrenceExpiresAt
      ? new Date(recurrenceExpiresAt)
      : null,
    recurrences,
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
  const deletedTask = await prisma.task.delete({
    where: { id: taskId },
  });

  return deletedTask;
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
