// services/configurationService.ts

import {
  Configuration,
  type IConfigurationDocumentType,
} from "../models/models";

let configsCache: {
  data: IConfigurationDocumentType[];
  expiry: number;
} | null = null;

const CACHE_DURATION = 2 * 1000; //  in milliseconds

// Get all configurations with caching
export const getAllConfigurations = async (): Promise<
  IConfigurationDocumentType[]
> => {
  const currentTime = Date.now();

  // Check if all configurations are in cache and not expired
  if (configsCache && configsCache.expiry > currentTime) {
    return configsCache.data;
  }

  // Fetch from database if not in cache or expired
  const configs = await Configuration.find();

  // Store in cache with expiry time
  configsCache = {
    data: configs,
    expiry: currentTime + CACHE_DURATION,
  };

  return configs;
};

// Invalidate cache for all configurations
const invalidateAllConfigsCache = () => {
  configsCache = null;
};

// Create a new configuration
export const createConfiguration = async (
  configData: Partial<IConfigurationDocumentType>
): Promise<IConfigurationDocumentType> => {
  const configuration = new Configuration(configData);
  const savedConfig = await configuration.save();
  invalidateAllConfigsCache();
  return savedConfig;
};

// Update a configuration by key
export const updateConfigurationByKey = async (
  key: string,
  updateData: Partial<IConfigurationDocumentType>
): Promise<IConfigurationDocumentType | null> => {
  const updatedConfig = await Configuration.findOneAndUpdate(
    { key },
    updateData,
    { new: true }
  );
  invalidateAllConfigsCache();
  return updatedConfig;
};

// Delete a configuration by key
export const deleteConfigurationByKey = async (
  key: string
): Promise<IConfigurationDocumentType | null> => {
  const deletedConfig = await Configuration.findOneAndDelete({ key });
  invalidateAllConfigsCache();
  return deletedConfig;
};
