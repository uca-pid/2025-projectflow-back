import { throwError } from "./errorHandler.js";
import {
  getAllUsers as getAllUsersDb,
  updateUser as updateUserDb,
  getUserById as getUserByIdDb,
  deleteUser as deleteUserDb,
} from "./databaseService.js";

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
