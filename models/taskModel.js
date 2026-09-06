import mongoose from 'mongoose';

// TASK SCHEMA
// A task belongs to one Project (projectId) and is assigned to one User (userId).
// It stores only those reference IDs, not the full project/user data.
const taskSchema = new mongoose.Schema({
    taskName: {
        type: String,
        required: true,
        trim: true
    },

    // A human-friendly unique code for the task (e.g. "0001").
    taskId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    // References the Project collection (uses Project _id).
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',    // points to the 'Project' collection
        required: true
    },

    // References the User collection (uses User _id).
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',       // points to the 'User' collection
        required: true
    }
});

const Task = mongoose.model('Task', taskSchema);

export default Task;
