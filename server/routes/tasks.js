const express = require("express");
const Task = require("../models/Task");
const Project = require("../models/Project");
const auth = require("../middleware/auth");
const validateFields = require("../middleware/validateFields");
const router = express.Router();

// Create a task
router.post(
  "/",
  auth,
  validateFields(["title", "project"]),
  async (req, res, next) => {
    try {
      const { title, description, project, status } = req.body;
      // Allow any user to create a task for any existing project
      const projectExists = await Project.findById(project);
      if (!projectExists)
        return res.status(404).json({ message: "Project not found" });
      const task = new Task({
        title,
        description,
        status: status || "To Do",
        project,
        user: req.user.userId,
      });
      await task.save();
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  }
);

// Get all tasks for a project
router.get("/project/:projectId", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.json([]); // Return empty array if project not found
    // Populate user field to get user name and email
    const tasks = await Task.find({ project: req.params.projectId }).populate(
      "user",
      "name email role"
    );
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all tasks for the authenticated user
router.get("/", auth, async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user.userId });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// Update a task
router.put("/:id", auth, async (req, res, next) => {
  try {
    const { title, description, status } = req.body;
    let update = { title, description };
    if (status) {
      update.status = status;
      if (status === "Completed") {
        update.completedAt = new Date();
      } else {
        update.completedAt = null;
      }
    }
    // Allow any user to update any task by id
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    next(error);
  }
});

// Delete a task
router.delete("/:id", auth, async (req, res) => {
  try {
    // Allow any user to delete any task by id
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Toggle task status (cycle through statuses)
router.patch("/:id/toggle", auth, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    const statuses = ["To Do", "Doing", "Testing", "Completed"];
    let idx = statuses.indexOf(task.status);
    idx = (idx + 1) % statuses.length;
    task.status = statuses[idx];
    if (task.status === "Completed") {
      task.completedAt = new Date();
    } else {
      task.completedAt = null;
    }
    await task.save();
    res.json(task);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
