import { validateAuthorization } from "../services/validationService.js";
import express from "express";
import {
  getUserTasks,
  getAssignedTasks,
  getTrackedTasks,
  createTask,
  updateTask,
  deleteTask,
  cloneTask,
  getTaskById,
  createTaskNote,
  getTaskNotes,
  deleteTaskNote,
  createObjective,
  getObjectives,
  deleteObjective,
} from "../services/handlers/taskHandler.js";

import {
  applyToTask,
  acceptUserApplication,
  rejectUserApplication,
  inviteUserToTask,
  acceptTaskInvitation,
  rejectTaskInvitation,
  unlinkUserFromTask,
  getTaskApplications,
  getTaskAssignments,
  getTaskSubscriptions,
} from "../services/handlers/accessHandler.js";

const router = express.Router();
router.use(express.json());

// GET /task/getOwned - Get all tasks for the authenticated user
router.get("/getOwned", validateAuthorization, async (req, res) => {
  try {
    const tasks = await getUserTasks(req.user);
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    console.log(error);
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
});

// GET /task/getAssigned - Get all tasks assigned to the authenticated user
router.get("/getAssigned", validateAuthorization, async (req, res) => {
  try {
    const tasks = await getAssignedTasks(req.user);
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    console.log(error);
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
});

// GET /task/getSubscribed - Get all tasks tracked by the authenticated user
router.get("/getSubscribed", validateAuthorization, async (req, res) => {
  try {
    const tasks = await getTrackedTasks(req.user);
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    console.log(error);
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
});

// POST /task/create - Create a new main task (not a subTask)
router.post("/create", validateAuthorization, async (req, res) => {
  try {
    const { title, description, deadline } = req.body;

    const task = await createTask(req.user, title, description, deadline, null);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    console.log(error);
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
});

// POST /task/:id/create - Create a subTask of task with :id
router.post("/:id/create", validateAuthorization, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, deadline } = req.body;
    const subTask = await createTask(
      req.user,
      title,
      description,
      deadline,
      id,
    );
    res.status(201).json({ success: true, data: subTask });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
});

// POST /task/:id/clone - Clone a public task
router.post("/:id/clone", validateAuthorization, async (req, res) => {
  try {
    const { id } = req.params;
    const task = await cloneTask(req.user, id, null);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
});

// POST /task/:id/unlink/:userId - Unlink user from task
router.post(
  "/:id/unassign/:userId",
  validateAuthorization,
  async (req, res) => {
    try {
      const { id, userId } = req.params;

      const result = await unlinkUserFromTask(req.user, id, userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.log(error);
      res
        .status(error.status || 500)
        .json({ success: false, message: error.message });
    }
  },
);

// ---- Applications ----

router.post("/:id/apply", validateAuthorization, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await applyToTask(req.user, id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.log(error);
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
});

router.post(
  "/:taskId/acceptApplication/:userId",
  validateAuthorization,
  async (req, res) => {
    try {
      const { taskId, userId } = req.params;

      const result = await acceptUserApplication(req.user, taskId, userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res
        .status(error.status || 500)
        .json({ success: false, message: error.message });
    }
  },
);

router.post(
  "/:taskId/rejectApplication/:userId",
  validateAuthorization,
  async (req, res) => {
    try {
      const { taskId, userId } = req.params;

      const result = await rejectUserApplication(req.user, taskId, userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.log(error);
      res
        .status(error.status || 500)
        .json({ success: false, message: error.message });
    }
  },
);

// ---- Invites ----
router.post(
  "/:id/invite" /*email in body*/,
  validateAuthorization,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { email } = req.body;
      const invitation = await inviteUserToTask(req.user, id, email);
      res.status(200).json({ success: true, data: invitation });
    } catch (error) {
      console.log(error);
      res
        .status(error.statusCode || 500)
        .json({ success: false, message: error.message });
    }
  },
);

// POST /task/taskId/acceptInvitation
router.post(
  "/:taskId/acceptInvitation",
  validateAuthorization,
  async (req, res) => {
    try {
      const { taskId } = req.params;
      const result = await acceptTaskInvitation(req.user, taskId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.log(error);
      res
        .status(error.status || 500)
        .json({ success: false, message: error.message });
    }
  },
);

// POST /task/taskId/rejectInvitation
router.post(
  "/:taskId/rejectInvitation",
  validateAuthorization,
  async (req, res) => {
    try {
      const { taskId } = req.params;
      const result = await rejectTaskInvitation(req.user, taskId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.log(error);
      res
        .status(error.status || 500)
        .json({ success: false, message: error.message });
    }
  },
);

// GET/task/:id - Get task by id
router.get("/:id", validateAuthorization, async (req, res) => {
  try {
    const { id } = req.params;

    const task = await getTaskById(req.user, id);

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
});

router.get("/:taskId/assigned", validateAuthorization, async (req, res) => {
  try {
    const { taskId } = req.params;

    const assignments = await getTaskAssignments(req.user, taskId);
    const assignedUsers = assignments.map((assignment) => assignment.user);

    res.status(200).json({ success: true, data: assignedUsers });
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
});

router.get("/:taskId/subscribed", validateAuthorization, async (req, res) => {
  try {
    const { taskId } = req.params;

    const subscriptions = await getTaskSubscriptions(req.user, taskId);
    const subscribedUsers = subscriptions.map(
      (subscription) => subscription.user,
    );

    res.status(200).json({ success: true, data: subscribedUsers });
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
});

router.get("/:taskId/applied", validateAuthorization, async (req, res) => {
  try {
    const { taskId } = req.params;

    const applications = await getTaskApplications(req.user, taskId);
    const appliedUsers = applications.map((application) => application.user);

    res.status(200).json({ success: true, data: appliedUsers });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
});

// PUT /task/:id - Update a task
router.put("/:id", validateAuthorization, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, deadline, status, isPublic } = req.body;
    const task = await updateTask(
      req.user,
      id,
      title,
      description,
      deadline,
      status,
      isPublic,
    );
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
});

// DELETE /task/:id - Delete a task
router.delete("/:id", validateAuthorization, async (req, res) => {
  try {
    const { id } = req.params;

    await deleteTask(req.user, id);
    res
      .status(200)
      .json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
});

router.post("/:id/notes", validateAuthorization, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, isPositive } = req.body;
    const note = await createTaskNote(req.user, id, text, isPositive);
    res.status(201).json({
      success: true,
      data: note,
      message: "Note created successfully",
    });
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
});

router.get("/:id/notes", validateAuthorization, async (req, res) => {
  try {
    const { id } = req.params;
    const notes = await getTaskNotes(req.user, id);
    res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
});

router.delete("/:id/notes/:noteId", validateAuthorization, async (req, res) => {
  try {
    const { id, noteId } = req.params;
    await deleteTaskNote(req.user, id, noteId);
    res.status(200).json({
      success: true,
      message: "Note deleted successfully, See you!",
    });
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
});

router.post("/:id/objectives", validateAuthorization, async (req, res) => {
  try {
    const { id } = req.params;
    const { objective, taskGoal, period } = req.body;
    const objectiveDb = await createObjective(
      req.user,
      id,
      objective,
      taskGoal,
      period,
    );
    res.status(201).json({
      success: true,
      data: objectiveDb,
      message: "Objective created successfully",
    });
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
});

router.get("/:id/objectives", validateAuthorization, async (req, res) => {
  try {
    const { id } = req.params;
    const objectives = await getObjectives(req.user, id);
    res.status(200).json({
      success: true,
      data: objectives,
    });
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
});

router.delete(
  "/:id/objectives/:objectiveId",
  validateAuthorization,
  async (req, res) => {
    try {
      const { id, objectiveId } = req.params;
      const objective = await deleteObjective(req.user, id, objectiveId);
      res.status(200).json({
        success: true,
        data: objective,
      });
    } catch (error) {
      console.log(error);
      res
        .status(error.statusCode || 500)
        .json({ success: false, message: error.message });
    }
  },
);

export default router;
