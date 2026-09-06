import express from 'express';

import {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject
} from '../controllers/projectController.js';
import auth from '../middlewares/authMiddleware.js';

// PROJECT ROUTES — maps each URL/verb to a controller function.
// Mounted at /projects (see main.js). All protected by the auth middleware.

const router = express.Router();

// POST   /projects        -> createProject
router.post('/', auth, createProject);

// GET    /projects        -> getAllProjects
router.get('/', auth, getAllProjects);

// GET    /projects/:id    -> getProjectById
router.get('/:id', auth, getProjectById);

// PUT    /projects/:id    -> updateProject
router.put('/:id', auth, updateProject);

// DELETE /projects/:id    -> deleteProject
router.delete('/:id', auth, deleteProject);

export default router;
