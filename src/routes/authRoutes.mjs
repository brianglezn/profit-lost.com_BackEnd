import { Router } from "express";

import { authenticateToken } from '../middlewares/authMiddleware.mjs';
import { register, login } from "../controllers/authController.mjs";
import { getAllMovements, getMovementsByYear, getMovementsByYearAndMonth, addMovement, removeMovement, editMovement, getMovementsByCategory } from '../controllers/movementsController.mjs';
import { getAccountsByYear, getAllAccounts } from '../controllers/accountsController.mjs';
import { getUserByToken } from '../controllers/usersController.mjs';
import { getAllCategories, addCategory, editCategory, removeCategory } from '../controllers/categoryController.mjs';

const router = Router();

// Rutas de autenticación
router.post("/register", register);
router.post("/login", login);

// Rutas de movimientos
router.get('/movements/all', authenticateToken, getAllMovements);
router.get('/movements/:year', authenticateToken, getMovementsByYear);
router.get('/movements/:year/:month', authenticateToken, getMovementsByYearAndMonth);
router.get('/movements/category/:categoryId', authenticateToken, getMovementsByCategory);
router.post('/movements/add', authenticateToken, addMovement);
router.put('/movements/edit/:id', authenticateToken, editMovement);
router.delete('/movements/remove/:id', authenticateToken, removeMovement);

// Rutas de categorias
router.get('/categories/all', authenticateToken, getAllCategories);
router.post('/categories/add', authenticateToken, addCategory);
router.put('/categories/edit/:id', authenticateToken, editCategory);
router.delete('/categories/remove/:id', authenticateToken, removeCategory);

// Rutas de cuentas
router.get('/accounts/all', authenticateToken, getAllAccounts);
router.get('/accounts/:year', authenticateToken, getAccountsByYear);

// Rutas de usuarios
router.get('/user/me', authenticateToken, getUserByToken);

export default router;
