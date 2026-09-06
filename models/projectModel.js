import mongoose from 'mongoose';

// PROJECT SCHEMA
// A project document references Users through four fields
// (managerId, ownerId, createdBy, updatedBy). It stores only the Users' _ids,
// not their full data. The actual user info lives in the User collection.
const projectSchema = new mongoose.Schema({
    projectName: {
        type: String,
        required: true,
        trim: true
    },

    // A human-friendly unique code for the project (e.g. "0001").
    projectId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    // Each of these fields stores a User _id.
    // type: ObjectId  -> the value must be a valid MongoDB ObjectId
    // ref: 'User'     -> tells Mongoose this points to the 'User' collection.
    //                    This is what makes .populate('managerId') work later.
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
