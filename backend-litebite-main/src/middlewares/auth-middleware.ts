import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { BackendError } from "@/errors"; // Your custom error handling class

// Extend Request type to include user field
interface AuthenticatedRequest extends Request {
  user?: JwtPayload | string; // Add user field, which can be a decoded JWT payload or a string
}

// Example Auth Middleware with Types
export const userAuthMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new BackendError("UNAUTHORIZED", {
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1] || "";

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string); // Verify the JWT
    
    req.user = decoded; // Attach user info to the request

    next(); // Pass control to the next middleware or controller
  } catch (error) {
    throw new BackendError("UNAUTHORIZED", {
      message: "Invalid or expired token",
    });
  }
};
