import { z } from "zod";
import { LocationSchema } from "../meals/meals-schema";

export const RestaurantSchema = z.object({
  location: LocationSchema,
  _id: z.string(),
  name: z.string(),
  url: z.string().nullable().optional(),
  cuisineType: z.array(z.string()).nullable().optional(),
  telephone: z.string().optional(),
  rating: z.number().nullable().optional(),
  reviewCount: z.number().nullable().optional(),
  menu: z.array(z.string()),
  description: z.string().nullable().optional(),
  heroUrl: z.string().nullable().optional(),
  logo: z.string().nullable().optional(),
  street: z.string().optional(),
  __v: z.number().optional(),
});

export type INearByRestaurant = z.infer<typeof RestaurantSchema>;
