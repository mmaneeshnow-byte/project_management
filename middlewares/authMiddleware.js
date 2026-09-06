import jwt from 'jsonwebtoken';

// AUTH MIDDLEWARE — protects protected routes.
// Runs before the controller on protected routes (users, projects, tasks).
// If it fails, it responds 401 and the request never reaches the controller.

const auth = (req, res, next) => {
    // The client sends the token in the Authorization header, like:
    //   Authorization: Bearer <token>
    const header = req.headers.authorization;

    console.log('[AUTH DEBUG] raw header:', JSON.stringify(header));

    // If there's no header, or it doesn't start with "Bearer "...
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'No token provided'
        });
    }

    // Extract just the token (the part after "Bearer ").
    const token = header.split(' ')[1];

    try {
        // Verify the token is valid by checking its signature with SECRET_KEY.
        // If valid, jwt.verify returns the payload we encoded at login:
        //   { userId: <user._id>, iat, exp }
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        // Attach the decoded user to the request so our handlers can know
        // who is authenticated (req.user.userId).
        req.user = decoded;

        // Continue to the route controller.
        next();

    } catch (err) {
        // Token is invalid, tampered with, or expired.
        res.status(401).json({
            message: 'Invalid or expired token'
        });
    }
};

export default auth;
