import mongoose from 'mongoose';

// USER SCHEMA
// This defines the structure of a User document in MongoDB.
// A schema is a "blueprint" — it tells Mongoose what fields a user has,
// their types, and any rules (required, unique, minlength, etc.).
const userSchema = new mongoose.Schema({
    name: {
        type: String,        // must be text
        required: true,      // must be provided
        trim: true           // removes extra spaces, e.g. "  Alex " -> "Alex"
    },
    
    userId: {
        type: String,
        required: true,
        unique: true,        // no two users can share the same userId
        trim: true
    },
    
    email: {
        type: String,
        required: true,
        unique: true,        // one email = one user
        trim: true
    },

    password: {
        type: String,
        required: true,
        minlength: 6,        // must be at least 6 characters
        select: false        // IMPORTANT: by default, passwords are NOT returned
                             // in queries. Only fetched explicitly when needed
                             // (e.g. during login).
    },

    role: {
        type: String,
        required: true,
        trim: true
    },

    experience: {
        type: Number,
        required: true,
        min: 0               // can't be negative
    },
    resetOtp: {
    type: String
    },

    resetOtpExpiry: {
    type: Date
    }
});

// Create the 'User' collection model from the schema.
// We export it so other files can do: User.find(), User.create(), etc.
const User = mongoose.model('User', userSchema);

export default User;
