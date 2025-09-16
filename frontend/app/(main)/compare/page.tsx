/* eslint-disable @next/next/no-img-element */
"use client";

import FilterComponent from "@/components/filters-search/filter-component";
import {
  CancelIcon,
  FilterVerticalIcon,
  FoodIcon,
  SearchIcon,
} from "@/components/icons/icons";
import MealCard from "@/components/meals/meal-card";
import { Button } from "@/components/ui/button";
import { MENULIST } from "@/libs/constants/menu";
import { mealsHook } from "@/libs/endpoints/meals/meals-endpoints";
import { ISingleMeal } from "@/libs/endpoints/meals/meals-schema";
import useNearbyMeals from "@/libs/hooks/use-nearby-meals";
import { Routes } from "@/libs/routes";
import useFilterStore from "@/libs/store/filters-store";
import { fixPrice, shortenString } from "@/libs/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";


type ITabs = "All" | "Drink" | "Dessert";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const firstMealId = searchParams.get("id");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMenu, setSelectedMenu] = useState<ITabs>("All");
  const { meals, isLoading } = useNearbyMeals(searchTerm);
  const [filteredMeals, setFilteredMeals] = useState<ISingleMeal[]>(meals);
  const [meal, setMeal] = useState<ISingleMeal>();

  useEffect(() => {
    if (selectedMenu === "Drink") {
      setFilteredMeals(meals.filter((meal) => meal.itemType === "Drink"));
    } else if (selectedMenu === "Dessert") {
      setFilteredMeals(meals.filter((meal) => meal.itemType === "Dessert"));
    } else {
      setFilteredMeals(meals);
    }
  }, [selectedMenu, meals]);

  const { data, isLoading: isMealLoading } = mealsHook.useQuerySingleMeal({
    params: {
      id: firstMealId || "",
    },
  });

  const { data: restaurant } = mealsHook.useQueryRestaurantsOfMeal({
    params: {
      foodId: firstMealId || "",
    },
  });

  useEffect(() => {
    const mealDetails = data?.data;
    if (mealDetails) {
      const result: ISingleMeal = {
        id: mealDetails?._id,
        name: mealDetails?.name || "",
        healthRating: mealDetails?.reviewSummary?.averageHealthRating || 0,
        tasteRating: mealDetails?.reviewSummary?.averageTasteRating || 0,
        link: mealDetails?.link || "",
        image: mealDetails?.image || "",
        calories: String(
          mealDetails?.nutritionalInformation?.caloriesKcal || "",
        ),
        price: String(fixPrice(mealDetails?.price) || ""),
        itemType: mealDetails?.itemType || "",
        category: mealDetails?.category || [""],
        dietaryPreferences: mealDetails?.dietaryPreferences,
        nutritionalInformation: mealDetails?.nutritionalInformation,
        allergies: mealDetails?.allergies,
        restaurant: {
          id: restaurant?.data?.[0]?._id || "",
          name: restaurant?.data?.[0]?.name || "",
          logo: restaurant?.data?.[0]?.logo || "",
          type: restaurant?.data?.[0]?.cuisineType?.join(", ") || "",
          location: restaurant?.data?.[0]?.location,
          description: restaurant?.data?.[0]?.description || "",
          image: restaurant?.data?.[0]?.heroUrl || "",
        },
      };
      setMeal(result);
    }
  }, [data?.data, restaurant?.data]);

  const handleCompare = (mealId: string) => {
    router.push(Routes.Compare + `/result?first=${firstMealId}&last=${mealId}`);
  };
  const { setIsFilterVisible, isFilterVisible } = useFilterStore();

  return (
    <div className="bg-neutral-100 p-4">
      {isMealLoading ? (
        <MealCard isLoading />
      ) : (
        meal && (
          <MealCard
            handleMealClicked={() =>
              router.push(Routes.Meals + `?id=${meal.id}`)
            }
            className="w-full"
            meal={meal}
          />
        )
      )}
      <div className="my-6 flex items-center justify-between">
        <div className="text-xl font-semibold">Choose a Meal to Compare</div>
        <button
          onClick={() => router.back()}
          className="flex size-10 items-center justify-center rounded-full bg-neutral-100"
        >
          <CancelIcon className="size-6 text-heavy" />
        </button>
      </div>
      <div className="flex items-center justify-center gap-2">
        {MENULIST.map((menu) => (
          <Button
            variant={
              selectedMenu.includes(menu.value as ITabs) ? "secondary" : "light"
            }
            key={menu.value}
            className="flex flex-1 items-center gap-1"
            onClick={() => setSelectedMenu(menu.value as ITabs)}
          >
            {menu.icon}
            {menu.label}
          </Button>
        ))}
      </div>
      <div className="mt-4 flex w-full items-center gap-3">
        <SearchField setText={setSearchTerm} text={searchTerm} />
        <button
          onClick={() => setIsFilterVisible(!isFilterVisible)}
          className="flex h-[45px] w-[45px] shrink-0 items-center justify-center rounded-full border border-secondary"
          id="filter-button"
        >
          <FilterVerticalIcon className="size-6 rotate-90 text-secondary" />
        </button>
      </div>
      <div className="my-6 text-lg font-medium">Top rated meals</div>
      <div className="grid grid-cols-2 justify-items-center gap-4">
        {isLoading
          ? [0, 1, 2, 3, 4, 5].map((meal) => (
              <MealCard
                isLoading
                variant="vertical"
                className="w-full"
                key={meal}
              />
            ))
          : filteredMeals.map((meal, index) => {
              return (
                <MealCard
                  verticalButtonText="Compare"
                  verticalButtonAction={() => handleCompare(meal.id)}
                  className="w-full"
                  variant="vertical"
                  meal={meal}
                  key={meal.id}
                />
              );
            })}
      </div>
      <FilterComponent />
    </div>
  );
}

const SearchField = ({
  text,
  setText,
}: {
  text: string;
  setText: (val: string) => void;
}) => {
  return (
    <div className="flex w-full min-w-[200px] items-center gap-2 rounded-full border border-neutral-300 p-2">
      <SearchIcon className="size-6 text-neutral-300" />
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        type="text"
        autoComplete="off"
        className="w-full border-none bg-transparent font-light outline-none"
        placeholder="Search..."
      />
    </div>
  );
};
