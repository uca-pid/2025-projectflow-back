import { throwError } from "../errorHandler.js";
import {
  getAllOwnedTasks,
  getAllAssignedTasks,
  getAllSubscribedTasks,
  getTaskById as getTaskByIdDb,
  createTask as createTaskDb,
  updateTask as updateTaskDb,
  deleteTask as deleteTaskDb,
  markTaskAsCompleted as markTaskAsCompletedDb,
  unmarkTaskAsCompleted as unmarkTaskAsCompletedDb,
} from "../repositories/taskRepository.js";

import {
  calculateNextDeadline,
  calculateRecurrenceOptions,
} from "../../utils/recurrenceCalculations.js";

import { incrementUserStat } from "../repositories/userRepository.js";

import {
  hasAccessToEdit,
  hasAccessToView,
  getTaskAssignments,
  getTaskSubscriptions,
  createAssignment,
  createSubscription,
} from "../repositories/accessRepository.js";

import {
  createNote as createNoteDb,
  getTaskNotes as getTaskNotesDb,
  deleteNote as deleteNoteDb,
} from "../repositories/noteRepository.js";

import {
  createObjective as createObjectiveDb,
  getObjectives as getObjectivesDb,
  deleteObjective as deleteObjectiveDb,
} from "../repositories/objectiveRepository.js";

// ---- Fetching ----

export const getUserTasks = async (user) => {
  const tasks = await getAllOwnedTasks(user.id);
  return tasks;
};

export const getAssignedTasks = async (user) => {
  const tasks = await getAllAssignedTasks(user.id);
  return tasks;
};

export const getTrackedTasks = async (user) => {
  const tasks = await getAllSubscribedTasks(user.id);
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

  const hasAccess = await hasAccessToView(user.id, task.id);
  if (!hasAccess) {
    return {
      id: task.id,
      title: task.title,
    };
  }

  return task;
};

// ---- Modifying ----

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

  let parentTask;
  if (parentTaskId) {
    parentTask = await getTaskByIdDb(parentTaskId);
    if (!parentTask) {
      throwError(404, "Parent task not found");
    }

    const access = await hasAccessToEdit(user.id, parentTask.id);
    if (!access) {
      throwError(403, "No access to parent task");
    }
  }

  const task = await createTaskDb(
    parentTask?.creatorId || user.id,
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
  isPublic,
  recurrenceType,
  recurrenceExpiresAt,
  recurrences,
) => {
  const updateData = {};
  if (title) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (deadline) updateData.deadline = new Date(deadline);
  if (status) updateData.status = status;
  if (isPublic !== undefined) updateData.isPublic = isPublic;
  if (recurrenceExpiresAt)
    updateData.recurrenceExpiresAt = new Date(recurrenceExpiresAt);
  if (recurrenceType) updateData.recurrenceType = recurrenceType;
  if (recurrences) updateData.recurrences = recurrences;

  const foundTask = await getTaskByIdDb(taskId);
  if (!foundTask) {
    throwError(404, "Task not found");
  }

  if (!(await hasAccessToEdit(user.id, foundTask.id))) {
    throwError(403, "No access to this task");
  }

  if (status === "DONE") {
    await markTaskAsCompletedDb(taskId, user.id);
    await incrementUserStat(user.id, "tasksCompleted");
    await processTaskRecurrence(taskId);
  } else {
    if (foundTask.status === "DONE") await unmarkTaskAsCompletedDb(taskId);
  }

  const task = await updateTaskDb(taskId, updateData);
  return task;
};

export const deleteTask = async (user, taskId) => {
  const task = await getTaskByIdDb(taskId);
  if (!task) {
    throwError(404, "Task not found");
  }

  if (!(await hasAccessToEdit(user.id, task.id))) {
    throwError(403, "No access to this task");
  }

  const result = await deleteTaskDb(taskId);
  return result;
};

export const cloneTask = async (
  currentUser,
  taskId,
  parentId,
  verify = true,
) => {
  if (!taskId || taskId.trim() === "") {
    throwError(400, "Task ID is required");
  }

  const task = await getTaskByIdDb(taskId);

  if (verify) {
    if (!task) {
      throwError(404, "Task not found");
    }

    if (!(await hasAccessToView(currentUser.id, task.id))) {
      throwError(403, "No access to this task");
    }
  }

  const clonedTask = await createTaskDb(
    currentUser.id,
    task.title,
    task.description,
    task.deadline,
    parentId,
  );

  for (const subTask of task.subTasks) {
    await cloneTask(currentUser, subTask.id, clonedTask.id, false);
  }
};

export const markTaskCompleted = async (currentUser, taskId) => {
  if (!taskId || taskId.trim() === "") {
    throwError(400, "Task ID is required");
  }

  const task = await getTaskByIdDb(taskId);
  if (!task) {
    throwError(404, "Task not found");
  }

  const hasAccess = await hasAccessToEdit(currentUser.id, task.id);
  if (!hasAccess) {
    throwError(403, "You don't have permission to complete this task");
  }

  if (task.status === "DONE") {
    throwError(400, "Task is already completed");
  }

  const completedTask = await markTaskAsCompletedDb(taskId, currentUser.id);
  return completedTask;
};

export const createTaskNote = async (
  currentUser,
  taskId,
  text,
  isPositive = true,
) => {
  if (!taskId || taskId.trim() === "") {
    throwError(400, "Task ID is required");
  }

  if (!text || text.trim() === "") {
    throwError(400, "Note text is required");
  }

  const task = await getTaskByIdDb(taskId);
  if (!task) {
    throwError(404, "Task not found");
  }

  const hasAccess = await hasAccessToView(currentUser.id, task.id);
  if (!hasAccess) {
    throwError(403, "You don't have permission to add notes to this task!");
  }

  const note = await createNoteDb(
    taskId,
    currentUser.id,
    text.trim(),
    isPositive,
  );

  await incrementUserStat(currentUser.id, "reviewsGiven");
  return note;
};

export const getTaskNotes = async (currentUser, taskId) => {
  if (!taskId || taskId.trim() === "") {
    throwError(400, "Task ID is required");
  }

  const task = await getTaskByIdDb(taskId);
  if (!task) {
    throwError(404, "Task not found");
  }

  const hasAccess = await hasAccessToView(currentUser.id, task.id);
  if (!hasAccess) {
    throwError(403, "You don't have permission to view notes for this task");
  }

  const notes = await getTaskNotesDb(taskId);
  return notes;
};

export const deleteTaskNote = async (currentUser, taskId, noteId) => {
  if (!taskId || taskId.trim() === "") {
    throwError(400, "Task ID is required");
  }

  if (!noteId || noteId.trim() === "") {
    throwError(400, "Note ID is required");
  }

  const task = await getTaskByIdDb(taskId);
  if (!task) {
    throwError(404, "Task not found");
  }

  if (task.creatorId !== currentUser.id) {
    throwError(403, "Only the task owner can delete notes");
  }

  const result = await deleteNoteDb(noteId);
  return result;
};

export const createObjective = async (
  currentUser,
  taskId,
  objective,
  taskGoal,
  period,
) => {
  if (!taskId || taskId.trim() === "") {
    throwError(400, "Task ID is required");
  }

  if (!objective || objective.trim() === "") {
    throwError(400, "Objective is required");
  }

  const task = await getTaskByIdDb(taskId);
  if (!task) {
    throwError(404, "Task not found");
  }

  const isOwner = task.creatorId === currentUser.id;
  if (!isOwner) {
    throwError(403, "You are not the owner of this task");
  }

  const objectiveCreated = await createObjectiveDb(
    taskId,
    objective,
    taskGoal,
    period,
  );
  return objectiveCreated;
};

export const getObjectives = async (currentUser, taskId) => {
  if (!taskId || taskId.trim() === "") {
    throwError(400, "Task ID is required");
  }

  const task = await getTaskByIdDb(taskId);
  if (!task) {
    throwError(404, "Task not found");
  }

  const hasAccess = await hasAccessToEdit(currentUser.id, task.id);
  if (!hasAccess) {
    throwError(
      403,
      "You don't have permission to view objectives for this task",
    );
  }

  const objectives = await getObjectivesDb(taskId);
  return objectives;
};

export const deleteObjective = async (currentUser, taskId, objectiveId) => {
  if (!taskId || taskId.trim() === "") {
    throwError(400, "Task ID is required");
  }

  const task = await getTaskByIdDb(taskId);
  if (!task) {
    throwError(404, "Task not found");
  }

  const isOwner = task.creatorId === currentUser.id;
  if (!isOwner) {
    throwError(
      403,
      "You don't have permission modify objectives for this task",
    );
  }

  const objectives = await deleteObjectiveDb(objectiveId);
  return objectives;
};

async function processTaskRecurrence(taskId, parentId = null) {
  if (!taskId || taskId.trim() === "") {
    throwError(400, "Task ID is required");
  }

  const task = await getTaskByIdDb(taskId);
  if (!task) {
    throwError(404, "Task not found");
  }

  if (!parentId && task.recurrenceType == "PARENT") {
    return;
  }

  let parentTask = null;
  if (parentId || task.parentTaskId) {
    parentTask = await getTaskByIdDb(parentId || task.parentTaskId);
  }

  if (task.recurrenceType) {
    const recurrenceOptions = calculateRecurrenceOptions(
      task.recurrenceType == "PARENT"
        ? parentTask.recurrenceType
        : task.recurrenceType,
      task.recurrenceType == "PARENT"
        ? parentTask.recurrenceExpiresAt
        : task.recurrenceExpiresAt,
      task.recurrenceType == "PARENT"
        ? parentTask.recurrences
        : task.recurrences,
    );

    const newDeadline = calculateNextDeadline(
      task.deadline,
      task.recurrenceType == "PARENT"
        ? parentTask.recurrenceType
        : task.recurrenceType,
      task.recurrenceType == "PARENT"
        ? parentTask.recurrenceExpiresAt
        : task.recurrenceExpiresAt,
    );

    const taskRecurrence = await createTaskDb(
      task.creatorId,
      task.title,
      task.description,
      newDeadline,
      parentId || task.parentTaskId,
      recurrenceOptions.recurrenceType,
      recurrenceOptions.recurrenceExpiresAt,
      recurrenceOptions.recurrences,
    );

    const assignments = await getTaskAssignments(task.id);
    const subscriptions = await getTaskSubscriptions(task.id);

    for (const assignment of assignments) {
      await createAssignment(
        taskRecurrence.id,
        assignment.userId,
        assignment.role,
      );
    }

    for (const subscription of subscriptions) {
      await createSubscription(
        taskRecurrence.id,
        subscription.userId,
        subscription.role,
      );
    }

    for (const subTask of task.subTasks) {
      processTaskRecurrence(subTask.id, taskRecurrence.id);
    }

    return taskRecurrence;
  }
}
