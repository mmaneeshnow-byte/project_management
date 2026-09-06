import express from 'express';

import {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
} from '../controllers/userController.js';
import auth from '../middlewares/authMiddleware.js';

// USER ROUTES — maps each URL/verb to a controller function.
// This router is mounted at /users (see main.js), so these paths are relative.

const router = express.Router();

// The 'auth' middleware runs BEFORE the controller on every route.
// It verifies the JWT token; if missing/invalid, the request is rejected (401)
// and the controller never runs. This protects all user operations.

// POST   /users        -> createUser
router.post('/', auth, createUser);

// GET    /users        -> getAllUsers
router.get('/', auth, getAllUsers);

// GET    /users/:id    -> getUserById   (:id is a URL parameter)
router.get('/:id', auth, getUserById);

// PUT    /users/:id    -> updateUser
router.put('/:id', auth, updateUser);

// DELETE /users/:id    -> deleteUser
router.delete('/:id', auth, deleteUser);

export default router;
