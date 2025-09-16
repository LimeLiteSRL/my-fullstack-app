import express from "express";

import { userAuthMiddleware } from "@/middlewares/auth-middleware";
import {
  addRestaurantFoodToProfileController,
  getProfileController,
  getProfileEatenFoodsController,
  updateUserProfileController,
  writeReviewController,
  getAllNotificationsController,
  markAllNotificationsAsReadController,
  markNotificationAsReadByIdController,
  addAiFoodToProfileController,
  deleteEatenFoodFromProfileController,
  addWaterIntakeController,
  getWaterIntakeController,
  uploadProfileImageController,
} from "@/controllers/profile-controller";

const router = express.Router();

router.get("/profile", userAuthMiddleware, getProfileController);
router.get(
  "/profile/eaten",
  userAuthMiddleware,
  getProfileEatenFoodsController
);

router.post(
  "/profile/food",
  userAuthMiddleware,
  addRestaurantFoodToProfileController
);

router.post("/profile/review", userAuthMiddleware, writeReviewController);
router.put("/profile", userAuthMiddleware, updateUserProfileController);

router.get(
  "/profile/notifications",
  userAuthMiddleware,
  getAllNotificationsController
);

router.put(
  "/profile/notifications/read",
  userAuthMiddleware,
  markAllNotificationsAsReadController
);

router.put(
  "/profile/notifications/:notificationId/read",
  userAuthMiddleware,
  markNotificationAsReadByIdController
);

router.post(
  "/profile/ai-food",
  userAuthMiddleware,
  addAiFoodToProfileController
);

router.delete(
  "/profile/eaten/:eatenFoodId",
  userAuthMiddleware,
  deleteEatenFoodFromProfileController
);

// Water intake routes
router.post(
  "/profile/water-intake",
  userAuthMiddleware,
  addWaterIntakeController
);

router.get(
  "/profile/water-intake",
  userAuthMiddleware,
  getWaterIntakeController
);

router.post(
  "/profile/update-avatar",
  userAuthMiddleware,
  uploadProfileImageController
);

export default router;
