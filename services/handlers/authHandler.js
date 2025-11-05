import { getTaskById as getTaskByIdDb } from "../databaseService.js";

/**
 * Checks if a user has edit access to a task
 * A user has edit access if they are:
 * - The creator of the task OR any parent task
 * - Assigned to the task OR any parent task
 */
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

/**
 * Checks if a user has view access to a task
 * A user has view access if they are:
 * - The creator of the task OR any parent task
 * - Assigned to the task OR any parent task
 * - The task OR any parent task is public
 */
export const hasAccessToView = async (user, task) => {
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

/**
 * Checks if a user is an admin
 * (You can expand this with admin role checking logic)
 */
export const isAdmin = (user) => {
  return user.role === "admin";
};

/**
 * Checks if a user owns a resource
 */
export const isOwner = (user, resource) => {
  return resource.creatorId === user.id || resource.userId === user.id;
};