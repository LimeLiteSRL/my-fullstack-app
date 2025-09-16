import { createController } from "@/create-controller";
import z from "zod";
import {
  SendCodeByOTPViaSMS,
  verifyCode,
  googleLogin,
} from "@/services/user-services"; // Import the OTP service
import { BackendError } from "@/errors";
import jwt from "jsonwebtoken";

// Request Schema for sending OTP
const SendVerificationCodeRequestSchema = z.object({
  body: z.object({
    phoneNumber: z.string().min(10).max(15), // Validate phone number format
  }),
});

// Controller to send OTP via SMS
export const sendVerificationCodeController = createController(
  SendVerificationCodeRequestSchema,
  async (req, res) => {
    const { phoneNumber } = req.body;

    await SendCodeByOTPViaSMS(phoneNumber);

    res.json({ message: "Verification code sent" });
  }
);

// Request Schema for verifying OTP
const VerifyCodeRequestSchema = z.object({
  body: z.object({
    phoneNumber: z.string().min(10).max(15), // Validate phone number
    code: z.string().length(6), // OTP should be exactly 6 characters
  }),
});

// Controller to verify OTP
export const verifyCodeController = createController(
  VerifyCodeRequestSchema,
  async (req, res) => {
    const { phoneNumber, code } = req.body;

    // Attempt to verify OTP
    const result = await verifyCode(phoneNumber, code);

    res.json(result);
  }
);

// Request Schema for Google login
const GoogleLoginRequestSchema = z.object({
  body: z.object({
    token: z.string().nonempty(), // Validate that a non-empty token is provided
  }),
});

// Controller for Google login
export const googleLoginController = createController(
  GoogleLoginRequestSchema,
  async (req, res) => {
    const { token } = req.body;

    const authData = await googleLogin(token);

    res.json(authData); // Return the JWT token and new user flag
  }
);

// Request Schema for token validation
const ValidateTokenRequestSchema = z.object({
  body: z.object({
    token: z.string().nonempty(), // Validate that a non-empty token is provided
  }),
});

// Controller to validate JWT token
export const validateTokenController = createController(
  ValidateTokenRequestSchema,
  async (req, res) => {
    const { token } = req.body;

    try {
      const secret = (process.env.JWT_SECRET as string) || "your_secret_key";
      const decoded = jwt.verify(token, secret);
      
      // Token is valid, return user info
      res.json({ 
        valid: true, 
        user: decoded,
        message: "Token is valid" 
      });
    } catch (error) {
      // Token is invalid or expired
      res.status(401).json({ 
        valid: false, 
        message: "Invalid or expired token" 
      });
    }
  }
);