import { Router } from "express";
import { 
    register, 
    login, 
    requestPasswordReset, 
    resetPassword 
} from "../controllers/authController.mjs";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/requestPasswordReset", requestPasswordReset);
router.post("/resetPassword", resetPassword);

export default router;