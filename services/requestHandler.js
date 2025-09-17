import { throwError } from "./errorHandler.js";
import { getAllUsers as getAllUsersDb, getAllTasks, createTask as createTaskDb, updateTask as updateTaskDb, deleteTask as deleteTaskDb } from "./databaseService.js";

export const getAllUsers = async (user) => {
  if (!user) {
    throwError(401);
  }
  if (user.role !== "ADMIN") {
    throwError(403);
  }

  const users = await getAllUsersDb();
  return users;
};

// Task functions
export const getTasks = async (user) => {
  if (!user) {
    throwError(401);
  }
  const tasks = await getAllTasks(user.id);
  return tasks;
};

export const createTask = async (user, title, description, deadline) => {
  if (!user) {
    throwError(401);
  }
  const task = await createTaskDb(user.id, title, description, deadline);
  return task;
};

export const updateTask = async (user, taskId, title, description, deadline, status) => {
  if (!user) {
    throwError(401);
  }
  
  const updateData = {};
  if (title) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (deadline) updateData.deadline = new Date(deadline);
  if (status) updateData.status = status;

  const task = await updateTaskDb(taskId, user.id, updateData);
  return task;
};

export const deleteTask = async (user, taskId) => {
  if (!user) {
    throwError(401);
  }
  const result = await deleteTaskDb(taskId, user.id);
  return result;
};
