import jwt from 'jsonwebtoken';
import { JWT_KEY } from '../config/constants.mjs';

export function authenticateToken(req, res, next) {
    console.log("Verifying token...");
    const authHeader = req.headers['authorization'];
    console.log(`Authorization Header: ${authHeader}`);
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        console.log("No token found");
        return res.sendStatus(401);
    }

    jwt.verify(token, JWT_KEY, (err, user) => {
        if (err) {
            console.log("Token verification failed", err);
            return res.sendStatus(403);
        }

        console.log("Token is valid, user:", user);
        req.user = user;
        next();
    });
}
