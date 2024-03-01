import { Router } from "express";

import { authenticateToken } from '../middlewares/authMiddleware.mjs';
import { register, login } from "../controllers/authController.mjs";
import { getAllMovements, getMovementsByYear, getMovementsByYearAndMonth } from '../controllers/movementsController.mjs';
import { getAccountsByYear, getAllAccounts } from '../controllers/accountsController.mjs';

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get('/movements/all', authenticateToken, getAllMovements);
router.get('/movements/:year', authenticateToken, getMovementsByYear);
router.get('/movements/:year/:month', authenticateToken, getMovementsByYearAndMonth);
router.get('/accounts/all', authenticateToken, getAllAccounts);
router.get('/accounts/:year', authenticateToken, getAccountsByYear);

export default router;
