import { throwError } from "../errorHandler.js";
import {
  getAllUsers as getAllUsersDb,
  updateUser as updateUserDb,
  getUserById as getUserByIdDb,
  deleteUser as deleteUserDb,
} from "../repositories/userRepository.js";

import { getUserInvites as getUserInvitesDb } from "../repositories/accessRepository.js";

export const getAllUsers = async (user) => {
  if (user.role !== "ADMIN") {
    throwError(403);
  }

  const users = await getAllUsersDb();
  return users;
};

export const getUserById = async (user, userId) => {
  if (!user) {
    throwError(401);
  }
  if (!userId || userId.trim() === "") {
    throwError(400, "User ID is required");
  }

  const userFound = await getUserByIdDb(userId.trim());
  if (!userFound) {
    throwError(404);
  }

  if (user.role !== "ADMIN" && userFound.id !== user.id) {
    return {
      id: userFound.id,
      email: userFound.email,
      name: userFound.name,
      image: userFound.image,
    };
  }
  return userFound;
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

export const getUserInvites = async (currentUser) => {
  const invites = await getUserInvitesDb(currentUser.id);
  return invites;
};

