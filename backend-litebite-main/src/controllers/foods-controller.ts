import { createController } from "@/create-controller";
import { BackendError } from "@/errors";
import {
  AllergiesSchema,
  DietaryPreferencesSchema,
  FoodDTOSchema,
} from "@/models/dto";

import * as FoodService from "@/services/food-service";
import { generateObject } from "ai";
import * as ConfigurationService from "@/services/configuration-service";
import { openai } from "@ai-sdk/openai";

import { z } from "zod";
import { Types } from "mongoose";
import { ObjectIdSchema } from "@/types";
import consola from "consola";
import { Restaurant } from "@/models/models";

// Get Restaurants by Food Controller
const GetRestaurantsByFoodRequestSchema = z.object({
  params: z.object({
    foodId: ObjectIdSchema,
  }),
});

export const getRestaurantsByFoodController = createController(
  GetRestaurantsByFoodRequestSchema,
  async (req, res) => {
    const foodId = new Types.ObjectId(req.params.foodId);
    
    console.log(`🍕 Backend: Getting restaurants for food ID: ${foodId}`);

    try {
      const result = await FoodService.getRestaurantsByFood(foodId);

      if (result.length === 0) {
        console.warn(`🍕 Backend: No restaurants found offering food: ${foodId}`);
        res.json(
          new BackendError("NOT_FOUND", {
            message: "No restaurants found offering this food",
          })
        );
        return;
      }

      res.json({ data: result });
    } catch (error) {
      console.error(`🍕 Backend: Error getting restaurants for food ${foodId}:`, error);
      throw error; // Let the error handler deal with it
    }
  }
);

// Define the schema for pagination request
const GetAllFoodsWithPaginationRequestSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .refine((val) => !isNaN(Number(val)), {
        message: "Page must be a number",
      })
      .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z
      .string()
      .optional()
      .refine((val) => !isNaN(Number(val)), {
        message: "Limit must be a number",
      })
      .transform((val) => (val ? parseInt(val, 10) : 10)),
  }),
});

// Get All Foods with Pagination Controller
export const getAllFoodsWithPaginationController = createController(
  GetAllFoodsWithPaginationRequestSchema,
  async (req, res) => {
    const { page, limit } = req.query;

    const result = await FoodService.getAllFoodsWithPagination(page, limit);

    res.json(result);
  }
);

// Create Food Controller
const NewFoodRequestSchema = z.object({
  body: FoodDTOSchema,
});

export const createFoodController = createController(
  NewFoodRequestSchema,
  async (req, res) => {
    const result = await FoodService.createFood(req.body);
    res.json({ data: result });
  }
);

// Get Food By ID Controller
const GetFoodByIdRequestSchema = z.object({
  params: z.object({
    id: ObjectIdSchema,
  }),
});

export const getFoodByIdController = createController(
  GetFoodByIdRequestSchema,
  async (req, res) => {
    const result = await FoodService.getFoodById(
      new Types.ObjectId(req.params.id)
    );

    if (!result) {
      res.json(new BackendError("NOT_FOUND", { message: "Food not found" }));
      return;
    }
    res.json({ data: result });
  }
);

// Update Food By ID Controller
const UpdateFoodByIdRequestSchema = z.object({
  params: z.object({
    id: ObjectIdSchema,
  }),
  body: FoodDTOSchema.partial(),
});

export const updateFoodByIdController = createController(
  UpdateFoodByIdRequestSchema,
  async (req, res) => {
    const result = await FoodService.updateFoodById(
      new Types.ObjectId(req.params.id),
      req.body
    );

    if (!result) {
      res.json(new BackendError("NOT_FOUND", { message: "Food not found" }));
      return;
    }
    res.json({ data: result });
  }
);

// Delete Food By ID Controller
const DeleteFoodByIdRequestSchema = z.object({
  params: z.object({
    id: ObjectIdSchema,
  }),
});

export const deleteFoodByIdController = createController(
  DeleteFoodByIdRequestSchema,
  async (req, res) => {
    const result = await FoodService.deleteFoodById(
      new Types.ObjectId(req.params.id)
    );

    if (!result) {
      res.json(new BackendError("NOT_FOUND", { message: "Food not found" }));
      return;
    }
    res.json({ data: result });
  }
);

// Get Foods By Category Controller
const GetFoodsByCategoryRequestSchema = z.object({
  params: z.object({
    category: z.string(),
  }),
});

export const getFoodsByCategoryController = createController(
  GetFoodsByCategoryRequestSchema,
  async (req, res) => {
    const result = await FoodService.getFoodsByCategory(req.params.category);
    res.json({ data: result });
  }
);

// Get Foods By Restaurant Controller
const GetFoodsByRestaurantRequestSchema = z.object({
  params: z.object({
    restaurantId: ObjectIdSchema,
  }),
});

export const getFoodsByRestaurantController = createController(
  GetFoodsByRestaurantRequestSchema,
  async (req, res) => {
    const result = await FoodService.getFoodsByRestaurant(
      new Types.ObjectId(req.params.restaurantId)
    );
    res.json({ data: result });
  }
);

// Define the schema for the request
const QueryFoodsNearbyRequestSchema = z.object({
  query: z.object({
    longitude: z.string().refine((val) => !isNaN(Number(val)), {
      message: "Longitude must be a number",
    }),
    latitude: z.string().refine((val) => !isNaN(Number(val)), {
      message: "Latitude must be a number",
    }),
    maxDistance: z.string().refine((val) => !isNaN(Number(val)), {
      message: "Max distance must be a number",
    }),
    "dietaryPreferences.vegan": z.string().optional(),
    "dietaryPreferences.vegetarian": z.string().optional(),
    "dietaryPreferences.glutenFree": z.string().optional(),
    "dietaryPreferences.nutFree": z.string().optional(),
    "dietaryPreferences.sesame": z.string().optional(),
    "dietaryPreferences.halal": z.string().optional(),
    "dietaryPreferences.kosher": z.string().optional(),
    "dietaryPreferences.mediterranean": z.string().optional(),
    "dietaryPreferences.carnivore": z.string().optional(),
    "dietaryPreferences.keto": z.string().optional(),
    "dietaryPreferences.lowCarb": z.string().optional(),
    "dietaryPreferences.paleo": z.string().optional(),
    "allergies.milk": z.string().optional(),
    "allergies.egg": z.string().optional(),
    "allergies.wheat": z.string().optional(),
    "allergies.soy": z.string().optional(),
    "allergies.fish": z.string().optional(),
    "allergies.peanuts": z.string().optional(),
    "allergies.treeNuts": z.string().optional(),
    healthRatingMin: z.string().optional(),
    healthRatingMax: z.string().optional(),
    tasteRatingMin: z.string().optional(),
    tasteRatingMax: z.string().optional(),
    caloriesKcalMin: z.string().optional(),
    caloriesKcalMax: z.string().optional(),
    name: z.string().optional(),
    itemType: z.string().optional(),
    limit: z.string().optional(),
    skip: z.string().optional(),
    restaurantIds: z.string().optional(), // Add restaurant filter support
  }),
});

interface RangeFilter {
  min?: number;
  max?: number;
}

// Create the controller
export const queryFoodsNearbyController = createController(
  QueryFoodsNearbyRequestSchema,
  async (req, res) => {
    const {
      longitude,
      latitude,
      maxDistance,
      healthRatingMin,
      healthRatingMax,
      tasteRatingMin,
      tasteRatingMax,
      caloriesKcalMin,
      caloriesKcalMax,
      name,
      itemType,
      limit = 40,
      skip,
      restaurantIds,

      ...rest
    } = req.query;

    const filters: Record<string, string> = rest;

    // Convert string query parameters to appropriate types
    const coordinates: [number, number] = [
      parseFloat(longitude),
      parseFloat(latitude),
    ];
    const maxDist = parseInt(maxDistance, 10);

    console.log("🔍 Backend: Received query parameters:", {
      longitude,
      latitude,
      maxDistance,
      coordinates,
      maxDist,
      limit
    });

    // First, let's check if there are any restaurants in the database at all
    try {
      console.log("🔍 Backend: Testing Restaurant model...");
      console.log("🔍 Backend: Restaurant model:", Restaurant);
      
      const totalRestaurants = await Restaurant.countDocuments();
      console.log("📊 Backend: Total restaurants in database:", totalRestaurants);
      
      if (totalRestaurants > 0) {
        const sampleRestaurant = await Restaurant.findOne();
        console.log("🏪 Backend: Sample restaurant:", {
          name: sampleRestaurant?.name,
          location: sampleRestaurant?.location,
          menuCount: sampleRestaurant?.menu?.length
        });
        
        // Test a simple find query
        const allRestaurants = await Restaurant.find().limit(5);
        console.log("🏪 Backend: First 5 restaurants:", allRestaurants.map(r => ({
          name: r.name,
          location: r.location,
          menuCount: r.menu?.length
        })));
      }
    } catch (err) {
      console.error("❌ Backend: Error checking restaurants:", err);
      console.error("❌ Backend: Error details:", err instanceof Error ? err.message : 'Unknown error');
    }

    const healthRatingRange: RangeFilter = {
      min: healthRatingMin ? parseFloat(healthRatingMin) : undefined,
      max: healthRatingMax ? parseFloat(healthRatingMax) : undefined,
    };

    const tasteRatingRange: RangeFilter = {
      min: tasteRatingMin ? parseFloat(tasteRatingMin) : undefined,
      max: tasteRatingMax ? parseFloat(tasteRatingMax) : undefined,
    };

    const caloriesKcalRange: RangeFilter = {
      min: caloriesKcalMin ? parseFloat(caloriesKcalMin) : undefined,
      max: caloriesKcalMax ? parseFloat(caloriesKcalMax) : undefined,
    };

    // Convert filter values to boolean where applicable
    const booleanFilters: { [key: string]: boolean } = Object.keys(
      filters
    ).reduce((acc, key) => {
      if (filters[key] === "true" || filters[key] === "false") {
        acc[key] = filters[key] === "true";
      }
      return acc;
    }, {} as { [key: string]: boolean });

    console.log("🚀 Backend: Calling FoodService.queryFoodsNearby with:", {
      coordinates,
      maxDistance: maxDist,
      limit: limit ? +limit : undefined,
      skip: skip ? +skip : undefined,
    });

    // Parse restaurant IDs if provided
    const restaurantIdsArray = restaurantIds 
      ? restaurantIds.split(',').map(id => id.trim()).filter(Boolean)
      : undefined;

    console.log("🍽️ Backend: Restaurant filter:", {
      restaurantIds,
      restaurantIdsArray,
      hasRestaurantFilter: !!restaurantIdsArray?.length
    });

    const result = await FoodService.queryFoodsNearby({
      limit: limit ? +limit : undefined,
      skip: skip ? +skip : undefined,
      name,
      itemType,
      coordinates,
      maxDistance: maxDist,
      filters: booleanFilters,
      restaurantIds: restaurantIdsArray,
      healthRatingRange:
        healthRatingRange.min !== undefined ||
        healthRatingRange.max !== undefined
          ? healthRatingRange
          : undefined,
      tasteRatingRange:
        tasteRatingRange.min !== undefined || tasteRatingRange.max !== undefined
          ? tasteRatingRange
          : undefined,
      caloriesKcalRange:
        caloriesKcalRange.min !== undefined ||
        caloriesKcalRange.max !== undefined
          ? caloriesKcalRange
          : undefined,
    });

    // Handle both return types: empty array or paginated result object
    if (Array.isArray(result)) {
      console.log("✅ Backend: queryFoodsNearby result (empty array):", {
        resultLength: result.length
      });
      
      res.json({ 
        data: result,
        meta: {
          hasMore: false,
          totalItems: 0,
          currentPage: 1,
          totalPages: 0,
          itemsPerPage: limit ? +limit : 10
        }
      });
    } else {
    console.log("✅ Backend: queryFoodsNearby result:", {
      resultLength: result.items?.length || 0,
      totalItems: result.totalItems,
      hasMore: result.hasMore,
      firstItem: result.items && result.items.length > 0 ? {
        id: result.items[0]._id,
        name: result.items[0].name,
        restaurant: result.items[0].restaurant?.name
      } : null
    });
    
    res.json({ 
      data: result.items || [],
      meta: {
        hasMore: result.hasMore,
        totalItems: result.totalItems,
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        itemsPerPage: limit ? +limit : 10
      }
    });
    }
  }
);

const model = openai("gpt-4o-mini");

async function generateFiltersFromAI(userPrompt: string) {
  const configResult = await ConfigurationService.getAllConfigurations();

  const config: Record<string, string> = {};

  configResult.forEach((c) => {
    config[c.key] = c.value;
  });

  const prompt = `${
    config["AI_FILTER_GENERATION_PROMPT"] ||
    "Generate filters for food search based on the following input:"
  }
    

User Search Text:
${userPrompt}

`;

  consola.log("generateFiltersFromAI prompt: ", prompt);

  const response = await generateObject({
    model,
    schema: z.object({
      dietaryPreferences: DietaryPreferencesSchema.optional(),
      allergies: AllergiesSchema.optional(),
      healthRatingMin: z.number().nullable().optional(),
      healthRatingMax: z.number().nullable().optional(),
      tasteRatingMin: z.number().nullable().optional(),
      tasteRatingMax: z.number().nullable().optional(),
      caloriesKcalMin: z.number().nullable().optional(),
      caloriesKcalMax: z.number().nullable().optional(),
      foodName:z.string().nullable().optional(),
      itemType: z.enum(["Dessert", "Drink", "Main Meal"]).or(z.string()).optional(),

    }),
    prompt,
  });

  const { object } = response;

  const { dietaryPreferences, allergies, ...rest } = object;

  const booleanFiltersFromAi: Record<string, boolean> = {};

  Object.entries(dietaryPreferences||{}).forEach((pair) => {
    booleanFiltersFromAi["dietaryPreferences." + pair[0]] = pair[1];
  });

  Object.entries(allergies||{}).forEach((pair) => {
    booleanFiltersFromAi["allergies" + "." + pair[0]] = pair[1];
  });

  return { filtersFromAi: rest, booleanFiltersFromAi };
}

const SearchFoodsNearbyRequestSchema = QueryFoodsNearbyRequestSchema.extend({
  query: QueryFoodsNearbyRequestSchema.shape.query.extend({
    prompt: z.string(),
  }),
});

export const searchFoodsNearbyController = createController(
  SearchFoodsNearbyRequestSchema,
  async (req, res) => {
    const {
      prompt,
      longitude,
      latitude,
      maxDistance,
      healthRatingMin,
      healthRatingMax,
      tasteRatingMin,
      tasteRatingMax,
      caloriesKcalMin,
      caloriesKcalMax,
      name,
      itemType,
      limit = 40,
      skip,

      ...rest
    } = req.query;

    const filters: Record<string, string> = rest;

    const { booleanFiltersFromAi, filtersFromAi } = await generateFiltersFromAI(
      prompt
    );

    consola.log({booleanFiltersFromAi})
    consola.log({filtersFromAi})

    // Convert string query parameters to appropriate types
    const coordinates: [number, number] = [
      parseFloat(longitude),
      parseFloat(latitude),
    ];
    const maxDist = parseInt(maxDistance, 10);


    const healthRatingRange: RangeFilter = {
      min: healthRatingMin
        ? parseFloat(healthRatingMin)
        : filtersFromAi.healthRatingMin
        ? filtersFromAi.healthRatingMin
        : undefined,
      max: healthRatingMax
        ? parseFloat(healthRatingMax)
        : filtersFromAi.healthRatingMax
        ? filtersFromAi.healthRatingMax
        : undefined,
    };

    const tasteRatingRange: RangeFilter = {
      min: tasteRatingMin
        ? parseFloat(tasteRatingMin)
        : filtersFromAi.tasteRatingMin
        ? filtersFromAi.tasteRatingMin
        : undefined,
      max: tasteRatingMax
        ? parseFloat(tasteRatingMax)
        : filtersFromAi.tasteRatingMax
        ? filtersFromAi.tasteRatingMax
        : undefined,
    };

    const caloriesKcalRange: RangeFilter = {
      min: caloriesKcalMin
        ? parseFloat(caloriesKcalMin)
        : filtersFromAi.caloriesKcalMin
        ? filtersFromAi.caloriesKcalMin
        : undefined,
      max: caloriesKcalMax
        ? parseFloat(caloriesKcalMax)
        : filtersFromAi.caloriesKcalMax
        ? filtersFromAi.caloriesKcalMax
        : undefined,
    };

    // Convert filter values to boolean where applicable
    const booleanFilters: { [key: string]: boolean } = Object.keys(
      filters
    ).reduce((acc, key) => {
      if (filters[key] === "true" || filters[key] === "false") {
        acc[key] = filters[key] === "true";
      }
      return acc;
    }, {} as { [key: string]: boolean });

    // res.json({booleanFilters})
    // return

    const result = await FoodService.queryFoodsNearby({
      limit: limit ? +limit : undefined,
      skip: skip ? +skip : undefined,
      name:filtersFromAi.foodName || name,
      itemType:filtersFromAi.itemType || itemType,
      coordinates,
      maxDistance: maxDist,
      filters: {...booleanFiltersFromAi,...booleanFilters},
      healthRatingRange:
        healthRatingRange.min !== undefined ||
        healthRatingRange.max !== undefined
          ? healthRatingRange
          : undefined,
      tasteRatingRange:
        tasteRatingRange.min !== undefined || tasteRatingRange.max !== undefined
          ? tasteRatingRange
          : undefined,
      caloriesKcalRange:
        caloriesKcalRange.min !== undefined ||
        caloriesKcalRange.max !== undefined
          ? caloriesKcalRange
          : undefined,
    });

    res.json({ data: result });
  }
);

// Compare Foods Controller (GET request with query parameters)
const CompareFoodsRequestSchema = z.object({
  query: z.object({
    foodIds: z
      .string()
      .refine((val) => val.split(",").length >= 2, {
        message: "At least two food IDs are required for comparison",
      })
      .refine(
        (val) => val.split(",").every((id) => Types.ObjectId.isValid(id)),
        {
          message: "All food IDs must be valid ObjectId strings",
        }
      ),
  }),
});

export const compareFoodsController = createController(
  CompareFoodsRequestSchema,
  async (req, res) => {
    const foodIds = req.query.foodIds
      .split(",")
      .map((id) => new Types.ObjectId(id));

    const foods = await FoodService.getFoodsByIds(foodIds);

    if (!foods || foods.length < 2) {
      res.json(
        new BackendError("NOT_FOUND", {
          message: "Not enough food items found for comparison",
        })
      );
      return;
    }

    res.json({ data: foods });
  }
);
