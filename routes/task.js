import express from "express";
import { auth } from "../auth.js";
import { fromNodeHeaders } from "better-auth/node";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
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

// POST /task - Create a new task
router.post("/create", authUser, async (req, res) => {
  try {
    const { title, description, deadline } = req.body;

    if (!title) {
      return res
        .status(400)
        .json({ success: false, message: "Title is required" });
    }

    const task = await createTask(req.user, title, description, deadline);
    res.status(201).json({ success: true, data: task });
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

