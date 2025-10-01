import express from "express";
import { auth } from "../auth.js";
import { fromNodeHeaders } from "better-auth/node";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getUsersForAssignment,
  assignUserToTask,
  unassignUserFromTask,
} from "../services/requestHandler.js";

// Middleware Function to protect routes
const authUser = async (req, res, next) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session || !session.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  req.user = session.user; // Set req.user for your routes
  next();
};

const router = express.Router();
router.use(express.json());

// GET /task - Get all tasks for the authenticated user
router.get("/getTasks", authUser, async (req, res) => {
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
router.get("/users", authUser, async (req, res) => {
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
router.post("/create", authUser, async (req, res) => {
  try {
    const { title, description, deadline, assignedUserIds } = req.body;

    if (!title) {
      return res
        .status(400)
        .json({ success: false, message: "Title is required" });
    }

    // No parentTaskId for main tasks
    const task = await createTask(req.user, title, description, deadline, null, assignedUserIds);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
});

// POST /task/:id/create - Create a subtask of task with :id
router.post("/:id/create", authUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, deadline, assignedUserIds } = req.body;

    if (!title) {
      return res
        .status(400)
        .json({ success: false, message: "Title is required" });
    }

    const parentTaskId = parseInt(id);
    if (isNaN(parentTaskId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid parent task ID" });
    }

    const subtask = await createTask(req.user, title, description, deadline, parentTaskId, assignedUserIds);
    res.status(201).json({ success: true, data: subtask });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
});


router.post("/:id/assign/:userId", authUser, async (req, res) => {
  try {
    const { id, userId } = req.params;
    
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid task ID" });
    }

    const result = await assignUserToTask(req.user, taskId, userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
});

// POST /task/:id/unassign/:userId - Unassign user from task
router.post("/:id/unassign/:userId", authUser, async (req, res) => {
  try {
    const { id, userId } = req.params;
    
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid task ID" });
    }

    const result = await unassignUserFromTask(req.user, taskId, userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
});

// PUT /task/:id - Update a task
router.put("/:id", authUser, async (req, res) => {
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
router.delete("/:id", authUser, async (req, res) => {
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

