const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole'); // Add role middleware
const validateFields = require('../middleware/validateFields');
const router = express.Router();

// Create a project
router.post('/', auth, requireRole(['admin', 'manager']), validateFields(['title']), async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const project = new Project({ title, description, user: req.user.userId });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

// Get all projects for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user.userId });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a project
router.put('/:id', auth, requireRole(['admin', 'manager']), validateFields(['title']), async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { title, description },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    next(error);
  }
});

// Delete a project
router.delete('/:id', auth, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    await Task.deleteMany({ project: req.params.id }); // Delete associated tasks
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get project progress (percentage of completed tasks)
router.get('/:id/progress', auth, async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user.userId });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const tasks = await require('../models/Task').find({ project: req.params.id });
    if (tasks.length === 0) return res.json({ progress: 0 });
    const completed = tasks.filter(t => t.completed).length;
    const percent = Math.round((completed / tasks.length) * 100);
    res.json({ progress: percent });
  } catch (error) {
    next(error);
  }
});

// Get all projects with users and their tasks (admin only)
router.get('/with-users-tasks', auth, requireRole(['admin']), async (req, res) => {
  try {
    // Get all projects
    const projects = await Project.find();
    // For each project, get all tasks and populate user
    const projectsWithTasks = await Promise.all(projects.map(async (project) => {
      const tasks = await Task.find({ project: project._id }).populate('user', 'name email role');
      return {
        ...project.toObject(),
        tasks
      };
    }));
    res.json(projectsWithTasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;