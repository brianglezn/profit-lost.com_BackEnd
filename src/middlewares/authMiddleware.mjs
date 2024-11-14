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

export function authorizeBackupAccess(req, res, next) {
    const authorizedUserId = "65df4dfae27f115e23b1a1c2";
    if (req.user.userId !== authorizedUserId) {
        return res.sendStatus(403);
    }
    next();
}
