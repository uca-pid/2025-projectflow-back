import { throwError } from "./errorHandler.js";
import {
  getAllUsers as getAllUsersDb,
  updateUser as updateUserDb,
  getUserById as getUserByIdDb,
  deleteUser as deleteUserDb,
  getAllTasks,
  createTask as createTaskDb,
  updateTask as updateTaskDb,
  deleteTask as deleteTaskDb,
  assignUserToTask as assignUserToTaskDb,
  unassignUserFromTask as unassignUserFromTaskDb,
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

export const createTask = async (user, title, description, deadline, parentTaskId, assignedUserIds) => {
  const task = await createTaskDb(user.id, title, description, deadline, parentTaskId, assignedUserIds);
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

  const task = await updateTaskDb(taskId, user.id, updateData);
  return task;
};

export const deleteTask = async (user, taskId) => {
  const result = await deleteTaskDb(taskId, user.id);
  return result;
};

// Get users for task assignment (no admin required)
export const getUsersForAssignment = async (user) => {
  const users = await getAllUsersDb();
  return users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email
  }));
};

// Assign user to task
export const assignUserToTask = async (currentUser, taskId, userId) => {
  const result = await assignUserToTaskDb(currentUser.id, taskId, userId);
  return result;
};

// Unassign user from task
export const unassignUserFromTask = async (currentUser, taskId, userId) => {
  const result = await unassignUserFromTaskDb(currentUser.id, taskId, userId);
  return result;
};
