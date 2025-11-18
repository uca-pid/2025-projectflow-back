import prisma from "../databaseService.js";

export async function createNote(taskId, userId, text, isPositive = true) {
  const note = await prisma.note.create({
    data: {
      taskId,
      userId,
      text,
      isPositive,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
  return note;
}

export async function getTaskNotes(taskId) {
  const notes = await prisma.note.findMany({
    where: { taskId },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return notes;
}

export async function deleteNote(noteId) {
  const result = await prisma.note.delete({
    where: { id: noteId },
  });
  return result;
}
