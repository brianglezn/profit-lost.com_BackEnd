import { Router } from "express";
import { authenticateToken } from '../middlewares/authMiddleware.mjs';
import { 
    getAllCategories, 
    addCategory, 
    editCategory, 
    removeCategory 
} from '../controllers/categoryController.mjs';

const router = Router();

router.get('/all', authenticateToken, getAllCategories);
router.post('/add', authenticateToken, addCategory);
router.put('/edit/:id', authenticateToken, editCategory);
router.delete('/remove/:id', authenticateToken, removeCategory);

export default router;