import { createController } from "@/create-controller";
import { BackendError } from "@/errors";
import { RestaurantDTOSchema } from "@/models/dto";

import * as RestaurantService from "@/services/restaurant-service";
import { ObjectIdSchema } from "@/types";
import consola from "consola";

import { z } from "zod";

// Define the request schema
const GetAllRestaurantsWithPaginationRequestSchema = z.object({
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

// Create the controller
export const getAllRestaurantsWithPaginationController = createController(
  GetAllRestaurantsWithPaginationRequestSchema,
  async (req, res) => {
    const { page, limit } = req.query;
    const result = await RestaurantService.getAllRestaurantsWithPagination(
      page,
      limit
    );
    res.json(result);
  }
);

const NewRestaurantRequestSchema = z.object({
  body: RestaurantDTOSchema.partial(),
});

export const createRestaurantController = createController(
  NewRestaurantRequestSchema,
  async (req, res) => {
    const result = await RestaurantService.createRestaurant(req.body);

    res.json({ data: result });
  }
);

const GetRestaurantByIdRequestSchema = z.object({
  params: z.object({
    id: ObjectIdSchema,
  }),
});

export const getRestaurantByIdController = createController(
  GetRestaurantByIdRequestSchema,
  async (req, res) => {
    const restaurantId = req.params.id;
    
    // Log the incoming request for debugging
    console.log(`🏪 Backend: Getting restaurant by ID: ${restaurantId}`);
    
    const result = await RestaurantService.getRestaurantById(restaurantId);

    if (!result) {
      console.warn(`🏪 Backend: Restaurant not found for ID: ${restaurantId}`);
      res.json(new BackendError("NOT_FOUND", { message: "Restaurant not found" }));
      return;
    }
    res.json({ data: result });
  }
);

const UpdateRestaurantByIdRequestSchema = z.object({
  params: z.object({
    id: ObjectIdSchema,
  }),
  body: z.object({
    updateData: RestaurantDTOSchema.partial(),
  }),
});

export const updateRestaurantByIdController = createController(
  UpdateRestaurantByIdRequestSchema,
  async (req, res) => {
    const result = await RestaurantService.updateRestaurantById(
      req.params.id,
      req.body.updateData
    );

    if (!result) {
      res.json(new BackendError("NOT_FOUND", { message: "Not found" }));
      return;
    }
    res.json({ data: result });
  }
);

const FindRestaurantsNearbyRequestSchema = z.object({
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
    // Optional pagination and filters to reduce payload size
    page: z
      .string()
      .optional()
      .refine((val) => (val === undefined ? true : !isNaN(Number(val))), {
        message: "Page must be a number",
      })
      .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z
      .string()
      .optional()
      .refine((val) => (val === undefined ? true : !isNaN(Number(val))), {
        message: "Limit must be a number",
      })
      .transform((val) => (val ? parseInt(val, 10) : 20)),
    name: z.string().optional(),
    cuisine: z.string().optional(),
    minRating: z
      .string()
      .optional()
      .refine((val) => (val === undefined ? true : !isNaN(Number(val))), {
        message: "minRating must be a number",
      })
      .transform((val) => (val ? parseFloat(val) : undefined)),
  }),
});

export const findRestaurantsNearbyController = createController(
  FindRestaurantsNearbyRequestSchema,
  async (req, res) => {
    const { latitude, longitude, maxDistance, name, page, limit, cuisine, minRating } = req.query;

    const coordinates: [number, number] = [
      parseFloat(longitude),
      parseFloat(latitude),
    ];    

    const maxDist = parseInt(maxDistance, 10);

    // Ask the service to return a paginated, lean payload with only needed fields
    const result = await RestaurantService.findRestaurantsNearby(
      coordinates,
      maxDist,
      {
        page,
        limit,
        filters: { name, cuisine, minRating },
        // Keep payload small: exclude heavy fields (e.g., full menu arrays)
        select: "name url locality region location heroUrl rating reviewSummary",
      }
    );

    // Set short-lived caching for list responses
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=60");
    res.json(result);
  }
);
