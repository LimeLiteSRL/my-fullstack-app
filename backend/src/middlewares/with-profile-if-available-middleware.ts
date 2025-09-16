import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { BackendError } from "@/errors"; // Your custom error handling class

import * as UserService from "@/services/user-services";
import consola from "consola";

// Extend Request type to include user field
interface AuthenticatedRequest extends Request {
  user?: JwtPayload | string; // Add user field, which can be a decoded JWT payload or a string
}

// Example Auth Middleware with Types
export const withProfileIfAvailableMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(); // Pass control to the next middleware or controller
    return;
  }

  const token = authHeader.split(" ")[1] || "";

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string); // Verify the JWT

    req.user = decoded; // Attach user info to the request

    //@ts-ignore
    const identifier = decoded.phone || decoded.email;

    if (typeof identifier !== "string") {
      next(); // Pass control to the next middleware or controller

      return;
    }

    const profile = await UserService.getUserByIdentifier(identifier);

    consola.log("withProfileIfAvailableMiddleware", { profile, identifier });

    //@ts-ignore
    req.profile = profile;

    next(); // Pass control to the next middleware or controller
  } catch (error) {
    next(); // Pass control to the next middleware or controller
  }
};
