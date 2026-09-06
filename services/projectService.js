import Project from '../models/projectModel.js';
import User from '../models/userModel.js';

// PROJECT SERVICE — business logic for Projects.
// Controller calls these; they talk to the Project (and User) models.

// helper: verify that every User referenced in the project actually exists.
// For example, if managerId is supplied, we check a User with that _id exists.
async function checkUsers(data) {
    // All the fields on a Project that should point to an existing User.
    const userFields = [
        'managerId',
        'ownerId',
        'createdBy',
        'updatedBy'
    ];

    // Loop over each reference field.
    for (const field of userFields) {
        // If this field was provided in the request...
        if (data[field]) {
            // Try to find the matching User by that _id.
            const user = await User.findById(data[field]);

            // If no such user exists, reject with an error.
            // This is the "referential validation" the assignment asks for.
            if (!user) {
                throw new Error(`${field} user does not exist`);
            }
        }
    }
}

// CREATE: add a new project.
export async function createProject(data) {
    // First make sure the referenced users exist.
    await checkUsers(data);
    // Then create the project.
    return await Project.create(data);
}

// READ ALL: get all projects.
// .populate() replaces each reference ID with the actual related document:
// the response contains the full user objects instead of just the IDs.
export async function getAllProjects() {
    return await Project.find()
        .populate('managerId')    // managerId -> full manager user object
        .populate('ownerId')      // ownerId   -> full owner user object
        .populate('createdBy')    // createdBy -> full creator user object
        .populate('updatedBy');   // updatedBy -> full last-editor user object
}

// READ ONE: get a single project by id, with users populated.
export async function getProjectById(id) {
    return await Project.findById(id)
        .populate('managerId')
        .populate('ownerId')
        .populate('createdBy')
        .populate('updatedBy');
}

// UPDATE: modify an existing project.
export async function updateProject(id, data) {
    // Validate any newly-provided user references before saving.
    await checkUsers(data);

    return await Project.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    );
}

// DELETE: remove a project by id.
export async function deleteProject(id) {
    return await Project.findByIdAndDelete(id);
}
