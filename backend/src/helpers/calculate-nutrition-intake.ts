import { addMinutes, format, subDays, subMonths, isToday } from "date-fns";
import {
  type IEatenFood,
  type IFoodNutritionalInformation,
} from "../models/models";

// Helper to convert timezone offset to minutes
const getOffsetInMinutes = (offset: string) => {
  const [hours = 0, minutes = 0] = offset.split(":").map(Number);
  const totalMinutes = hours * 60 + Math.sign(hours) * minutes;
  return totalMinutes;
};

// Define the type for the nutritional intake result
type NutritionalIntake = {
  [key in keyof IFoodNutritionalInformation]?: number;
};

export function calculateNutritionIntake(
  foodsEaten: IEatenFood[],
  nutritionKeys: (keyof IFoodNutritionalInformation)[],
  timezoneOffset: string = "00:00" // e.g., '+03:00', '-05:00'
) {
  // Initialize objects for today, last seven days, and last twelve months
  const today: NutritionalIntake = {};
  const lastSevenDays: Record<string, NutritionalIntake> = {};
  const lastTwelveMonths: Record<string, NutritionalIntake> = {};

  if (foodsEaten.length === 0) return { today, lastSevenDays, lastTwelveMonths };

  const offsetInMinutes = getOffsetInMinutes(timezoneOffset);
  foodsEaten.forEach((food) => {
    if (food.dateEaten) {
      const foodDate = new Date(food.dateEaten);
      const adjustedDate = addMinutes(foodDate, offsetInMinutes); // Adjust by timezone offset

      nutritionKeys.forEach((nutrition) => {
        if (food.nutritionalInformation?.[nutrition]) {
          // Aggregate nutrition for today
          if (isToday(adjustedDate)) {
            if (!today[nutrition]) {
              today[nutrition] = 0;
            }
            //@ts-ignore
            today[nutrition] += food.nutritionalInformation?.[nutrition] || 0;
          }

          // Calculate for the last seven days
          for (let i = 0; i < 7; i++) {
            const day = subDays(new Date(), i);
            const dayName = format(day, 'EEEE'); // Get the day name
            if (format(adjustedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')) {
              if (!lastSevenDays[dayName]) {
                lastSevenDays[dayName] = {};
              }
              if (!lastSevenDays[dayName][nutrition]) {
                lastSevenDays[dayName][nutrition] = 0;
              }
              //@ts-ignore
              lastSevenDays[dayName][nutrition] += food.nutritionalInformation?.[nutrition] || 0;
            }
          }

          // Calculate for the last twelve months
          for (let i = 0; i < 12; i++) {
            const month = subMonths(new Date(), i);
            const monthName = format(month, 'MMMM'); // Get the month name
            if (format(adjustedDate, 'yyyy-MM') === format(month, 'yyyy-MM')) {
              if (!lastTwelveMonths[monthName]) {
                lastTwelveMonths[monthName] = {};
              }
              if (!lastTwelveMonths[monthName][nutrition]) {
                lastTwelveMonths[monthName][nutrition] = 0;
              }
              //@ts-ignore
              lastTwelveMonths[monthName][nutrition] += food.nutritionalInformation?.[nutrition] || 0;
            }
          }
        }
      });
    }
  });

  return { today, lastSevenDays, lastTwelveMonths };
}