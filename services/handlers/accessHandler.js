import {
  createApplication,
  createAssignment,
  createSubscription,
  createInvitation,
  deleteApplication,
  deleteInvitation,
  unlinkUserFromTask as unlinkUserFromTaskDb,
  hasAccessToEdit,
  hasAccessToView,
  hasAppliedToTask,
  hasBeenInvitedToTask,
  getTaskApplications as getTaskApplicationsDb,
  getTaskAssignments as getTaskAssignmentsDb,
  getTaskSubscriptions as getTaskSubscriptionsDb,
} from "../repositories/accessRepository.js";

import { throwError } from "../errorHandler.js";

import {
  getUserById as getUserByIdDb,
  getUserByEmail,
} from "../repositories/userRepository.js";

import { getTaskById as getTaskByIdDb } from "../repositories/taskRepository.js";

// ---- Applications ----

export const applyToTask = async (currentUser, taskId) => {
  if (!taskId || taskId.trim() === "") {
    throwError(400, "Task ID is required");
  }

  const task = await getTaskByIdDb(taskId);
  if (!task) {
    throwError(404, "Task not found");
  }

  const isAlreadyAssigned =
    (await hasAccessToEdit(currentUser.id, taskId)) ||
    (await hasAccessToView(currentUser.id, taskId));
  if (isAlreadyAssigned) {
    throwError(409, "User is already assigned to this task");
  }

  const isApplied = await hasAppliedToTask(currentUser.id, taskId);
  if (isApplied) {
    throwError(409, "You have already applied to this task");
  }

  const result = await createApplication(currentUser.id, taskId);
  return result;
};

export const acceptUserApplication = async (currentUser, taskId, userId) => {
  if (!taskId || taskId.trim() === "") {
    throwError(400, "Task ID is required");
  }
  if (!userId || userId.trim() === "") {
    throwError(400, "User ID is required");
  }

  const task = await getTaskByIdDb(taskId);
  const userToAssign = await getUserByIdDb(userId);
  if (!task) {
    throwError(404, "Task not found");
  }
  if (!userToAssign) {
    throwError(404, "User not found");
  }

  if (!(await hasAccessToEdit(currentUser.id, task.id))) {
    throwError(403, "No access to this task");
  }

  const application = await hasAppliedToTask(userId, taskId);
  if (!application) {
    throwError(400, "User has not applied to this task");
  }

  const isAlreadyAssigned =
    (await hasAccessToEdit(userId, taskId)) ||
    (await hasAccessToView(userId, taskId));
  if (isAlreadyAssigned) {
    throwError(409, "User is already assigned to this task");
  }

  await deleteApplication(userId, taskId);
  return await createSubscription(taskId, userId);
};

export const rejectUserApplication = async (currentUser, taskId, userId) => {
  if (!taskId || taskId.trim() === "") {
    throwError(400, "Task ID is required");
  }

  if (!userId || userId.trim() === "") {
    throwError(400, "User ID is required");
  }

  const task = await getTaskByIdDb(taskId);
  if (!task) {
    throwError(404, "Task not found");
  }

  const user = await getUserByIdDb(userId);
  if (!user) {
    throwError(404, "User not found");
  }

  const isOwner = task.creatorId === currentUser.id;
  if (!isOwner) {
    throwError(403, "You are not the owner of this task");
  }

  return await deleteApplication(userId, taskId);
};

export const getTaskApplications = async (currentUser, taskId) => {
  if (!taskId || taskId.trim() === "") {
    throwError(400, "Task ID is required");
  }

  const task = await getTaskByIdDb(taskId);
  if (!task) {
    throwError(404, "Task not found");
  }

  const isOwner = task.creatorId === currentUser.id;
  if (!isOwner) {
    throwError(403, "You are not the owner of this task");
  }

  return await getTaskApplicationsDb(taskId);
};

// ---- Invitations ----

export const inviteUserToTask = async (currentUser, taskId, email) => {
  if (!taskId || !email) {
    throwError(400, "Task ID and email are required");
  }

  const task = await getTaskByIdDb(taskId);
  if (!task) {
    throwError(404, "Task not found");
  }

  if (task.creatorId !== currentUser.id) {
    throwError(403, "Only task creator can invite users");
  }

  const userToInvite = await getUserByEmail(email);
  if (!userToInvite) {
    throwError(404, "User with this email not found");
  }

  const alreadyInvited = await hasBeenInvitedToTask(userToInvite.id, taskId);
  if (alreadyInvited) {
    throwError(409, "User is already invited to this task");
  }
  console.log("alreadyInvited", alreadyInvited);
  const alreadyAssigned = await hasAccessToEdit(userToInvite.id, taskId);
  console.log("alreadyAssigned", alreadyAssigned);
  if (alreadyAssigned) {
    throwError(409, "User is already assigned to this task");
  }

  const invitation = await createInvitation(
    taskId,
    currentUser.id,
    userToInvite.id,
  );
  return invitation;
};

export const rejectTaskInvitation = async (currentUser, taskId) => {
  if (!taskId || taskId.trim() === "") {
    throwError(400, "Task ID is required");
  }
  const task = await getTaskByIdDb(taskId);

  if (!task) {
    throwError(404, "Task not found");
  }

  const isInvited = await hasBeenInvitedToTask(currentUser.id, taskId);

  if (!isInvited) {
    throwError(403, "You are not invited to this task");
  }

  const result = await deleteInvitation(currentUser.id, taskId);
  return result;
};

export const acceptTaskInvitation = async (currentUser, taskId) => {
  if (!taskId || taskId.trim() === "") {
    throwError(400, "Task ID is required");
  }
  const task = await getTaskByIdDb(taskId);

  if (!task) {
    throwError(404, "Task not found");
  }

  const isInvited = await hasBeenInvitedToTask(currentUser.id, taskId);

  if (!isInvited) {
    throwError(403, "You are not invited to this task");
  }

  await deleteInvitation(currentUser.id, taskId);
  const result = await createAssignment(taskId, currentUser.id);
  return result;
};

// This works both for viewers and asigned users
export const unlinkUserFromTask = async (currentUser, taskId, userId) => {
  if (!taskId || taskId.trim() === "") {
    throwError(400, "Task ID is required");
  }
  if (!userId || userId.trim() === "") {
    throwError(400, "User ID is required");
  }

  const task = await getTaskByIdDb(taskId);
  if (!task) {
    throwError(404, "Task not found");
  }

  const user = await getUserByIdDb(userId);
  if (!user) {
    throwError(404, "User not found");
  }

  if (!task.creatorId === currentUser.id) {
    throwError(403, "No access to unassign users");
  }

  if (task.creatorId === userId) {
    throwError(403, "Cannot unassign yourself");
  }

  const isAssigned =
    (await hasAccessToEdit(userId, taskId)) ||
    (await hasAccessToView(userId, taskId));
  if (!isAssigned) {
    throwError(403, "User is not assigned to this task");
  }

  const result = await unlinkUserFromTaskDb(taskId, userId);
  return result;
};

// ---- Getting stuff ----
export const getTaskAssignments = async (currentUser, taskId) => {
  if (!taskId || taskId.trim() === "") {
    throwError(400, "Task ID is required");
  }

  const task = await getTaskByIdDb(taskId);
  if (!task) {
    throwError(404, "Task not found");
  }

  const hasAccess = await hasAccessToView(currentUser.id, task.id);
  if (!hasAccess) {
    throwError(403, "You don't have permission to view this task");
  }

  return await getTaskAssignmentsDb(taskId);
};

export const getTaskSubscriptions = async (currentUser, taskId) => {
  console.log("Handler - taskId:", taskId); // Add this

  if (!taskId || taskId.trim() === "") {
    throwError(400, "Task ID is required");
  }
  console.log("Passed input validation");

  const task = await getTaskByIdDb(taskId);
  if (!task) {
    throwError(404, "Task not found");
  }
  console.log("Found task in db");

  const hasAccess = await hasAccessToView(currentUser.id, taskId);
  if (!hasAccess) {
    throwError(403, "You don't have permission to view this task");
  }
  console.log("Has access to view task");

  console.log("About to call getTaskSubscriptionsDb with:", taskId); // Add this
  return await getTaskSubscriptionsDb(taskId);
};
