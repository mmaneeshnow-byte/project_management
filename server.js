import 'dotenv/config';
import mongoose from 'mongoose';

import app from './main.js';

const PORT = 5000;

// STARTUP function: connect to Mongo, then start the HTTP server.
async function start() {
    try {
        // 1) Connect to MongoDB using the URI from the .env file.
        await mongoose.connect(process.env.MONGO_URI);

        console.log('Connected to MongoDB');

        // 2) Only after a successful DB connection, start listening on the port.
        app.listen(PORT, () => {
            console.log('Server started');
            console.log(`Open http://localhost:${PORT}`);
        });

    } catch (err) {
        // If the DB connection fails, log it and stop the app.
        console.error('Could not connect to MongoDB');
        console.error(err.message);
        process.exit(1);
    }
}

// Actually run the startup function.
start();
