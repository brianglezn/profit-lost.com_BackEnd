import { Router } from "express";
import { authenticateToken } from '../middlewares/authMiddleware.mjs';
import { 
    getAllMovements, 
    getMovementsByYear, 
    getMovementsByYearAndMonth, 
    addMovement, 
    editMovement, 
    removeMovement 
} from '../controllers/movementsController.mjs';

const router = Router();

router.get('/all', authenticateToken, getAllMovements);
router.get('/:year', authenticateToken, getMovementsByYear);
router.get('/:year/:month', authenticateToken, getMovementsByYearAndMonth);
router.post('/add', authenticateToken, addMovement);
router.put('/edit/:id', authenticateToken, editMovement);
router.delete('/remove/:id', authenticateToken, removeMovement);

export default router;