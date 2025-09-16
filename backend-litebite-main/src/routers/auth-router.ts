import express from "express";
import {
  sendVerificationCodeController,
  verifyCodeController,
  googleLoginController, // Import the Google login controller
  validateTokenController, // Import the token validation controller
} from "../controllers/auth-controller";

const router = express.Router();

// Route to send verification code
router.post("/auth/send-code", sendVerificationCodeController);

// Route to verify code
router.post("/auth/verify-code", verifyCodeController);

// Route for Google login
router.post("/auth/google-login", googleLoginController);

// Route to validate JWT token
router.post("/auth/validate-token", validateTokenController);

export default router;
