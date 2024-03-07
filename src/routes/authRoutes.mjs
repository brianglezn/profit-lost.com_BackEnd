import { Router } from "express";

import { authenticateToken } from '../middlewares/authMiddleware.mjs';
import { register, login } from "../controllers/authController.mjs";
import { getAllMovements, getMovementsByYear, getMovementsByYearAndMonth, addMovement, removeMovement, editMovement } from '../controllers/movementsController.mjs';
import { getAccountsByYear, getAllAccounts } from '../controllers/accountsController.mjs';
import { getUserByToken } from '../controllers/usersController.mjs';

const router = Router();

// Rutas de autenticación
router.post("/register", register);
router.post("/login", login);

// Rutas de movimientos
router.get('/movements/all', authenticateToken, getAllMovements);
router.post('/movements/add', authenticateToken, addMovement);
router.delete('/movements/remove/:id', authenticateToken, removeMovement);
router.put('/movements/edit/:id', authenticateToken, editMovement);
router.get('/movements/:year', authenticateToken, getMovementsByYear);
router.get('/movements/:year/:month', authenticateToken, getMovementsByYearAndMonth);

// Rutas de cuentas
router.get('/accounts/all', authenticateToken, getAllAccounts);
router.get('/accounts/:year', authenticateToken, getAccountsByYear);

// Rutas de usuarios
router.get('/user/me', authenticateToken, getUserByToken);

export default router;
