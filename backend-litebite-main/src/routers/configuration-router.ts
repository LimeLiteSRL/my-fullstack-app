import express from "express";
import {
  getAllConfigurationsController,
  createConfigurationController,
  updateConfigurationByKeyController,
  deleteConfigurationByKeyController,
} from "../controllers/configuration-controller";
import { adminAuthMiddleware } from "@/middlewares/admin-auth-middleware";

const router = express.Router();

// Route to get all configurations
router.get(
  "/configurations",
  adminAuthMiddleware,
  getAllConfigurationsController
);

// Route to create a new configuration
router.post(
  "/configurations",
  adminAuthMiddleware,
  createConfigurationController
);

// Route to update a configuration by key
router.put(
  "/configurations/:key",
  adminAuthMiddleware,
  updateConfigurationByKeyController
);

// Route to delete a configuration by key
router.delete(
  "/configurations/:key",
  adminAuthMiddleware,
  deleteConfigurationByKeyController
);

export default router;
