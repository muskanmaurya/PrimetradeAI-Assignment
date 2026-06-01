const express = require('express');
const { body } = require('express-validator');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

const taskCreateValidation = [
  body('title').trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim(),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be pending, in-progress, or completed'),
];

const taskUpdateValidation = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim(),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be pending, in-progress, or completed'),
];

// In Postman, pass JWTs as:
// Authorization: Bearer {{token}}
router.use(protect);

router
  .route('/')
  .post(authorize('user', 'admin'), taskCreateValidation, validateRequest, createTask)
  .get(getTasks);

router
  .route('/:id')
  .get(getTaskById)
  .put(taskUpdateValidation, validateRequest, updateTask)
  .delete(deleteTask);

module.exports = router;
