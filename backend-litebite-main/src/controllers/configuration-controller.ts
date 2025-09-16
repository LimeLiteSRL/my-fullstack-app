// controllers/configurationController.ts

import { createController } from "@/create-controller";
import { BackendError } from "@/errors";
import { ConfigurationDTOSchema } from "@/models/dto";
import * as ConfigurationService from "@/services/configuration-service";
import { z } from "zod";

// Get All Configurations Controller
export const getAllConfigurationsController = createController(
  z.object({}),
  async (req, res) => {
    const result = await ConfigurationService.getAllConfigurations();
    res.json({ data: result });
  }
);

// Create Configuration Controller
const NewConfigurationRequestSchema = z.object({
  body: ConfigurationDTOSchema,
});

export const createConfigurationController = createController(
  NewConfigurationRequestSchema,
  async (req, res) => {
    const result = await ConfigurationService.createConfiguration(req.body);
    res.json({ data: result });
  }
);

// Update Configuration By Key Controller
const UpdateConfigurationByKeyRequestSchema = z.object({
  params: z.object({
    key: z.string(),
  }),
  body: ConfigurationDTOSchema.partial(),
});

export const updateConfigurationByKeyController = createController(
  UpdateConfigurationByKeyRequestSchema,
  async (req, res) => {
    const result = await ConfigurationService.updateConfigurationByKey(
      req.params.key,
      req.body
    );

    if (!result) {
      res.json(
        new BackendError("NOT_FOUND", { message: "Configuration not found" })
      );
      return;
    }
    res.json({ data: result });
  }
);

// Delete Configuration By Key Controller
const DeleteConfigurationByKeyRequestSchema = z.object({
  params: z.object({
    key: z.string(),
  }),
});

export const deleteConfigurationByKeyController = createController(
  DeleteConfigurationByKeyRequestSchema,
  async (req, res) => {
    const result = await ConfigurationService.deleteConfigurationByKey(
      req.params.key
    );

    if (!result) {
      res.json(
        new BackendError("NOT_FOUND", { message: "Configuration not found" })
      );
      return;
    }
    res.json({ data: result });
  }
);
