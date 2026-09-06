import * as userService from '../services/userService.js';
import mongoose from 'mongoose';
import User from '../models/userModel.js';
import Audit from '../models/auditModel.js';

// USER CONTROLLERS — the "request/response" layer.
// Each function receives the HTTP request (req) and response (res).
// It delegates the actual work to the service layer, checks results,
// and sends back an HTTP response with the right status code.

// POST /users — create a user
export async function createUser(req, res) {
    try {
        // req.body holds the JSON sent by the client.
        const user = await userService.createUser(req.body);

        // AUDIT — record the CREATE action.
        try {
            await Audit.create({
                action: 'CREATE',
                targetCollection: 'users',
                to: user.toObject(),
                createdBy: req.user.userId,
                updatedBy: req.user.userId
            });
        } catch (auditErr) {
            console.error('Audit write failed:', auditErr.message);
        }

        res.status(201).json(user); // 201 = resource created

    } catch (err) {
        // A ValidationError (missing/invalid field) or a duplicate email
        // (code 11000) is a client problem -> 400 Bad Request.
        if (
            err.name === 'ValidationError' ||
            err.code === 11000
        ) {
            return res.status(400).json({
                message: err.message
            });
        }

        // Anything else is a server/database problem -> 500.
        res.status(500).json({
            message: 'Database error',
            error: err.message
        });
    }
}

// GET /users — get all users
export async function getAllUsers(req, res) {
    try {
        const users = await userService.getAllUsers();

        res.json(users);

    } catch (err) {
        res.status(500).json({
            message: 'Database error',
            error: err.message
        });
    }
}

// GET /users/:id — get one user by id
export async function getUserById(req, res) {
    try {
        // Validate the incoming id is a proper MongoDB ObjectId.
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: 'That is not a valid id'
            });
        }

        const user = await userService.getUserById(req.params.id);

        // No user matched that id -> 404 Not Found.
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.json(user);

    } catch (err) {
        res.status(500).json({
            message: 'Database error',
            error: err.message
        });
    }
}

// PUT /users/:id — update a user
export async function updateUser(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: 'That is not a valid id'
            });
        }

        // Snapshot the BEFORE state so the audit shows what changed.
        const before = await User.findById(req.params.id).lean();

        const user = await userService.updateUser(
            req.params.id,
            req.body
        );

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // AUDIT — record the UPDATE action.
        try {
            await Audit.create({
                action: 'UPDATE',
                targetCollection: 'users',
                from: before ?? { _id: req.params.id },
                to: user.toObject(),
                createdBy: before?.createdBy ?? req.user.userId,
                updatedBy: req.user.userId
            });
        } catch (auditErr) {
            console.error('Audit write failed:', auditErr.message);
        }

        res.json(user);

    } catch (err) {
        res.status(500).json({
            message: 'Database error',
            error: err.message
        });
    }
}

// DELETE /users/:id — delete a user
export async function deleteUser(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: 'That is not a valid id'
            });
        }

        const user = await userService.deleteUser(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // AUDIT — record the DELETE action.
        try {
            await Audit.create({
                action: 'DELETE',
                targetCollection: 'users',
                from: user.toObject(),
                to: null,
                createdBy: user.createdBy ?? req.user.userId,
                updatedBy: req.user.userId
            });
        } catch (auditErr) {
            console.error('Audit write failed:', auditErr.message);
        }

        res.json({
            message: 'User deleted',
            user: user
        });

    } catch (err) {
        res.status(500).json({
            message: 'Database error',
            error: err.message
        });
    }
}
