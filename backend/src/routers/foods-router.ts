import express from "express";

import {
  createFoodController,
  getFoodByIdController,
  updateFoodByIdController,
  deleteFoodByIdController,
  getFoodsByCategoryController,
  getFoodsByRestaurantController,
  queryFoodsNearbyController,
  compareFoodsController,
  getAllFoodsWithPaginationController,
  getRestaurantsByFoodController,
  searchFoodsNearbyController
} from "../controllers/foods-controller";
import { adminAuthMiddleware } from "@/middlewares/admin-auth-middleware";

const router = express.Router();

// Route to find foods nearby and filters
router.get("/foods/find-nearby", queryFoodsNearbyController);

router.get("/foods/search", searchFoodsNearbyController);

// Route to get foods by category
router.get("/foods/category/:category", getFoodsByCategoryController);

// Route to get foods by restaurant
router.get("/foods/restaurant/:restaurantId", getFoodsByRestaurantController);


// Comparison route
router.get("/foods/compare", compareFoodsController);

// Route to get a food item by ID
router.get("/foods/:id", getFoodByIdController);

// Route to update a food item by ID
router.put("/foods/:id", adminAuthMiddleware, updateFoodByIdController);

// Route to delete a food item by ID
router.delete("/foods/:id", adminAuthMiddleware, deleteFoodByIdController);

// Route to get restaurants that offer a specific food
router.get("/foods/:foodId/restaurants", getRestaurantsByFoodController); // New route

// Route to create a new food item
router.post("/foods", adminAuthMiddleware, createFoodController);

// Route to get all foods with pagination
router.get("/foods", adminAuthMiddleware, getAllFoodsWithPaginationController);


export default router;
