import { validateAuthorization } from "../services/validationService.js";
import express from "express";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getUsersForAssignment,
  assignUserToTask,
  unassignUserFromTask,
  getTaskById,
  applyUserToTask,
} from "../services/requestHandler.js";

const router = express.Router();
router.use(express.json());

// GET /task - Get all tasks for the authenticated user
router.get("/getTasks", validateAuthorization, async (req, res) => {
  try {
    const tasks = await getTasks(req.user);
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    console.log(error);
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
});

// GET /task/users - Get all users for task assignment
router.get("/users", validateAuthorization, async (req, res) => {
  try {
    const users = await getUsersForAssignment(req.user);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.log(error);
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
});

// POST /task/create - Create a new main task (not a subtask)
router.post("/create", validateAuthorization, async (req, res) => {
  try {
    const { title, description, deadline, assignedUserIds } = req.body;

    // No parentTaskId for main tasks
    const task = await createTask(
      req.user,
      title,
      description,
      deadline,
      null,
      assignedUserIds,
    );
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
});

// POST /task/:id/create - Create a subtask of task with :id
router.post("/:id/create", validateAuthorization, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, deadline, assignedUserIds } = req.body;

    const subtask = await createTask(
      req.user,
      title,
      description,
      deadline,
      id, // parentTaskId es ahora string
      assignedUserIds,
    );
    res.status(201).json({ success: true, data: subtask });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
});

router.post("/:id/assign/:userId", validateAuthorization, async (req, res) => {
  try {
    const { id, userId } = req.params;

    const result = await assignUserToTask(req.user, id, userId);
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

// GET/task/:id - Get task by id
router.get("/:id", validateAuthorization, async (req, res) => {
  try {
    const { id } = req.params;

    const task = await getTaskById(req.user, id);

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    console.log(error);
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
});

// PUT /task/:id - Update a task
router.put("/:id", validateAuthorization, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, deadline, status } = req.body;

    const task = await updateTask(
      req.user,
      id,
      title,
      description,
      deadline,
      status,
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
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
});

export default router;
