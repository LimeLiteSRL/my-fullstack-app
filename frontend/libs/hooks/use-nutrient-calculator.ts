import { useMemo, useState } from "react";
import useProfileStore from "../store/profile-store";
import { calculateAge } from "../utils";

type IActivity = "sedentary" | "light" | "moderate" | "active";

export const useNutrientCalculator = () => {
  const { user } = useProfileStore();

  const weightInKg =
    user?.weightUnit === "lb"
      ? (user.weight || 0) * 0.453592
      : user?.weight || 0;
  const heightInCm =
    user?.heightUnit === "in" ? (user.height || 0) * 30.48 : user?.height || 0;

  const bmiValue = useMemo(
    () => Number(weightInKg || 0) / (Number(heightInCm || 0) / 100) ** 2,
    [weightInKg, heightInCm],
  );

  const age = calculateAge(user?.dateOfBirth || "");

  const bmr =
    user?.gender === "male"
      ? 10 * weightInKg + 6.25 * heightInCm - 5 * age + 5
      : 10 * weightInKg + 6.25 * heightInCm - 5 * age - 161;

  const activityMultiplier = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
  }[user?.activityLevel || "moderate"];

  const tdee = bmr * activityMultiplier;

  const carbsCalories = tdee * 0.55;
  const fatsCalories = tdee * 0.25;
  const proteinCalories = tdee * 0.2;

  const fiber =
    age < 50
      ? user?.gender === "male"
        ? 38
        : 25
      : user?.gender === "male"
        ? 30
        : 21;

  const waterInLiters =
    isNaN(weightInKg * 0.033) || weightInKg * 0.033 < 0
      ? 0
      : (weightInKg * 0.033).toFixed(2);

  return {
    calories: tdee < 0 || isNaN(tdee) ? 3000 : tdee.toFixed(0),
    carbohydrates:
      carbsCalories / 4 < 0 || isNaN(carbsCalories / 4)
        ? 400
        : (carbsCalories / 4).toFixed(0),
    fats:
      fatsCalories / 9 < 0 || isNaN(fatsCalories / 9)
        ? 80
        : (fatsCalories / 9).toFixed(0),
    proteins:
      proteinCalories / 4 < 0 || isNaN(proteinCalories / 4)
        ? 90
        : (proteinCalories / 4).toFixed(0),
    bmiValue: isNaN(bmiValue) ? 0 : bmiValue,
    fiber,
    waterInLiters,
  };
};
