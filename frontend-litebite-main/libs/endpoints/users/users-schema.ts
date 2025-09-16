import { z } from "zod";
import {
  MealSchema,
  NutritionalInformationSchema,
} from "../meals/meals-schema";

export const ProfileSchema = z.object({
  foodsEaten: z.array(z.string()),
  phone: z.string().nullable().optional(),
  phoneVerifiedAt: z.string().nullable().optional(),
  profilePicture: z.string().nullable().optional(),
  createdAt: z.string(),
  reviews: z.array(z.any()),
  __v: z.number().optional(),
  _id: z.string(),
  role: z.enum(["user", "admin"]).optional(),
  activityLevel: z
    .enum(["sedentary", "light", "moderate", "active"])
    .optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  height: z.number().optional(),
  name: z.string().optional(),
  targetDuration: z.number().optional(),
  targetWeight: z.number().optional(),
  weight: z.number().optional(),
  heightUnit: z.enum(["cm", "in"]).optional(),
  weightUnit: z.enum(["kg", "lb"]).optional(),
});

export type IUser = z.infer<typeof ProfileSchema>;

export const UserSettingsBodySchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  phone: z.string().nullable().optional(),
  profilePicture: z.string().optional(),
  age: z.number().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  weight: z.number().optional(),
  height: z.number().optional(),
  targetWeight: z.number().optional(),
  targetDuration: z.number().optional(),
  activityLevel: z
    .enum(["sedentary", "light", "moderate", "active"])
    .optional(),
  foodsEaten: z.array(z.any()).optional(),
  reviews: z.array(z.any()).optional(),
  role: z.string().optional(),
  phoneVerifiedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  heightUnit: z.string().optional(),
  weightUnit: z.string().optional(),
});

export type IUserSettingsBody = z.infer<typeof UserSettingsBodySchema>;

const NutritionalValuesSchema = z
  .object({
    caloriesKcal: z.number(),
    calciumMg: z.number(),
    cholesterolMg: z.number(),
    dietaryFiberGrams: z.number(),
    ironMg: z.number(),
    monounsaturatedFatGrams: z.number(),
    polyunsaturatedFatGrams: z.number(),
    potassiumMg: z.number(),
    proteinGrams: z.number(),
    saturatedFatGrams: z.number(),
    sodiumMg: z.number(),
    sugarsGrams: z.number(),
    totalCarbsGrams: z.number(),
    totalFatGrams: z.number(),
  })
  .partial();
export type INutritionalValues = z.infer<typeof NutritionalValuesSchema>;

const LastSevenDaysSchema = z.object({
  Friday: NutritionalInformationSchema.optional(),
  Thursday: NutritionalInformationSchema.optional(),
  Monday: NutritionalInformationSchema.optional(),
  Tuesday: NutritionalInformationSchema.optional(),
  Wednesday: NutritionalInformationSchema.optional(),
  Saturday: NutritionalInformationSchema.optional(),
  Sunday: NutritionalInformationSchema.optional(),
});

export type ILastSevenDays = z.infer<typeof LastSevenDaysSchema>;

const LastTwelveMonthsSchema = z.object({
  January: NutritionalInformationSchema.optional(),
  February: NutritionalInformationSchema.optional(),
  March: NutritionalInformationSchema.optional(),
  April: NutritionalInformationSchema.optional(),
  May: NutritionalInformationSchema.optional(),
  July: NutritionalInformationSchema.optional(),
  August: NutritionalInformationSchema.optional(),
  September: NutritionalInformationSchema.optional(),
  October: NutritionalInformationSchema.optional(),
  June: NutritionalInformationSchema.optional(),
  November: NutritionalInformationSchema.optional(),
  December: NutritionalInformationSchema.optional(),
});
export type ILastTwelveMonths = z.infer<typeof LastTwelveMonthsSchema>;

export const NutritionSchema = z.object({
  today: NutritionalValuesSchema,
  lastSevenDays: LastSevenDaysSchema,
  lastTwelveMonths: LastTwelveMonthsSchema,
});

export type INutritional = z.infer<typeof NutritionSchema>;

export const NotificationSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  type: z.enum(["food-review", "success", "error", "info", "warning"]),
  meta: z.string().optional(),
  isRead: z.boolean(),
  scheduledTime: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  __v: z.number(),
  title: z.string().optional(),
  description: z.string().optional(),
});

export type INotification = z.infer<typeof NotificationSchema>;

export const EatenFoodSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  foodId: z.string().optional(),
  dateEaten: z.string(),
  portionSize: z.number(),
  nutritionalInformation: NutritionalInformationSchema.optional(),
  __v: z.number(),
  food: MealSchema.nullable(),
  id: z.string(),
  source: z.enum(["AI", "Restaurant"]),
  foodName: z.string().optional(),
});

export const WaterIntakeSchema__ = z.object({
  _id: z.string(),
  userId: z.string(),
  date: z.string(),
  amountMl: z.number(),
  createdAt: z.string(),
  __v: z.any(),
});

const DailyThisWeekSchema = z
  .object({
    Sun: z.number().optional(),
    Mon: z.number().optional(),
    Tue: z.number().optional(),
    Wed: z.number().optional(),
    Thu: z.number().optional(),
    Fri: z.number().optional(),
    Sat: z.number().optional(),
  })
  .optional();

const MonthlySchema = z
  .object({
    Jan: z.number().optional(),
    Feb: z.number().optional(),
    Mar: z.number().optional(),
    Apr: z.number().optional(),
    May: z.number().optional(),
    Jun: z.number().optional(),
    Jul: z.number().optional(),
    Aug: z.number().optional(),
    Sep: z.number().optional(),
    Oct: z.number().optional(),
    Nov: z.number().optional(),
    Dec: z.number().optional(),
  })
  .optional();

export const WaterIntakeSchema = z.object({
  data: z.array(z.any()).optional(),
  today: z.number(),
  dailyThisWeek: DailyThisWeekSchema,
  monthly: MonthlySchema,
});

export type IWaterIntake = z.infer<typeof WaterIntakeSchema>;
