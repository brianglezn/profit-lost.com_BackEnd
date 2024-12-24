import { Router } from "express";
import { authenticateToken } from '../middlewares/authMiddleware.mjs';
import { 
    getAllNotes, 
    createNote, 
    editNote, 
    deleteNote 
} from '../controllers/notesController.mjs';

const router = Router();

router.get('/', authenticateToken, getAllNotes);
router.post('/', authenticateToken, createNote);
router.put('/:id', authenticateToken, editNote);
router.delete('/:id', authenticateToken, deleteNote);

export default router;