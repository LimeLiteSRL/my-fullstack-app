import React from "react";

import { IDietaryPreferences } from "@/libs/endpoints/meals/meals-schema";
import { cn } from "@/libs/utils";
import { DIETARY_PREFERENCES } from "@/libs/constants/ditary-preferences";

const DietaryPreferenceItems = ({
  dietaryPreferences,
  isLarge = false,
  count = 5,
  className,
  iconSize = 6,
}: {
  dietaryPreferences: IDietaryPreferences;
  isLarge?: boolean;
  count?: number;
  className?: string;
  iconSize?: number;
}) => {
  // Halal
  // Vegetarian
  // Ketogenic
  // Vegan
  // Kosher

  const truePreferences = Object.entries(dietaryPreferences)
    .filter(([key, value]) => value && key in DIETARY_PREFERENCES)
    .slice(0, count)
    .map(([key]) => key as keyof typeof DIETARY_PREFERENCES);

  if (isLarge) {
    return (
      <div
        className={cn("my-1 flex flex-wrap items-center gap-3 overflow-hidden")}
      >
        {truePreferences.map((key) => (
          <div
            className="flex h-[80px] w-[85px] shrink-0 flex-col items-center justify-center rounded-[20px] border border-offWhite text-heavy"
            key={key}
          >
            {DIETARY_PREFERENCES[key].icon}
            <div className="text-xs">{DIETARY_PREFERENCES[key].title}</div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div
      className={cn("my-1 flex items-center gap-2 overflow-hidden", className)}
    >
      {truePreferences.map((key) => (
        <span className="w-fit" key={key}>
          {React.cloneElement(DIETARY_PREFERENCES[key].icon, {
            className: iconSize ? `size-${iconSize}` : "",
          })}
        </span>
      ))}
    </div>
  );
};

export default DietaryPreferenceItems;

// {
//   "allergies": {
//     "milk": false,
//     "egg": true,
//     "wheat": true,
//     "soy": false,
//     "fish": false,
//     "peanuts": false,
//     "treeNuts": false
//   },
//   "dietaryPreferences": {
//     "glutenFree": false,
//     "nutFree": true,
//     "sesame": false,
//     "vegan": false,
//     "vegetarian": false,
//     "halal": false,
//     "kosher": false,
//     "mediterranean": false,
//     "carnivore": true,
//     "keto": false,
//     "lowCarb": false,
//     "paleo": false
//   },
//   "_id": "672b770331d6fd6ef498b7d7",
//   "name": "Chicken Katsu",
//   "category": [
//     "€€",
//     "Hawaiian",
//     "BBQ",
//     "Comfort Food",
//     "Asian",
//     "Asian Fusion"
//   ],
//   "price": 6999,
//   "description": "Chicken Katsu is a delicious Japanese dish featuring breaded and deep-fried chicken cutlets, served with a tangy sauce. It's a satisfying meal that provides a good balance of protein and carbohydrates, though it is higher in calories and fat due to the frying process.",
//   "gallery": [],
//   "nutritionalInformation": {
//     "caloriesKcal": 400,
//     "totalFatGrams": 20,
//     "saturatedFatGrams": 5,
//     "totalCarbsGrams": 40,
//     "sugarsGrams": 2,
//     "dietaryFiberGrams": 2,
//     "proteinGrams": 25,
//     "sodiumMg": 800,
//     "cholesterolMg": 70,
//     "potassiumMg": 600,
//     "vitaminAMg": 100,
//     "vitaminCMg": 2,
//     "calciumMg": 20,
//     "ironMg": 1.5,
//     "polyunsaturatedFatGrams": 5,
//     "transFatGrams": 0,
//     "monounsaturatedFatGrams": 10,
//     "_id": "672b770331d6fd6ef498b7d8"
//   },
//   "healthRating": 3.5,
//   "itemType": "Main Meal",
//   "createdAt": "2024-11-06T14:02:43.235Z",
//   "__v": 0
// }
