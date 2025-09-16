import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { BackendError } from "@/errors"; // Your custom error handling class

// Extend Request type to include user field
interface AuthenticatedRequest extends Request {
  user?: JwtPayload | string; // Add user field, which can be a decoded JWT payload or a string
}

// Assuming the token has a "role" field (e.g., { role: 'admin' })
interface DecodedToken extends JwtPayload {
  role?: string;
}

// Example Auth Middleware with Admin Check
export const adminAuthMiddleware = (
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
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as DecodedToken; // Verify the JWT
    req.user = decoded; // Attach user info to the request

    // Check if the user is an admin
    if (decoded.role !== "admin") {
      throw new BackendError("UNAUTHORIZED");
    }

    next(); // Pass control to the next middleware or controller
  } catch (error) {
    throw new BackendError("UNAUTHORIZED", {
      message: "Invalid or expired token",
    });
  }
};
