import { getTaskById as getTaskByIdDb } from "../databaseService.js";

export const hasAccessToEdit = async (user, task) => {
  let currentTask = task;
  while (currentTask.parentTaskId !== null) {
    if (
      currentTask.creatorId === user.id ||
      currentTask.assignedUsers?.some((u) => u.id === user.id)
    ) {
      return true;
    }
    const parent = await getTaskByIdDb(currentTask.parentTaskId);
    currentTask = parent;
    console.log("currentTask", currentTask.title);
  }
  return (
    currentTask.creatorId === user.id ||
    currentTask.assignedUsers?.some((u) => u.id === user.id)
  );
};

export const hasAccessToView = async (user, task) => {
  if (task.isPublic) {
    return true;
  }
  let currentTask = task;
  while (currentTask.parentTaskId !== null) {
    if (
      currentTask.creatorId === user.id ||
      currentTask.assignedUsers.some((u) => u.id === user.id) ||
      currentTask.isPublic
    ) {
      return true;
    }
    const parent = await getTaskByIdDb(currentTask.parentTaskId);
    currentTask = parent;
  }
  return (
    currentTask.creatorId === user.id ||
    currentTask.assignedUsers.some((u) => u.id === user.id) ||
    currentTask.isPublic
  );
};

export const isAdmin = (user) => {
  return user.role === "admin";
};

export const isOwner = (user, resource) => {
  return resource.creatorId === user.id || resource.userId === user.id;
};

