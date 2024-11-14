import { Router } from "express";

import { authenticateToken } from '../middlewares/authMiddleware.mjs';
import { register, login, requestPasswordReset, resetPassword, logout } from "../controllers/authController.mjs";
import { getUserByToken, updateUserProfile, changePassword, deleteProfileImage, deleteUserAccount, updateAccountsOrder } from '../controllers/usersController.mjs';
import { getAllCategories, addCategory, editCategory, removeCategory } from '../controllers/categoryController.mjs';
import { getAllMovements, getMovementsByYear, getMovementsByYearAndMonth, addMovement, removeMovement, editMovement, } from '../controllers/movementsController.mjs';
import { getAccountsByYear, getAllAccounts, createAccount, editAccount, removeAccount } from '../controllers/accountsController.mjs';
import { getAllNotes, createNote, editNote, deleteNote } from '../controllers/notesController.mjs';
import { upload } from '../config/multer.mjs';

const router = Router();

// "wake up" path to check if the backend is active
router.get('/ping', (req, res) => {
    res.status(200).json({ message: 'Pong' });
});

// Authentication paths
router.post("/register", register);
router.post("/login", login);
router.post("/requestPasswordReset", requestPasswordReset);
router.post("/resetPassword", resetPassword);
router.post('/logout', logout);

// Movement routes
router.get('/movements/all', authenticateToken, getAllMovements);
router.get('/movements/:year', authenticateToken, getMovementsByYear);
router.get('/movements/:year/:month', authenticateToken, getMovementsByYearAndMonth);
router.post('/movements/add', authenticateToken, addMovement);
router.put('/movements/edit/:id', authenticateToken, editMovement);
router.delete('/movements/remove/:id', authenticateToken, removeMovement);

// Routes of categories
router.get('/categories/all', authenticateToken, getAllCategories);
router.post('/categories/add', authenticateToken, addCategory);
router.put('/categories/edit/:id', authenticateToken, editCategory);
router.delete('/categories/remove/:id', authenticateToken, removeCategory);

// Account Routes
router.get('/accounts/all', authenticateToken, getAllAccounts);
router.get('/accounts/:year', authenticateToken, getAccountsByYear);
router.post('/accounts/add', authenticateToken, createAccount);
router.put('/accounts/edit/:id', authenticateToken, editAccount);
router.delete('/accounts/remove/:id', authenticateToken, removeAccount);

// User routes
router.get('/user/me', authenticateToken, getUserByToken);
router.post('/user/updateProfile', authenticateToken, upload.single('profileImage'), updateUserProfile);
router.post('/user/changePassword', authenticateToken, changePassword);
router.post("/user/deleteProfileImage", authenticateToken, deleteProfileImage);
router.delete("/user/deleteAccount", authenticateToken, deleteUserAccount);
router.post("/user/updateAccountsOrder", authenticateToken, updateAccountsOrder);

// Notes routes
router.get('/notes', authenticateToken, getAllNotes);
router.post('/notes', authenticateToken, createNote);
router.put('/notes/:id', authenticateToken, editNote);
router.delete('/notes/:id', authenticateToken, deleteNote);

export default router;
