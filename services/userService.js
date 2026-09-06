import User from '../models/userModel.js';

// USER SERVICE — business logic for Users.
// These functions talk to the User model (the database).
// The controllers call these, and they do NOT send HTTP responses themselves.

// CREATE: add a new user to the database.
export async function createUser(data) {
    return await User.create(data);
}

// READ ALL: get every user.
export async function getAllUsers() {
    return await User.find();
}

// READ ONE: get a single user by its _id.
export async function getUserById(id) {
    return await User.findById(id);
}

// UPDATE: find a user by id and change its fields.
// new:true          -> return the updated document (not the original)
// runValidators:true -> apply the schema rules (required, minlength, etc.)
//                       during updates too, not just on create.
export async function updateUser(id, data) {
    return await User.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    );
}

// DELETE: remove a user from the database by id.
export async function deleteUser(id) {
    return await User.findByIdAndDelete(id);
}
