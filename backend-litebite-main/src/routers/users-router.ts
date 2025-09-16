import express from "express";

import {
  createUserController,
  getUserByIdController,
  getUserByUsernameController,
  updateUserByIdController,
  deleteUserByIdController,
  addReviewToUserController,
  getAllUsersWithPaginationController,
} from "../controllers/users-controller"; // Adjust the path as needed
import { adminAuthMiddleware } from "@/middlewares/admin-auth-middleware";

const router = express.Router();

// Route to get all users with pagination
router.get("/users", adminAuthMiddleware, getAllUsersWithPaginationController);

// Route to create a new user
router.post("/users", adminAuthMiddleware, createUserController);

// Route to get a user by ID
router.get("/users/:id", adminAuthMiddleware, getUserByIdController);

// Route to get a user by username
router.get(
  "/users/username/:username",
  adminAuthMiddleware,
  getUserByUsernameController
);

// Route to update a user by ID
router.put("/users/:id", adminAuthMiddleware, updateUserByIdController);

// Route to delete a user by ID
router.delete("/users/:id", adminAuthMiddleware, deleteUserByIdController);

// Route to add review to user's reviews
router.put(
  "/users/:userId/reviews/:reviewId",
  adminAuthMiddleware,
  addReviewToUserController
);

export default router;
