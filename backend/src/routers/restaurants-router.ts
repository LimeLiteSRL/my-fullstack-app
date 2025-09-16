import express from "express";

import {
  createRestaurantController,
  findRestaurantsNearbyController,
  getAllRestaurantsWithPaginationController,
  getRestaurantByIdController,
  updateRestaurantByIdController,
} from "../controllers/restaurants-controller";
import { adminAuthMiddleware } from "@/middlewares/admin-auth-middleware";

const router = express.Router();



router.get("/restaurants/find-nearby", findRestaurantsNearbyController);
router.get("/restaurants/:id", getRestaurantByIdController);
router.post("/restaurants", adminAuthMiddleware, createRestaurantController);
router.put(
  "/restaurants/:id",
  adminAuthMiddleware,
  updateRestaurantByIdController
);

router.get(
  "/restaurants",
  getAllRestaurantsWithPaginationController
);

export default router;
