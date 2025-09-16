import express from "express";

import {
  createReviewController,
  getReviewByIdController,
  getReviewsByUserController,
  getReviewsByFoodController,
  updateReviewController,
  deleteReviewController,
} from "../controllers/reviews-controller"; // Adjust the path as needed
import { adminAuthMiddleware } from "@/middlewares/admin-auth-middleware";

const router = express.Router();

// Route to create a new review
router.post("/reviews", createReviewController);

// Route to get a review by its ID
router.get("/reviews/:id", getReviewByIdController);

// Route to get all reviews for a specific user
router.get("/reviews/user/:userId", getReviewsByUserController);

// Route to get all reviews for a specific food item
router.get("/reviews/food/:foodId", getReviewsByFoodController);

// Route to update a review by its ID
router.put("/reviews/:id", adminAuthMiddleware, updateReviewController);

// Route to delete a review by its ID
router.delete("/reviews/:id", adminAuthMiddleware, deleteReviewController);

export default router;
