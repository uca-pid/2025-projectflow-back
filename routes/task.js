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
  assignUserToTask,
  unassignUserFromTask,
  getTaskById,
  applyUserToTask,
  rejectUserFromTask,
  inviteUserToTask,
  rejectInvite,
} from "../services/handlers/taskHandler.js";

const router = express.Router();
router.use(express.json());

// GET /task/getTasks - Get all tasks for the authenticated user
router.get("/getTasks", validateAuthorization, async (req, res) => {
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
router.get("/getAssignedTasks", validateAuthorization, async (req, res) => {
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

// GET /task/getTracked - Get all tasks assigned to the authenticated user
router.get("/getTrackedTasks", validateAuthorization, async (req, res) => {
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

    // No parentTaskId for main tasks
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

// POST /task/clone/:id - Clone a public task
router.post("/clone/:id", validateAuthorization, async (req, res) => {
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

router.post("/:id/assign/:userId", validateAuthorization, async (req, res) => {
  try {
    const { id, userId } = req.params;

    const result = await assignUserToTask(req.user, id, userId, "assignee");
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
});

router.post("/:id/allow/:userId", validateAuthorization, async (req, res) => {
  try {
    const { id, userId } = req.params;

    const result = await assignUserToTask(req.user, id, userId, "viewer");
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
});

// POST /task/:id/unassign/:userId - Unassign user from task
router.post(
  "/:id/unassign/:userId",
  validateAuthorization,
  async (req, res) => {
    try {
      const { id, userId } = req.params;

      const result = await unassignUserFromTask(req.user, id, userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.log(error);
      res
        .status(error.status || 500)
        .json({ success: false, message: error.message });
    }
  },
);

// POST /task/:id/apply - Apply to task
router.post("/:id/apply", validateAuthorization, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await applyUserToTask(req.user, id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.log(error);
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
});

// POST /task/:taskId/reject/:userId - Apply to task
router.post(
  "/:taskId/reject/:userId",
  validateAuthorization,
  async (req, res) => {
    try {
      const { taskId, userId } = req.params;

      const result = await rejectUserFromTask(req.user, taskId, userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.log(error);
      res
        .status(error.status || 500)
        .json({ success: false, message: error.message });
    }
  },
);

// POST /task/taskId/accept
router.post("/:taskId/accept", validateAuthorization, async (req, res) => {
  try {
    const { taskId } = req.params;
    const result = await assignUserToTask(
      req.user,
      taskId,
      req.user.id,
      "assignee",
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.log(error);
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
});

// POST /task/taskId/reject
router.post("/:taskId/reject", validateAuthorization, async (req, res) => {
  try {
    const { taskId } = req.params;
    const result = await rejectInvite(req.user, taskId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.log(error);
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
});

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
    console.log(error);
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

router.post("/:id/invite", validateAuthorization, async (req, res) => {
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
});

export default router;
