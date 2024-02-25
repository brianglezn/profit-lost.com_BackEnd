import { Router } from "express";

import { authenticateToken } from '../middlewares/authMiddleware.mjs';
import { register, login } from "../controllers/authController.mjs";
import { getMovementsByYear } from '../controllers/movementsController.mjs';

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get('/movements/:year', authenticateToken, getMovementsByYear);

export default router;
