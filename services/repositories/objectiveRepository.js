import prisma from "../databaseService.js";

export async function createObjective(taskId, objective, taskGoal, period) {
  const objectiveDb = await prisma.objective.create({
    data: {
      taskId,
      objective,
      taskGoal,
      period,
    },
  });

  return objectiveDb;
}

export async function getObjectives(taskId) {
  const objectives = await prisma.objective.findMany({
    where: { taskId },
  });
  return objectives;
}

export async function deleteObjective(objectiveId) {
  const result = await prisma.objective.delete({
    where: { objectiveId: objectiveId },
  });
  return result;
}
