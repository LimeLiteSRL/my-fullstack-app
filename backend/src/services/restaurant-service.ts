// services/restaurantService.ts

import type mongoose from "mongoose";
import { Restaurant, type IRestaurantDocumentType } from "../models/models";
interface PaginatedResult {
  data: IRestaurantDocumentType[];
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
  };
}

export const getAllRestaurantsWithPagination = async (
  page: number,
  limit: number
): Promise<PaginatedResult> => {
  const totalItems = await Restaurant.countDocuments();
  const data = await Restaurant.find()
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    data,
    meta: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: +page,
    },
  };
};

// Create a new restaurant
export const createRestaurant = async (
  restaurantData: Partial<IRestaurantDocumentType>
): Promise<IRestaurantDocumentType> => {
  const restaurant = new Restaurant(restaurantData);
  return await restaurant.save();
};
// Get a restaurant by ID
export const getRestaurantById = async (
  restaurantId: mongoose.Types.ObjectId
): Promise<IRestaurantDocumentType | null> => {
  return await Restaurant.findById(restaurantId).populate("menu");
};

// Update a restaurant by ID
export const updateRestaurantById = async (
  restaurantId: mongoose.Types.ObjectId,
  updateData: Partial<IRestaurantDocumentType>
): Promise<IRestaurantDocumentType | null> => {
  return await Restaurant.findByIdAndUpdate(restaurantId, updateData, {
    new: true,
  });
};

// Delete a restaurant by ID
export const deleteRestaurantById = async (
  restaurantId: mongoose.Types.ObjectId
): Promise<IRestaurantDocumentType | null> => {
  return await Restaurant.findByIdAndDelete(restaurantId);
};

// Add food to restaurant's menu
export const addFoodToMenu = async (
  restaurantId: mongoose.Types.ObjectId,
  foodId: mongoose.Types.ObjectId
): Promise<IRestaurantDocumentType | null> => {
  return await Restaurant.findByIdAndUpdate(
    restaurantId,
    { $push: { menu: foodId } },
    { new: true }
  );
};

// Find restaurants within a certain distance
interface NearbyOptions {
  page?: number;
  limit?: number;
  filters?: {
    name?: string;
    cuisine?: string;
    minRating?: number;
  };
  select?: string;
}

export const findRestaurantsNearby = async (
  coordinates: [number, number],
  maxDistance: number,
  options?: NearbyOptions
): Promise<PaginatedResult> => {
  const { page = 1, limit = 20, filters = {}, select } = options ?? {};

  const query: any = {
    location: {
      $near: {
        $geometry: { type: "Point", coordinates },
        $maxDistance: maxDistance,
      },
    },
  };

  if (filters.name) {
    query.name = { $regex: filters.name, $options: "i" };
  }
  if (filters.cuisine) {
    query.cuisine = { $regex: filters.cuisine, $options: "i" };
  }
  if (typeof filters.minRating === "number") {
    // Try both direct rating and reviewSummary.avg fields
    query.$or = [
      { rating: { $gte: filters.minRating } },
      { "reviewSummary.averageTasteRating": { $gte: filters.minRating } },
      { "reviewSummary.averageHealthRating": { $gte: filters.minRating } },
    ];
  }

  // Note: countDocuments with $near is not allowed; avoid total count to prevent 500
  const data = await Restaurant.find(query)
    .select(select ?? "name url locality region location heroUrl rating reviewSummary")
    .skip((page - 1) * limit)
    .limit(limit)
    .lean(); // return plain JSON objects (smaller, faster)

  return {
    data: data as unknown as IRestaurantDocumentType[],
    meta: {
      totalItems: 0,
      totalPages: 0,
      currentPage: +page,
    },
  };
};
