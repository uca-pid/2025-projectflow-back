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
  getUserInvites as getUserInvitesDb,
  rejectInvite as rejectInviteDb,
  getUserByEmail,
  createInvitation,
} from "./databaseService.js";

const hasAccessToEdit = async (user, task) => {
  let currentTask = task;
  console.log("currentTask", currentTask.title);
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

const hasAccessToView = async (user, task) => {
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
  return false;
};

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
export const getUserTasks = async (user) => {
  const allTasks = await getAllTasks(user.id);
  const tasks = allTasks.filter((task) => task.creatorId === user.id);
  return tasks;
};

export const getAssignedTasks = async (user) => {
  const allTasks = await getAllTasks(user.id);
  const tasks = allTasks.filter(
    (task) =>
      task.assignedUsers.some((u) => u.id === user.id) &&
      task.creatorId !== user.id,
  );
  return tasks;
};

export const getTrackedTasks = async (user) => {
  const allTasks = await getAllTasks(user.id);
  const tasks = allTasks.filter((task) =>
    task.trackedUsers.some((u) => u.id === user.id),
  );
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

  if (!(await hasAccessToView(user, task))) {
    // Return limited info if no access
    return {
      id: task.id,
      title: task.title,
      isPublic: task.isPublic,
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

  let parentTask;
  if (parentTaskId) {
    parentTask = await getTaskByIdDb(parentTaskId);
    if (!parentTask) {
      throwError(404, "Parent task not found");
    }

    const access = await hasAccessToEdit(user, parentTask);
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
) => {
  const updateData = {};
  if (title) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (deadline) updateData.deadline = new Date(deadline);
  if (status) updateData.status = status;
  if (isPublic !== undefined) updateData.isPublic = isPublic === "true";

  const foundTask = await getTaskByIdDb(taskId);
  if (!foundTask) {
    throwError(404, "Task not found");
  }

  if (!(await hasAccessToEdit(user, foundTask))) {
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

  if (!(await hasAccessToEdit(user, task))) {
    throwError(403, "No access to this task");
  }

  const result = await deleteTaskDb(taskId);
  return result;
};

// Clone task
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

    if (!(await hasAccessToView(currentUser, task))) {
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

// Assign user to task
export const assignUserToTask = async (
  currentUser,
  taskId,
  userId,
  role = "viewer",
) => {
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

  const invited = task.invitations.some((i) => i.invitedId === currentUser.id);

  // Check if current user has access to task
  if (!(await hasAccessToEdit(currentUser, task)) && !invited) {
    throwError(403, "No access to this task");
  }

  // Check if user is already assigned
  const isAlreadyAssigned = task.assignedUsers.some((u) => u.id === userId);
  if (isAlreadyAssigned) {
    throwError(409, "User is already assigned to this task");
  }

  const type = invited ? "invite" : "assign";
  const result = await assignUserToTaskDb(taskId, userId, type, role);
  return result;
};

export const rejectInvite = async (currentUser, taskId) => {
  if (!taskId || taskId.trim() === "") {
    throwError(400, "Task ID is required");
  }
  const task = await getTaskByIdDb(taskId);

  if (!task) {
    throwError(404, "Task not found");
  }

  const invite = task.invitations.find((i) => i.invitedId === currentUser.id);

  if (!invite) {
    throwError(403, "You are not invited to this task");
  }

  const result = await rejectInviteDb(invite.invitationId);
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
  if (!(await hasAccessToEdit(currentUser, task))) {
    throwError(403, "No access to this task");
  }

  // Check if user is actually assigned
  const isAssigned =
    task.assignedUsers.some((u) => u.id === userId) ||
    task.trackedUsers.some((u) => u.id === userId);
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

// Simple invite to task function
export const inviteUserToTask = async (currentUser, taskId, email) => {
  if (!taskId || !email) {
    throwError(400, "Task ID and email are required");
  }

  // Check if task exists and user has permission
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

  if (userToInvite.invitations?.some((i) => i.taskId === taskId)) {
    throwError(409, "User already invited to this task");
  }

  const invitation = await createInvitation(
    taskId,
    currentUser.id,
    userToInvite.id,
  );
  return invitation;
};

export const getUserInvites = async (currentUser) => {
  const invites = await getUserInvitesDb(currentUser.id);
  return invites;
};
