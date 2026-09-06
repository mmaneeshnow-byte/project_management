import * as taskService from '../services/taskService.js';
import mongoose from 'mongoose';
import Task from '../models/taskModel.js';
import Audit from '../models/auditModel.js';

// TASK CONTROLLERS — the "request/response" layer.
// Receives HTTP requests, delegates work to the service, sends responses.

// POST /tasks — create a task
export async function createTask(req, res) {
    try {
        const task =
            await taskService.createTask(req.body);

        // AUDIT — record the CREATE action.
        try {
            await Audit.create({
                action: 'CREATE',
                targetCollection: 'tasks',
                to: task.toObject(),
                createdBy: req.user.userId,
                updatedBy: req.user.userId
            });
        } catch (auditErr) {
            console.error('Audit write failed:', auditErr.message);
        }

        res.status(201).json(task); // 201 = created

    } catch (err) {
        // Missing field or "project/user does not exist" (referential failure)
        // -> client problem, 400.
        if (
            err.name === 'ValidationError' ||
            err.message.includes('does not exist')
        ) {
            return res.status(400).json({
                message: err.message
            });
        }

        res.status(500).json({
            message: 'Database error',
            error: err.message
        });
    }
}

// GET /tasks — get all tasks (with project & user populated)
export async function getAllTasks(req, res) {
    try {
        const tasks =
            await taskService.getAllTasks();

        res.json(tasks);

    } catch (err) {
        res.status(500).json({
            message: 'Database error',
            error: err.message
        });
    }
}

// GET /tasks/:id — get one task by id
export async function getTaskById(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: 'That is not a valid id'
            });
        }

        const task =
            await taskService.getTaskById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: 'Task not found'
            });
        }

        res.json(task);

    } catch (err) {
        res.status(500).json({
            message: 'Database error',
            error: err.message
        });
    }
}

// PUT /tasks/:id — update a task
export async function updateTask(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: 'That is not a valid id'
            });
        }

        // Snapshot the BEFORE state so the audit shows what changed.
        const before = await Task.findById(req.params.id).lean();

        const task =
            await taskService.updateTask(
                req.params.id,
                req.body
            );

        if (!task) {
            return res.status(404).json({
                message: 'Task not found'
            });
        }

        // AUDIT — record the UPDATE action.
        try {
            await Audit.create({
                action: 'UPDATE',
                targetCollection: 'tasks',
                from: before ?? { _id: req.params.id },
                to: task.toObject(),
                createdBy: before?.createdBy ?? req.user.userId,
                updatedBy: req.user.userId
            });
        } catch (auditErr) {
            console.error('Audit write failed:', auditErr.message);
        }

        res.json(task);

    } catch (err) {
        if (
            err.name === 'ValidationError' ||
            err.message.includes('does not exist')
        ) {
            return res.status(400).json({
                message: err.message
            });
        }

        res.status(500).json({
            message: 'Database error',
            error: err.message
        });
    }
}

// DELETE /tasks/:id — delete a task
export async function deleteTask(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: 'That is not a valid id'
            });
        }

        const task =
            await taskService.deleteTask(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: 'Task not found'
            });
        }

        // AUDIT — record the DELETE action.
        try {
            await Audit.create({
                action: 'DELETE',
                targetCollection: 'tasks',
                from: task.toObject(),
                to: null,
                createdBy: task.createdBy ?? req.user.userId,
                updatedBy: req.user.userId
            });
        } catch (auditErr) {
            console.error('Audit write failed:', auditErr.message);
        }

        res.json({
            message: 'Task deleted',
            task: task
        });

    } catch (err) {
        res.status(500).json({
            message: 'Database error',
            error: err.message
        });
    }
}
