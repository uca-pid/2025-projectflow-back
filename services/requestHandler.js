import { throwError } from "./errorHandler.js";
import { getAllUsers as getAllUsersDb } from "./databaseService.js";

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
