import express from "express";
import {
    register,
    login,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword
} from "../controllers/auth.controller.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema, resetPasswordSchema } from "../validators/auth.validator.js";

const router = express.Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:resetToken", validateRequest(resetPasswordSchema), resetPassword);

export default router;
