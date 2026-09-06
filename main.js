import express from 'express';

import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import authRoutes from './routes/authRoutes.js';
import auth from './middlewares/authMiddleware.js';

// MAIN — creates and configures the Express application.
// (server.js starts the server; this file just builds the app.)

const app = express();

// express.json() parses incoming request bodies as JSON and puts them into
// req.body. Required for POST/PUT requests that send JSON.
app.use(express.json());

// Mount each set of routes at its base path.
// NOTE: userRoutes/projectRoutes/taskRoutes already apply the auth middleware
// internally, so only the public /auth routes are unprotected.
app.use('/users', userRoutes);       // protected
app.use('/projects', projectRoutes); // protected
app.use('/tasks', taskRoutes);       // protected
app.use('/auth', authRoutes);        // public (register / login) -> get a token

// Root health-check route.
app.get('/', (req, res) => {
    res.send('Project Management API is running!');
});

// Export the app so server.js can start it.
export default app;
