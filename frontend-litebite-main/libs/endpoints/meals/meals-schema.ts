import { z } from "zod";

export const QuerySchema = z.object({
  dietaryPreferences: z
    .object({
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
    })
    .optional(),
  nutritionalInformation: z
    .object({
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
    })
    .optional(),
});

export const AllergiesQuerySchema = z.object({
  milk: z.boolean().optional(),
  egg: z.boolean().optional(),
  wheat: z.boolean().optional(),
  soy: z.boolean().optional(),
  fish: z.boolean().optional(),
  peanuts: z.boolean().optional(),
  treeNuts: z.boolean().optional(),
});

///////////////////// ## data schema ## /////////////////////////

export const LocationSchema = z.object({
  type: z.string(),
  coordinates: z.array(z.number()), // Expecting two numbers in the array
});
export type IRestaurantLocation = z.infer<typeof LocationSchema>;

const AllergiesSchema = z.object({
  milk: z.boolean(),
  egg: z.boolean(),
  wheat: z.boolean(),
  soy: z.boolean(),
  fish: z.boolean(),
  peanuts: z.boolean(),
  treeNuts: z.boolean(),
});

export type IAllergies = z.infer<typeof AllergiesSchema>;

const DietaryPreferencesSchema = z.object({
  vegan: z.boolean(),
  halal: z.boolean(),
  kosher: z.boolean(),
  keto: z.boolean(),
  vegetarian: z.boolean(),
  glutenFree: z.boolean(),
  nutFree: z.boolean(),
  sesame: z.boolean(),
  mediterranean: z.boolean(),
  carnivore: z.boolean(),
  lowCarb: z.boolean(),
  paleo: z.boolean(),
});

export type IDietaryPreferences = z.infer<typeof DietaryPreferencesSchema>;

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

// Review Zod DTO
export const ReviewDTOSchema = z.object({
  _id: z.string().optional(),
  user: z.string().optional(),
  userName: z.string().optional(),
  food: z.string().optional(),
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
  createdAt: z.string().optional(),
});
export type IReviewDTO = z.infer<typeof ReviewDTOSchema>;

const ReviewSummarySchema = z.object({
  votesSummary: z.object({
    calories: z.number(),
    carbs: z.number(),
    protein: z.number(),
  }),
  averageHealthRating: z.number(),
  averageTasteRating: z.number(),
  totalReviews: z.number(),
  totalComments: z.number(),
});

const HoursSchema = z.object({
  dayRange: z.string().optional(),
  sectionHours: z.array(
    z.object({
      startTime: z.number().optional(),
      endTime: z.number().optional(),
      sectionTitle: z.string().optional(),
    }),
  ),
  _id: z.string().optional(),
});

export type IHours = z.infer<typeof HoursSchema>;

export const MealSchema = z.object({
  allergies: AllergiesSchema.optional(),
  dietaryPreferences: DietaryPreferencesSchema.optional(),
  nutritionalInformation: NutritionalInformationSchema.optional(),
  _id: z.string(),
  name: z.string().nullable(),
  description: z.string().nullable().optional(),
  category: z.array(z.string()).optional(),
  price: z.number().optional(),
  availability: z.string().nullable().optional(),
  link: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  servingSize: z.string().or(z.number()).nullable().optional(),
  healthRating: z.number().nullable().optional(),
  tasteRating: z.number().nullable().optional(),
  itemType: z.string().nullable().optional(),
  __v: z.number(),
  createdAt: z.string(),
  gallery: z.array(z.string()).optional(),
  reviews: z.array(z.any()).optional(),
  reviewSummary: ReviewSummarySchema.optional(),
});

export type IMeal = z.infer<typeof MealSchema>;

export const AllMealsSchema = z.object({
  location: LocationSchema,
  _id: z.string(),
  name: z.string(),
  url: z.string().nullable(),
  cuisineType: z.array(z.string()).nullable(),
  telephone: z.string().nullable().optional(),
  rating: z.number().nullable().optional(),
  reviewCount: z.number().nullable().optional(),
  menu: z.array(MealSchema),
  description: z.string().nullable().optional(),
  heroUrl: z.string().nullable().optional(),
  logo: z.string().nullable().optional(),
  street: z.string().optional(),
  confidence: z.number().optional(),
  openingHours: z.array(HoursSchema),
  __v: z.number().optional(),
});
export type IAllMeals = z.infer<typeof AllMealsSchema>;

export interface ISingleMeal {
  id: string;
  name: string;
  image?: string;
  link?: string;
  healthRating?: number;
  tasteRating?: number;
  calories: string;
  price: string;
  itemType: string;
  category: string[];
  dietaryPreferences?: IDietaryPreferences;
  nutritionalInformation?: INutritionalInformation;
  allergies?: IAllergies;
  restaurant: {
    id: string;
    name: string;
    image: string;
    type: string;
    location?: IRestaurantLocation;
    description?: string;
    heroUrl?: string;
    url?: string;
    telephone?: string;
    street?: string;
    logo?: string | null;
    openingHours?: any;
  };
}
