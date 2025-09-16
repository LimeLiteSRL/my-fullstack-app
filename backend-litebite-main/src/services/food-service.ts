// services/foodService.ts

import { BackendError } from "@/errors";
import {
  Food,
  Restaurant,
  type IFoodDocumentType,
  type IRestaurantDocumentType,
} from "../models/models";
import { Types } from "mongoose";
import consola from "consola";

// Get all restaurants that offer a specific food
export const getRestaurantsByFood = async (
  foodId: Types.ObjectId
): Promise<IRestaurantDocumentType[]> => {
  // Step 1: Find the food by its ID
  const foodItem = await Food.findById(foodId);

  if (!foodItem) {
    console.warn(`Food item not found for ID: ${foodId}`);
    throw new BackendError("BAD_REQUEST", { message: "Food item not found" });
  }

  // Step 2: Find restaurants offering this food in their menu
  const restaurantsOfferingFood = await Restaurant.find({ menu: foodItem._id });

  if (restaurantsOfferingFood.length === 0) {
    console.warn(`No restaurants found offering food: ${foodId}`);
  }

  return restaurantsOfferingFood;
};

interface PaginatedResult {
  data: IFoodDocumentType[];
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
  };
}

// Get all foods with pagination
export const getAllFoodsWithPagination = async (
  page: number = 1, // Default page is 1
  limit: number = 10 // Default limit is 10
): Promise<PaginatedResult> => {
  const skip = (page - 1) * limit;

  // Get the total number of foods
  const totalItems = await Food.countDocuments();

  // Query for paginated foods
  const foods = await Food.find().skip(skip).limit(limit).exec();

  return {
    data: foods,
    meta: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: +page,
    },
  };
};

// Create a new food item
export const createFood = async (
  foodData: Partial<IFoodDocumentType>
): Promise<IFoodDocumentType> => {
  const food = new Food(foodData);
  return await food.save();
};

// Get food by ID
export const getFoodById = async (
  foodId: Types.ObjectId
): Promise<IFoodDocumentType | null> => {
  return await Food.findById(foodId);
};

// Get food by IDs
export const getFoodsByIds = async (
  foodIds: Types.ObjectId[]
): Promise<IFoodDocumentType[] | null> => {
  return await Food.find({ _id: { $in: foodIds } });
};

// Update a food item by ID
export const updateFoodById = async (
  foodId: Types.ObjectId,
  updateData: Partial<IFoodDocumentType>
): Promise<IFoodDocumentType | null> => {
  return await Food.findByIdAndUpdate(foodId, updateData, { new: true });
};

// Delete a food item by ID
export const deleteFoodById = async (
  foodId: Types.ObjectId
): Promise<IFoodDocumentType | null> => {
  return await Food.findByIdAndDelete(foodId);
};

// Get all foods by category
export const getFoodsByCategory = async (
  category: string
): Promise<IFoodDocumentType[]> => {
  return await Food.find({ category });
};

// Get foods by restaurant
export const getFoodsByRestaurant = async (
  restaurantId: Types.ObjectId
): Promise<IFoodDocumentType[]> => {
  return await Food.find({ restaurant: restaurantId });
};

interface RangeFilter {
  min?: number;
  max?: number;
}
interface QueryFoodsNearbyParams {
  coordinates: [number, number]; // [longitude, latitude]
  maxDistance: number; // in meters

  filters?: Partial<IFoodDocumentType>; // Partial filters based on FoodDocumentType
  healthRatingRange?: RangeFilter;
  tasteRatingRange?: RangeFilter;
  caloriesKcalRange?: RangeFilter;
  name?: string; // New optional parameter for searching by name
  itemType?: string;
  limit?: number;
  skip?: number;
  restaurantIds?: string[]; // Add restaurant IDs filter
}

export async function queryFoodsNearby({
  coordinates,
  maxDistance,
  filters = {},
  healthRatingRange,
  tasteRatingRange,
  caloriesKcalRange,
  itemType,
  name, // New parameter
  limit, // Default limit
  skip, // Default skip
  restaurantIds, // Add restaurant IDs filter
}: QueryFoodsNearbyParams) {
  console.log("🔍 FoodService: Starting queryFoodsNearby with:", {
    coordinates,
    maxDistance,
    limit,
    skip
  });

  // Build the query object
  const query: any = {
    ...filters,
  };

  // Add range filters to the query
  if (healthRatingRange) {
    query.healthRating = {};
    if (healthRatingRange.min !== undefined) {
      query.healthRating.$gte = healthRatingRange.min;
    }
    if (healthRatingRange.max !== undefined) {
      query.healthRating.$lte = healthRatingRange.max;
    }
  }

  if (tasteRatingRange) {
    query.tasteRating = {};
    if (tasteRatingRange.min !== undefined) {
      query.tasteRating.$gte = tasteRatingRange.min;
    }
    if (tasteRatingRange.max !== undefined) {
      query.tasteRating.$lte = tasteRatingRange.max;
    }
  }

  if (caloriesKcalRange) {
    query["nutritionalInformation.caloriesKcal"] = {};
    if (caloriesKcalRange.min !== undefined) {
      query["nutritionalInformation.caloriesKcal"].$gte = caloriesKcalRange.min;
    }
    if (caloriesKcalRange.max !== undefined) {
      query["nutritionalInformation.caloriesKcal"].$lte = caloriesKcalRange.max;
    }
  }

  // Add name search to the query if provided
  if (name) {
    query.name = { $regex: new RegExp(name, "i") }; // Case-insensitive search
  }

  if (itemType) {
    query.itemType = itemType;
  }

  console.log("🔍 FoodService: Food query filters:", query);

  // Find nearby restaurants
  const restaurantQuery: any = {
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates,
        },
        $maxDistance: maxDistance,
      },
    },
  };

  // Add restaurant IDs filter if provided
  if (restaurantIds && restaurantIds.length > 0) {
    restaurantQuery._id = { $in: restaurantIds.map(id => new Types.ObjectId(id)) };
    console.log("🍽️ FoodService: Adding restaurant filter:", {
      restaurantIds,
      restaurantQuery: restaurantQuery._id
    });
  }

  console.log("🔍 FoodService: Restaurant query:", restaurantQuery);

  const nearbyRestaurants = await Restaurant.find(restaurantQuery)
    .limit(100) // Get more restaurants to have enough food items
    .populate({
      path: "menu",
      match: query,
    });

  console.log("🏪 FoodService: Found restaurants:", nearbyRestaurants.length);
  
  if (nearbyRestaurants.length > 0) {
    const firstRestaurant = nearbyRestaurants[0];
    console.log("🏪 FoodService: First restaurant:", {
      name: firstRestaurant?.name,
      location: firstRestaurant?.location,
      menuCount: firstRestaurant?.menu?.length
    });
  }

  if (nearbyRestaurants.length === 0) {
    console.log("⚠️ FoodService: No restaurants found nearby");
    return [];
  }

  // Filter out restaurants with no matching menu items
  const filteredRestaurants = nearbyRestaurants.filter((r) => r.menu.length > 0);
  console.log("🍕 FoodService: Restaurants with menu items:", filteredRestaurants.length);

  // Extract individual food items from restaurants and add restaurant info to each food item
  const foodItems: any[] = [];
  
  filteredRestaurants.forEach((restaurant) => {
    if (restaurant.menu && Array.isArray(restaurant.menu)) {
      restaurant.menu.forEach((foodItem: any) => {
        // Add restaurant information to each food item
        const foodWithRestaurant = {
          ...foodItem.toObject(),
          restaurant: {
            _id: restaurant._id,
            name: restaurant.name,
            url: restaurant.url,
            location: restaurant.location,
            heroUrl: restaurant.heroUrl,
            rating: restaurant.rating,
            reviewCount: restaurant.reviewCount,
            telephone: restaurant.telephone,
            street: restaurant.street,
            locality: restaurant.locality,
            region: restaurant.region,
            postalCode: restaurant.postalCode,
            country: restaurant.country,
          }
        };
        foodItems.push(foodWithRestaurant);
      });
    }
  });

  console.log("🍕 FoodService: Total food items extracted:", foodItems.length);
  
  // Apply pagination to food items
  const startIndex = skip || 0;
  const endIndex = startIndex + (limit || 10);
  const paginatedFoodItems = foodItems.slice(startIndex, endIndex);
  
  console.log("🍕 FoodService: Paginated food items:", paginatedFoodItems.length);
  console.log("🍕 FoodService: Pagination info:", { startIndex, endIndex, totalItems: foodItems.length });

  // Return both the paginated items and metadata
  return {
    items: paginatedFoodItems,
    totalItems: foodItems.length,
    hasMore: endIndex < foodItems.length,
    currentPage: Math.floor(startIndex / (limit || 10)) + 1,
    totalPages: Math.ceil(foodItems.length / (limit || 10))
  };
}
