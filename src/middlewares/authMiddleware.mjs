import jwt from 'jsonwebtoken';
import { JWT_KEY } from '../config/constants.mjs';

export function authenticateToken(req, res, next) {
    const token = req.cookies?.authToken;

    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, JWT_KEY, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }

        req.user = user;
        next();
    });
}