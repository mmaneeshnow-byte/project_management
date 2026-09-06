import express from 'express';

import {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask
} from '../controllers/taskController.js';
import auth from '../middlewares/authMiddleware.js';

// TASK ROUTES — maps each URL/verb to a controller function.
// Mounted at /tasks (see main.js). All protected by the auth middleware.

const router = express.Router();

// POST   /tasks        -> createTask
router.post('/', auth, createTask);

// GET    /tasks        -> getAllTasks
router.get('/', auth, getAllTasks);

// GET    /tasks/:id    -> getTaskById
router.get('/:id', auth, getTaskById);

// PUT    /tasks/:id    -> updateTask
router.put('/:id', auth, updateTask);

// DELETE /tasks/:id    -> deleteTask
router.delete('/:id', auth, deleteTask);

export default router;
