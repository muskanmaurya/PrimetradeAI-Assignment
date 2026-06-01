const Task = require('../models/Task');

const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const canModifyTask = (task, user) => {
  return user.role === 'admin' || task.createdBy.toString() === user.id;
};

const createTask = async (req, res, next) => {
  try {
    const task = await Task.create({
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { createdBy: req.user.id };
    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return next(createError(404, 'Task not found'));
    }

    if (!canModifyTask(task, req.user)) {
      return next(createError(403, 'You can only view your own tasks'));
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return next(createError(404, 'Task not found'));
    }

    if (!canModifyTask(task, req.user)) {
      return next(createError(403, 'You can only update your own tasks'));
    }

    task.title = req.body.title !== undefined ? req.body.title : task.title;
    task.description = req.body.description !== undefined ? req.body.description : task.description;
    task.status = req.body.status !== undefined ? req.body.status : task.status;

    const updatedTask = await task.save();

    res.status(200).json({
      success: true,
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return next(createError(404, 'Task not found'));
    }

    if (!canModifyTask(task, req.user)) {
      return next(createError(403, 'You can only delete your own tasks'));
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
