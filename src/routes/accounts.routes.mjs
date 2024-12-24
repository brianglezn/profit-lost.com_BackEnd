import { Router } from "express";
import { authenticateToken } from '../middlewares/authMiddleware.mjs';
import { 
    getAllAccounts, 
    getAccountsByYear, 
    createAccount, 
    editAccount, 
    removeAccount 
} from '../controllers/accountsController.mjs';

const router = Router();

router.get('/all', authenticateToken, getAllAccounts);
router.get('/:year', authenticateToken, getAccountsByYear);
router.post('/add', authenticateToken, createAccount);
router.put('/edit/:id', authenticateToken, editAccount);
router.delete('/remove/:id', authenticateToken, removeAccount);

export default router;