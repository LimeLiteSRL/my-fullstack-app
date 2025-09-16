import express from "express";

import {
  getUsersAddedOverTimeController,
  getFoodsAddedOverTimeController,
  getRestaurantsAddedOverTimeController,
  getEatenFoodsAddedOverTimeController,
  getReviewsAddedOverTimeController,
} from "../controllers/report-controller"; // Adjust the path as needed
import { adminAuthMiddleware } from "@/middlewares/admin-auth-middleware";

const router = express.Router();

// Route to get users added over time
router.get(
  "/reports/users",
  adminAuthMiddleware,
  getUsersAddedOverTimeController
);

// Route to get foods added over time
router.get(
  "/reports/foods",
  adminAuthMiddleware,
  getFoodsAddedOverTimeController
);

// Route to get eaten foods over time
router.get(
  "/reports/eaten",
  adminAuthMiddleware,
  getEatenFoodsAddedOverTimeController
);

// Route to get restaurants added over time
router.get(
  "/reports/restaurants",
  adminAuthMiddleware,
  getRestaurantsAddedOverTimeController
);

// Route to get reviews over time
router.get(
  "/reports/reviews",
  adminAuthMiddleware,
  getReviewsAddedOverTimeController
);

export default router;
