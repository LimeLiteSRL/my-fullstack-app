import { ObjectIdSchema } from "@/types";
import { z } from "zod";

// User Zod DTO
export const UserDTOSchema = z.object({
  id: ObjectIdSchema, // MongoDB _id field
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  profilePicture: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  weight: z.number().optional(),
  height: z.number().optional(),
  targetWeight: z.number().optional(),
  targetDuration: z.number().optional(), // in days
  activityLevel: z
    .enum(["sedentary", "light", "moderate", "active"])
    .optional(),
  foodsEaten: z.array(ObjectIdSchema).optional(), // Array of Food IDs as ObjectId
  reviews: z.array(ObjectIdSchema).optional(), // Array of Review IDs as ObjectId
  role: z.string().optional(),
  heightUnit: z.enum(["cm", "in"]).optional(),
  weightUnit: z.enum(["kg", "lb"]).optional(),
});

// Exporting the inferred TypeScript type for use
export type UserDTO = z.infer<typeof UserDTOSchema>;

// NutritionalInformation Zod Schema
export const NutritionalInformationSchema = z.object({
  caloriesKcal: z.number().optional(),
  totalFatGrams: z.number().optional(),
  saturatedFatGrams: z.number().optional(),
  totalCarbsGrams: z.number().optional(),
  sugarsGrams: z.number().optional(),
  dietaryFiberGrams: z.number().optional(),
  proteinGrams: z.number().optional(),
  sodiumMg: z.number().optional(),
  cholesterolMg: z.number().optional(),
  potassiumMg: z.number().optional(),
  vitaminAMg: z.number().optional(),
  vitaminCMg: z.number().optional(),
  calciumMg: z.number().optional(),
  ironMg: z.number().optional(),
  polyunsaturatedFatGrams: z.number().optional(),
  transFatGrams: z.number().optional(),
  monounsaturatedFatGrams: z.number().optional(),
});

export type INutritionalInformation = z.infer<
  typeof NutritionalInformationSchema
>;

// Allergies Zod Schema
export const AllergiesSchema = z.object({
  milk: z.boolean().optional(),
  egg: z.boolean().optional(),
  wheat: z.boolean().optional(),
  soy: z.boolean().optional(),
  fish: z.boolean().optional(),
  peanuts: z.boolean().optional(),
  treeNuts: z.boolean().optional(),
});

// DietaryPreferences Zod Schema
export const DietaryPreferencesSchema = z.object({
  glutenFree: z.boolean().optional(),
  nutFree: z.boolean().optional(),
  sesame: z.boolean().optional(),
  vegan: z.boolean().optional(),
  vegetarian: z.boolean().optional(),
  halal: z.boolean().optional(),
  kosher: z.boolean().optional(),
  mediterranean: z.boolean().optional(),
  carnivore: z.boolean().optional(),
  keto: z.boolean().optional(),
  lowCarb: z.boolean().optional(),
  paleo: z.boolean().optional(),
});

// Food Zod DTO
export const FoodDTOSchema = z.object({
  id: ObjectIdSchema, // MongoDB _id field
  name: z.string(),
  category: z.array(z.string()).optional(),
  price: z.number().optional(),
  description: z.string().optional(),
  availability: z.string().optional(),
  link: z.string().optional(),
  image: z.string().optional(),
  menuName: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  allergies: AllergiesSchema.optional(),
  dietaryPreferences: DietaryPreferencesSchema.optional(),
  servingSize: z.number().optional(),
  nutritionalInformation: NutritionalInformationSchema.optional(),
  healthRating: z.number().optional(),
  tasteRating: z.number().optional(),
  itemType: z.string().optional(),
  modifier: z.string().optional(),
  createdAt: z.date().optional(),
});

// Exporting the inferred TypeScript type for use
export type FoodDTO = z.infer<typeof FoodDTOSchema>;

// Location Zod Schema
const LocationSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.array(z.number()).length(2), // Coordinates array of length 2
});

// OpeningHours Zod Schema
const OpeningHoursSchema = z.object({
  dayRange: z.string().min(1, "Day range cannot be empty"),
  sectionHours: z.array(
    z.object({
      startTime: z
        .number()
        .min(0, "Start time must be a non-negative number")
        .max(23.59, "Start time must be a valid time in 24-hour format"),
      endTime: z
        .number()
        .min(0, "End time must be a non-negative number")
        .max(23.59, "End time must be a valid time in 24-hour format"),

      sectionTitle: z.string().min(1, "Section title cannot be empty"),
    })
  ),
});

// SocialMedia Zod Schema
const SocialMediaSchema = z.object({
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  tiktok: z.string().optional(),
  youtube: z.string().optional(),
});

// Main Restaurant Schema
export const RestaurantDTOSchema = z.object({
  name: z.string(),
  url: z.string().optional(),
  cuisineType: z.array(z.string()).optional(),
  priceRange: z.string().optional(),
  locality: z.string().optional(),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  street: z.string().optional(),
  location: LocationSchema,
  telephone: z.string().optional(),
  rating: z.number().optional(),
  reviewCount: z.number().optional(),
  menu: z.array(ObjectIdSchema).optional(),
  description: z.string().optional(),
  openingHours: z.array(OpeningHoursSchema),
  status: z.string().optional(),
  socialMedia: SocialMediaSchema.optional(),
  gallery: z.array(z.string()).optional(),
  heroUrl: z.string().optional(),
});

// Exporting the inferred TypeScript type for use
export type RestaurantDTO = z.infer<typeof RestaurantDTOSchema>;

// Review Zod DTO
export const ReviewDTOSchema = z.object({
  id: ObjectIdSchema, // MongoDB _id field
  user: ObjectIdSchema, // User ID
  food: ObjectIdSchema, // Food ID
  healthRating: z.number().optional(),
  tasteRating: z.number().optional(),
  comment: z.string().optional(),
  images: z.array(z.string()).optional(),
  votes: z
    .object({
      calories: z.number().optional(),
      carbs: z.number().optional(),
      protein: z.number().optional(),
    })
    .optional(),
  createdAt: z.date().optional(),
});

// Exporting the inferred TypeScript type for use
export type ReviewDTO = z.infer<typeof ReviewDTOSchema>;

// Water Intake Zod DTO
export const WaterIntakeDTOSchema = z.object({
  userId: ObjectIdSchema, // Reference to the user
  date: z.date().optional(), // Date of the water intake
  amountMl: z.number(), // Amount of water in milliliters
});

// Exporting the inferred TypeScript type for use
export type WaterIntakeDTO = z.infer<typeof WaterIntakeDTOSchema>;

// Configuration Zod DTO
export const ConfigurationDTOSchema = z.object({
  key: z.string(), // Unique key for the configuration setting
  value: z.any(), // Value of the configuration setting
  description: z.string().optional(), // Optional description of the setting
  updatedAt: z.date().optional(), // When the configuration was last updated
});

// Exporting the inferred TypeScript type for use
export type ConfigurationDTO = z.infer<typeof ConfigurationDTOSchema>;
