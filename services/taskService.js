import Task from '../models/taskModel.js';
import Project from '../models/projectModel.js';
import User from '../models/userModel.js';

// TASK SERVICE — business logic for Tasks.
// Controller calls these; they talk to the Task, Project and User models.

// CREATE: add a new task.
export async function createTask(data) {
    // A task references a project and a user, so both must exist.

    // 1) Verify projectId points to an existing Project.
    const project = await Project.findById(data.projectId);
    if (!project) {
        throw new Error('Project does not exist');
    }

    // 2) Verify userId points to an existing User.
    const user = await User.findById(data.userId);
    if (!user) {
        throw new Error('User does not exist');
    }

    // 3) Only now (both exist) create the task.
    return await Task.create(data);
}

// READ ALL: get all tasks.
// .populate() replaces projectId and userId with the actual documents,
// so the response includes the full project and user info.
export async function getAllTasks() {
    return await Task.find()
        .populate('projectId')  // -> full project object
        .populate('userId');    // -> full user object
}

// READ ONE: get a single task by id, with project & user populated.
export async function getTaskById(id) {
    return await Task.findById(id)
        .populate('projectId')
        .populate('userId');
}

// UPDATE: modify an existing task.
export async function updateTask(id, data) {
    // Only validate references that were actually changed in the request.

    // If projectId was supplied, make sure that project exists.
    if (data.projectId) {
        const project = await Project.findById(data.projectId);
        if (!project) {
            throw new Error('Project does not exist');
        }
    }

    // If userId was supplied, make sure that user exists.
    if (data.userId) {
        const user = await User.findById(data.userId);
        if (!user) {
            throw new Error('User does not exist');
        }
    }

    return await Task.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    );
}

// DELETE: remove a task by id.
export async function deleteTask(id) {
    return await Task.findByIdAndDelete(id);
}
