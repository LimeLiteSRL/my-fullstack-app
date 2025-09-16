/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { cn, hasOneDayPassed, isRestaurantOpen } from "@/libs/utils";
import React, { useEffect, useRef } from "react";
import RestaurantDialog from "../restaurants/restaurant-dialog";
import useMealDetailsStore from "@/libs/store/meal-details-store";
import MealCard from "./meal-card";
import { usersHook } from "@/libs/endpoints/users/users-endpoints";
import RestaurantMealCarousel from "./restaurant-meal-carousel";
import useRestaurantMeal from "@/libs/hooks/use-restaurant-meals";
import { Skeleton } from "../ui/skeleton";
import { XIcon } from "lucide-react";

const MealRestaurantDataModal = () => {
  const {
    isMealDetailsOpen,
    handleCloseMealDetails,
    mealDetails,
    restaurantId,
    meals,
  } = useMealDetailsStore();

  // const { isLoading } = useRestaurantMeal(restaurantId || "");
  const mealDetailsRef = useRef<HTMLDivElement>(null);
  const { data, isLoading: loadingData } = usersHook.useQueryEatenMeals();
  const eatenFoods = data?.eatenFoods;

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (
        mealDetailsRef.current &&
        !mealDetailsRef.current.contains(event.target)
      ) {
        handleCloseMealDetails();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const eatenMeal = eatenFoods?.find(
    (item) => item?.foodId === mealDetails?.id,
  );

  const restaurant = !!restaurantId
    ? meals?.[0]?.restaurant
    : mealDetails?.restaurant;

  return (
    <div
      ref={mealDetailsRef}
      className={cn(
        "fixed right-1/2 top-8 z-50 w-[390px] translate-x-1/2 space-y-3 transition-transform duration-300 ease-in-out",
        isMealDetailsOpen ? "translate-y-0" : "-translate-y-[450px]",
      )}
    >
      <RestaurantDialog restaurant={restaurant} />
      {mealDetails && (
        <MealCard
          meal={mealDetails}
          variant="fullDetails"
          className="w-full"
          isMarked={!!eatenMeal && !hasOneDayPassed(eatenMeal.dateEaten)}
        />
      )}
      {meals && restaurantId && <RestaurantMealCarousel meals={meals} />}
    </div>
  );
};

export default MealRestaurantDataModal;

const LoadingSkeleton = () => {
  const { handleCloseMealDetails } = useMealDetailsStore();
  return (
    <div className="space-y-3">
      <div className="mx-auto max-w-sm rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-4 flex w-full items-center justify-between">
          <div></div>
          <Skeleton className="h-4 w-[120px]" />
          <button
            onClick={handleCloseMealDetails}
            className="flex items-center justify-center rounded-full bg-offWhite p-1"
          >
            <XIcon className="size-4 text-heavy" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-[68px] rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-[200px]" />
            <Skeleton className="h-3 w-[150px]" />
          </div>
        </div>
      </div>
      <MealCard isLoading />
    </div>
  );
};
