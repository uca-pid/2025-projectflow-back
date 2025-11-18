import prisma from "../databaseService.js";

export async function getAllUsers() {
  const users = await prisma.user.findMany();
  return users;
}

export async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id } });
  return user;
}

export async function getUserByEmail(email) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { invitations: true },
  });
  return user;
}

export async function updateUser(userToUpdate) {
  const updatedUser = await prisma.user.update({
    where: {
      id: userToUpdate.id,
    },
    data: userToUpdate,
  });

  await prisma.session.deleteMany({
    where: {
      userId: userToUpdate.id,
    },
  });

  return updatedUser;
}

export async function deleteUser(id) {
  const deletedUser = await prisma.user.delete({
    where: {
      id,
    },
  });
  return deletedUser;
}

export const isAdmin = (userId) => {
  const user = getUserById(userId);
  return user.role === "admin";
};
