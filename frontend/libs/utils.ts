import { type ClassValue, clsx } from "clsx";
import { differenceInDays } from "date-fns";
import { twMerge } from "tailwind-merge";
import {
  IAllMeals,
  IHours,
  IMeal,
  ISingleMeal,
} from "./endpoints/meals/meals-schema";
import { INearByRestaurant } from "./endpoints/restaurants/reastaurants-schema";
import { ILocation } from "./types/common";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getIsProduction = () => {
  if (process && process.env.NODE_ENV === "development") {
    return false;
  }

  return true;
};

export function shortenString(str: string, maxLength: number = 10) {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength - 3) + "...";
}

export function getDaysArray(start: string, end: string) {
  const daysArray = [];
  let currentDate = new Date(start);
  const endDate = new Date(end);

  while (currentDate <= endDate) {
    const dayObj = {
      label: currentDate.toLocaleString("en-US", { weekday: "short" }),
      day: currentDate.getDate().toString(),
      month: currentDate.toLocaleString("en-US", { month: "short" }),
      year: currentDate.getFullYear().toString(),
    };
    daysArray.push(dayObj);

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return daysArray;
}
export function getLast30Days() {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString();

    dates.push({
      label: date.toLocaleString("en-US", { weekday: "short" }),
      day,
      month,
      year,
    });
  }

  return dates.reverse();
}

export function fixPrice(price: number | undefined) {
  if (!price) return;
  return `${(price / 100).toFixed(2)}`;
}

export function calculatePercentage(amount: number | undefined, total: number) {
  if (total === 0 || !amount) {
    return 0;
  }
  if (amount > total) {
    return 100;
  }
  return (amount / total) * 100;
}

export function timezoneOffset() {
  const timezoneOffsetInMinutes = new Date().getTimezoneOffset();
  const hours = Math.floor(Math.abs(timezoneOffsetInMinutes) / 60);
  const minutes = Math.abs(timezoneOffsetInMinutes) % 60;
  const sign = timezoneOffsetInMinutes <= 0 ? "+" : "-";

  // Format to "HH:MM" or "-HH:MM"
  const timezoneOffset = `${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  return timezoneOffset;
}

export function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function hasOneDayPassed(dateString: string) {
  const givenDate = new Date(dateString);
  const currentDate = new Date();

  // Check if the difference in days is 1 or more
  return differenceInDays(currentDate, givenDate) >= 1;
}

export function isObjectEmpty(obj: object) {
  return Object.keys(obj).length === 0;
}

export const calculateAge = (dateOfBirth: string): number => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const isBirthdayPassed =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate());

  if (!isBirthdayPassed) {
    age -= 1;
  }

  return age;
};

const calculateNutrients = (
  weight: number,
  height: number,
  age: number,
  gender: "male" | "female",
  activityLevel:
    | "sedentary"
    | "lightly_active"
    | "moderately_active"
    | "very_active"
    | "super_active",
  weightUnit: "kg" | "lb",
  heightUnit: "cm" | "ft",
) => {
  const weightInKg = weightUnit === "lb" ? weight * 0.453592 : weight;
  const heightInCm = heightUnit === "ft" ? height * 30.48 : height;

  const bmr =
    gender === "male"
      ? 10 * weightInKg + 6.25 * heightInCm - 5 * age + 5
      : 10 * weightInKg + 6.25 * heightInCm - 5 * age - 161;

  const activityMultiplier = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    super_active: 1.9,
  }[activityLevel];

  const tdee = bmr * activityMultiplier;

  const carbsCalories = tdee * 0.55;
  const fatsCalories = tdee * 0.25;
  const proteinCalories = tdee * 0.2;

  return {
    calories: tdee,
    carbohydrates: carbsCalories / 4,
    fats: fatsCalories / 9,
    proteins: proteinCalories / 4,
  };
};

export function isToday(dateString: string) {
  const entryDate = new Date(dateString);
  const today = new Date();

  return (
    entryDate.getFullYear() === today.getFullYear() &&
    entryDate.getMonth() === today.getMonth() &&
    entryDate.getDate() === today.getDate()
  );
}

export const resizeImage = (file: File, maxSize: number): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const scaleFactor = Math.sqrt(maxSize / file.size);

        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;

        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(new File([blob], file.name, { type: file.type }));
              } else {
                reject(new Error("Image resizing failed"));
              }
            },
            file.type,
            0.8, // Adjust quality
          );
        } else {
          reject(new Error("Canvas context is not available"));
        }
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.onerror = () => reject(new Error("File reading failed"));
    reader.readAsDataURL(file);
  });
};

export function removeParentheses(text: string) {
  return text.replace(/\s*\(.*?\)\s*/g, "").trim();
}

export function mapMealToISingleMeal(
  mealDetails: IMeal | null,
  restaurant: INearByRestaurant | IAllMeals | null | undefined,
): ISingleMeal {
  return {
    id: mealDetails?._id || "",
    name: mealDetails?.name || "",
    healthRating: mealDetails?.reviewSummary?.averageHealthRating || 0,
    tasteRating: mealDetails?.reviewSummary?.averageTasteRating || 0,
    link: mealDetails?.link || "",
    image: mealDetails?.image || "",
    calories: String(mealDetails?.nutritionalInformation?.caloriesKcal || ""),
    price: String(fixPrice(mealDetails?.price) || ""),
    itemType: mealDetails?.itemType || "",
    category: mealDetails?.category || [""],
    dietaryPreferences: mealDetails?.dietaryPreferences,
    nutritionalInformation: mealDetails?.nutritionalInformation,
    allergies: mealDetails?.allergies,
    restaurant: {
      id: restaurant?._id || "",
      name: restaurant?.name || "",
      image: restaurant?.heroUrl || "",
      type: restaurant?.cuisineType?.join(", ") || "",
      location: restaurant?.location,
      description: restaurant?.description || "",
      heroUrl: restaurant?.heroUrl || "",
    },
  };
}

const getDayName = (date: Date) => {
  return date.toLocaleDateString("en-US", { weekday: "long" });
};
const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const isInDayRange = (currentDay: string, dayRange: string) => {
  if (dayRange === "Every Day") return true;

  if (!dayRange.includes("-")) {
    return currentDay === dayRange;
  }
  const [start, end] = dayRange.split("-").map((d) => d.trim());
  const startIndex = daysOfWeek.indexOf(start);
  const endIndex = daysOfWeek.indexOf(end);
  const currentIndex = daysOfWeek.indexOf(currentDay);

  if (startIndex <= endIndex) {
    return currentIndex >= startIndex && currentIndex <= endIndex;
  }
  return currentIndex >= startIndex || currentIndex <= endIndex;
};

interface SectionHours {
  startTime: number;
  endTime: number;
  sectionTitle?: string;
  _id?: string;
}

interface Schedule {
  dayRange: string;
  sectionHours: SectionHours[];
  _id?: string;
}

export const isRestaurantOpen = (
  hoursData: Schedule[],
  currentDate = new Date(),
) => {
  const currentMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();
  const currentDay = getDayName(currentDate);

  const applicableSchedule = hoursData.find((schedule) =>
    isInDayRange(currentDay, schedule.dayRange),
  );

  if (!applicableSchedule) {
    return false;
  }

  return applicableSchedule.sectionHours.some((section) => {
    const { startTime, endTime } = section;

    if (endTime < startTime) {
      return currentMinutes >= startTime || currentMinutes <= endTime;
    }

    return currentMinutes >= startTime && currentMinutes <= endTime;
  });
};

// Helper function to format time for display
// const formatTime = (minutes) => {
//   const hours = Math.floor(minutes / 60);
//   const mins = minutes % 60;
//   const period = hours >= 12 ? 'PM' : 'AM';
//   const formattedHours = hours % 12 || 12;
//   return `${formattedHours}:${mins.toString().padStart(2, '0')} ${period}`;
// };

// // Function to get opening hours string
// const getOpeningHours = (hoursData) => {
//   return hoursData.map(schedule => {
//     const hours = schedule.sectionHours.map(section =>
//       `${formatTime(section.startTime)} - ${formatTime(section.endTime)}`
//     ).join(', ');
//     return `${schedule.dayRange}: ${hours}`;
//   }).join('\n');
// };

export const haversineDistance = (coords1: ILocation, coords2: ILocation) => {
  const R = 6371000; // Radius of the Earth in meters
  const toRad = (angle: number) => (angle * Math.PI) / 180;
  const dLat = toRad(coords2.lat - coords1.lat);
  const dLon = toRad(coords2.lng - coords1.lng);

  const lat1 = toRad(coords1.lat);
  const lat2 = toRad(coords2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
