import { Router } from "express";
import { authenticateToken } from '../middlewares/authMiddleware.mjs';
import { upload } from '../config/multer.mjs';
import { 
    getUserByToken, 
    updateUserProfile, 
    changePassword, 
    deleteProfileImage, 
    deleteUserAccount,
    updateAccountsOrder 
} from '../controllers/usersController.mjs';

const router = Router();

router.get('/me', authenticateToken, getUserByToken);
router.post('/updateProfile', authenticateToken, upload.single('profileImage'), updateUserProfile);
router.post('/changePassword', authenticateToken, changePassword);
router.post('/deleteProfileImage', authenticateToken, deleteProfileImage);
router.delete('/deleteAccount', authenticateToken, deleteUserAccount);
router.post('/updateAccountsOrder', authenticateToken, updateAccountsOrder);

export default router;