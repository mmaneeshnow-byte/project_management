import * as projectService from '../services/projectService.js';
import mongoose from 'mongoose';
import Project from '../models/projectModel.js';
import Audit from '../models/auditModel.js';

// PROJECT CONTROLLERS — the "request/response" layer.
// Receives HTTP requests, delegates work to the service, sends responses.

// POST /projects — create a project
export async function createProject(req, res) {
    try {
        const project =
            await projectService.createProject(req.body);

        // AUDIT — record the CREATE action.
        try {
            await Audit.create({
                action: 'CREATE',
                targetCollection: 'projects',
                to: project.toObject(),
                createdBy: req.user.userId,
                updatedBy: req.user.userId
            });
        } catch (auditErr) {
            console.error('Audit write failed:', auditErr.message);
        }

        res.status(201).json(project); // 201 = created

    } catch (err) {
        // Missing field / referential failure (e.g. "managerId user does
        // not exist") is a client problem -> 400.
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

// GET /projects — get all projects (with users populated)
export async function getAllProjects(req, res) {
    try {
        const projects =
            await projectService.getAllProjects();

        res.json(projects);

    } catch (err) {
        res.status(500).json({
            message: 'Database error',
            error: err.message
        });
    }
}

// GET /projects/:id — get one project by id
export async function getProjectById(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: 'That is not a valid id'
            });
        }

        const project =
            await projectService.getProjectById(req.params.id);

        if (!project) {
            return res.status(404).json({
                message: 'Project not found'
            });
        }

        res.json(project);

    } catch (err) {
        res.status(500).json({
            message: 'Database error',
            error: err.message
        });
    }
}

// PUT /projects/:id — update a project
export async function updateProject(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: 'That is not a valid id'
            });
        }

        // Snapshot the BEFORE state so the audit shows what changed.
        const before = await Project.findById(req.params.id).lean();

        const project =
            await projectService.updateProject(
                req.params.id,
                req.body
            );

        if (!project) {
            return res.status(404).json({
                message: 'Project not found'
            });
        }

        // AUDIT — record the UPDATE action.
        try {
            await Audit.create({
                action: 'UPDATE',
                targetCollection: 'projects',
                from: before ?? { _id: req.params.id },
                to: project.toObject(),
                createdBy: before?.createdBy ?? req.user.userId,
                updatedBy: req.user.userId
            });
        } catch (auditErr) {
            console.error('Audit write failed:', auditErr.message);
        }

        res.json(project);

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

// DELETE /projects/:id — delete a project
export async function deleteProject(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: 'That is not a valid id'
            });
        }

        const project =
            await projectService.deleteProject(req.params.id);

        if (!project) {
            return res.status(404).json({
                message: 'Project not found'
            });
        }

        // AUDIT — record the DELETE action.
        try {
            await Audit.create({
                action: 'DELETE',
                targetCollection: 'projects',
                from: project.toObject(),
                to: null,
                createdBy: project.createdBy ?? req.user.userId,
                updatedBy: req.user.userId
            });
        } catch (auditErr) {
            console.error('Audit write failed:', auditErr.message);
        }

        res.json({
            message: 'Project deleted',
            project: project
        });

    } catch (err) {
        res.status(500).json({
            message: 'Database error',
            error: err.message
        });
    }
}
