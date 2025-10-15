import { throwError } from "./errorHandler.js";
import {
  getAllUsers as getAllUsersDb,
  updateUser as updateUserDb,
  getUserById as getUserByIdDb,
  deleteUser as deleteUserDb,
  getAllTasks,
  getTaskById as getTaskByIdDb,
  createTask as createTaskDb,
  updateTask as updateTaskDb,
  deleteTask as deleteTaskDb,
  assignUserToTask as assignUserToTaskDb,
  unassignUserFromTask as unassignUserFromTaskDb,
  applyUserToTask as applyUserToTaskDb,
  rejectUserFromTask as rejectUserFromTaskDb,
} from "./databaseService.js";

export const getAllUsers = async (user) => {
  if (user.role !== "ADMIN") {
    throwError(403);
  }

  const users = await getAllUsersDb();
  return users;
};

export const updateUser = async (user, userToUpdateId, userToUpdateData) => {
  if (!user) {
    throwError(401);
  }

  if (user.role !== "ADMIN") {
    throwError(403);
  }

  if (!userToUpdateId || !userToUpdateData) {
    throwError(400);
  }

  if (!userToUpdateData?.id) {
    userToUpdateData.id = userToUpdateId;
  }

  if (userToUpdateId != userToUpdateData.id) {
    throwError(400);
  }

  const existsUser = await getUserByIdDb(userToUpdateId);
  if (!existsUser) {
    throwError(404);
  }

  const updatedUser = await updateUserDb(userToUpdateData);
  return updatedUser;
};

export const deleteUser = async (user, userToDeleteId) => {
  if (!user) {
    throwError(401);
  }

  if (user.role !== "ADMIN") {
    throwError(403);
  }

  if (!userToDeleteId) {
    throwError(400);
  }

  const existsUser = await getUserByIdDb(userToDeleteId);
  if (!existsUser) {
    throwError(404);
  }

  const deletedUser = await deleteUserDb(userToDeleteId);
  return deletedUser;
};

// Task functions
export const getTasks = async (user) => {
  const tasks = await getAllTasks(user.id);
  return tasks;
};

export const getTaskById = async (user, taskId) => {
  if (!taskId || taskId.trim() === "") {
    throwError(400, "Task ID is required");
  }

  const task = await getTaskByIdDb(taskId);

  if (!task) {
    throwError(404, "Task not found");
  }

  // Check if user has access to the task
  const hasAccess =
    task.creatorId === user.id ||
    task.assignedUsers.some((u) => u.id === user.id);

  if (!hasAccess) {
    // Return limited info if no access
    return {
      id: task.id,
      title: task.title,
    };
  }

  return task;
};

export const createTask = async (
  user,
  title,
  description,
  deadline,
  parentTaskId = null,
) => {
  if (!title || title.trim() === "") {
    throwError(400, "Title is required");
  }

  if (parentTaskId) {
    const parentTask = await getTaskByIdDb(parentTaskId);
    if (!parentTask) {
      throwError(404, "Parent task not found");
    }

    const hasAccess =
      parentTask.creatorId === user.id ||
      parentTask.assignedUsers.some((u) => u.id === user.id);
    if (!hasAccess) {
      throwError(403, "No access to parent task");
    }
  }

  const task = await createTaskDb(
    user.id,
    title,
    description,
    deadline,
    parentTaskId,
  );
  return task;
};

export const updateTask = async (
  user,
  taskId,
  title,
  description,
  deadline,
  status,
) => {
  const updateData = {};
  if (title) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (deadline) updateData.deadline = new Date(deadline);
  if (status) updateData.status = status;

  const foundTask = await getTaskByIdDb(taskId);
  if (!foundTask) {
    throwError(404, "Task not found");
  }

  const hasAccess =
    foundTask.creatorId === user.id ||
    foundTask.assignedUsers.some((u) => u.id === user.id);
  if (!hasAccess) {
    throwError(403, "No access to this task");
  }

  const task = await updateTaskDb(taskId, updateData);
  return task;
};

export const deleteTask = async (user, taskId) => {
  const task = await getTaskByIdDb(taskId);
  if (!task) {
    throwError(404, "Task not found");
  }

  const hasAccess =
    task.creatorId === user.id ||
    task.assignedUsers.some((u) => u.id === user.id);

  if (!hasAccess) {
    throwError(403, "No access to this task");
  }

  const result = await deleteTaskDb(taskId);
  return result;
};

// Assign user to task
export const assignUserToTask = async (currentUser, taskId, userId) => {
  if (!taskId || taskId.trim() === "") {
    throwError(400, "Task ID is required");
  }
  if (!userId || userId.trim() === "") {
    throwError(400, "User ID is required");
  }

  // Verify task exists
  const task = await getTaskByIdDb(taskId);
  if (!task) {
    throwError(404, "Task not found");
  }

  // Verify user to assign exists
  const userToAssign = await getUserByIdDb(userId);
  if (!userToAssign) {
    throwError(404, "User not found");
  }

  // Check if current user has access to task
  const hasAccess =
    task.creatorId === currentUser.id ||
    task.assignedUsers.some((u) => u.id === currentUser.id);
  if (!hasAccess) {
    throwError(403, "No access to this task");
  }

  // Check if user is already assigned
  const isAlreadyAssigned = task.assignedUsers.some((u) => u.id === userId);
  if (isAlreadyAssigned) {
    throwError(409, "User is already assigned to this task");
  }

  const result = await assignUserToTaskDb(taskId, userId);
  return result;
};

// Unassign user from task
export const unassignUserFromTask = async (currentUser, taskId, userId) => {
  if (!taskId || taskId.trim() === "") {
    throwError(400, "Task ID is required");
  }
  if (!userId || userId.trim() === "") {
    throwError(400, "User ID is required");
  }

  // Verify task exists
  const task = await getTaskByIdDb(taskId);
  if (!task) {
    throwError(404, "Task not found");
  }

  // Check if current user has access to task
  const hasAccess =
    task.creatorId === currentUser.id ||
    task.assignedUsers.some((u) => u.id === currentUser.id);
  if (!hasAccess) {
    throwError(403, "No access to this task");
  }

  // Check if user is actually assigned
  const isAssigned = task.assignedUsers.some((u) => u.id === userId);
  if (!isAssigned) {
    throwError(409, "User is not assigned to this task");
  }

  // Prevent unassigning the creator
  if (task.creatorId === userId) {
    throwError(403, "Cannot unassign the task creator");
  }

  const result = await unassignUserFromTaskDb(taskId, userId);
  return result;
};

// Apply user to task
export const applyUserToTask = async (currentUser, taskId) => {
  if (!taskId || taskId.trim() === "") {
    throwError(400, "Task ID is required");
  }

  // Verify task exists
  const task = await getTaskByIdDb(taskId);
  if (!task) {
    throwError(404, "Task not found");
  }

  // Check if user is already assigned
  const isAlreadyAssigned = task.assignedUsers.some(
    (u) => u.id === currentUser.id,
  );
  if (isAlreadyAssigned) {
    throwError(409, "You are already assigned to this task");
  }

  const result = await applyUserToTaskDb(currentUser.id, taskId);
  return result;
};

export const rejectUserFromTask = async (currentUser, taskId) => {
  if (!taskId || taskId.trim() === "") {
    throwError(400, "Task ID is required");
  }

  // Verify task exists
  const task = await getTaskByIdDb(taskId);
  if (!task) {
    throwError(404, "Task not found");
  }

  const isOwner = task.creatorId === currentUser.id;
  if (!isOwner) {
    throwError(403, "You are not the owner of this task");
  }

  const result = await rejectUserFromTaskDb(currentUser.id, taskId);
  return result;
};
