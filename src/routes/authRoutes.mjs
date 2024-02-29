import { Router } from "express";

import { authenticateToken } from '../middlewares/authMiddleware.mjs';
import { register, login } from "../controllers/authController.mjs";
import { getAllMovements, getMovementsByYear, getMovementsByYearAndMonth } from '../controllers/movementsController.mjs';

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get('/movements/all', authenticateToken, getAllMovements);
router.get('/movements/:year', authenticateToken, getMovementsByYear);
router.get('/movements/:year/:month', authenticateToken, getMovementsByYearAndMonth);

export default router;
