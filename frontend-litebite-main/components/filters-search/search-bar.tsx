/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import { AlertIcon, FoodIcon, SearchIcon } from "../icons/icons";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import useLocationStore from "@/libs/store/location-store";
import { ISingleMeal } from "@/libs/endpoints/meals/meals-schema";
import { mealsHook } from "@/libs/endpoints/meals/meals-endpoints";
import { useDebounce } from "@uidotdev/usehooks";
import { Skeleton } from "../ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { Routes } from "@/libs/routes";
import { Button } from "../ui/button";
import { cn, mapMealToISingleMeal } from "@/libs/utils";
import { restaurantsHook } from "@/libs/endpoints/restaurants/restaurants-endpoints";
import { useRouter } from "next/navigation";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<"food" | "restaurant">(
    "food",
  );
  const router = useRouter();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [meals, setMeals] = useState<ISingleMeal[]>([]);

  const { distance, fetchingLocation } = useLocationStore();

  const { data: restaurants, isLoading: restaurantLoading } =
    restaurantsHook.useQueryNearByRestaurants(
      {
        queries: {
          longitude: fetchingLocation.lng,
          latitude: fetchingLocation.lat,
          maxDistance: distance,
          name: debouncedSearchTerm,
        },
      },
      {
        enabled: !!searchTerm && selectedItem === "restaurant",
      },
    );
  const { data, isLoading } = mealsHook.useQueryMealsNearBy(
    {
      queries: {
        longitude: fetchingLocation.lng,
        latitude: fetchingLocation.lat,
        maxDistance: 2000,
        name: debouncedSearchTerm,
      },
    },
    {
      enabled: !!searchTerm && selectedItem === "food",
    },
  );
  useEffect(() => {
    if (data?.data) {
      const menuArray = data?.data.flatMap((restaurant) =>
        restaurant.menu.map((item) => mapMealToISingleMeal(item, restaurant)),
      );
      setMeals(menuArray);
    }
  }, [data?.data]);

  return (
    <Popover>
      <PopoverTrigger className="flex w-full items-center gap-2 rounded-full bg-white p-2 font-light text-neutral-800 shadow-3xl">
        <SearchIcon className="size-6" />
        Search...
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="mt-1 overflow-hidden rounded-lg p-0"
      >
        <input
          type="text"
          autoComplete="off"
          className="w-full border-none p-2 text-sm font-light outline-none"
          placeholder="Food, Restaurant"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="border-t border-neutral-200" />
        <div className="flex items-center gap-2 p-2">
          <Button
            variant={selectedItem === "food" ? "default" : "outline"}
            className={cn(
              "h-8 border-heavy px-3 py-px text-xs font-normal text-heavy",
              selectedItem === "food" &&
                "border border-primary text-neutral-900",
            )}
            onClick={() => setSelectedItem("food")}
          >
            Food
          </Button>
          <Button
            variant={selectedItem === "restaurant" ? "default" : "outline"}
            className={cn(
              "h-8 border-heavy px-3 py-px text-xs font-normal text-heavy",
              selectedItem === "restaurant" &&
                "border border-primary text-neutral-900",
            )}
            onClick={() => setSelectedItem("restaurant")}
          >
            Restaurants
          </Button>
          {/* <Button
            variant={"outline"}
            className={cn(
              "h-8 border-heavy px-3 py-px text-xs font-normal text-heavy",
            )}
            onClick={() => router.push(Routes.AiSearch)}
          >
            AI Search
          </Button> */}
        </div>
        <div className="max-h-[270px] overflow-auto p-3 transition-all">
          {searchTerm === "" ? (
            <div className="flex flex-col items-center justify-center gap-1 p-2 px-4 text-center">
              <SearchIcon className="size-6 text-neutral-400" />
              <p className="ml-2 text-sm text-neutral-500">Type to search...</p>
            </div>
          ) : selectedItem === "food" ? (
            isLoading ? (
              <MealSkeleton />
            ) : meals.length > 0 && !!searchTerm ? (
              <div className="space-y-5">
                {meals.map((meal, index) => (
                  <MealItem
                    key={meal.id + index}
                    id={meal.id}
                    name={meal.name || ""}
                    price={+meal.price || 100}
                    type={selectedItem}
                    image={meal.image}
                  />
                ))}
              </div>
            ) : (
              <p className="p-4 text-center text-gray-500">No meals found</p>
            )
          ) : restaurantLoading ? (
            <MealSkeleton />
          ) : (restaurants?.data || []).length > 0 && !!searchTerm ? (
            <div className="space-y-5">
              {restaurants?.data.map((res, index) => (
                <MealItem
                  key={res._id + index}
                  id={res._id}
                  name={res.name || ""}
                  type={selectedItem}
                  image={res.logo || ""}
                />
              ))}
            </div>
          ) : (
            <p className="p-4 text-center text-gray-500">No restaurant found</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SearchBar;

const MealItem = ({
  name,
  price,
  id,
  type,
  image,
}: {
  name: string;
  id: string;
  price?: number;
  type: "food" | "restaurant";
  image?: string;
}) => {
  return (
    <Link
      href={{
        pathname: type === "food" ? Routes.Meals : Routes.Restaurants,
        query: `id=${id}`,
      }}
      className="flex gap-3 rounded-2xl bg-white"
    >
      <div className="size-[50px] shrink-0 overflow-hidden rounded-xl">
        {image ? (
          <img
            className="h-full max-w-full object-cover"
            alt="food"
            src={image}
          />
        ) : (
          <FoodIcon className="size-7" />
        )}
      </div>
      <div className="flex w-full flex-col justify-between gap-1">
        <div className="text-sm">{name}</div>
        {price && (
          <div className="text-sm font-semibold">
            ${(price / 100).toFixed(2)}
          </div>
        )}
      </div>
    </Link>
  );
};

const MealSkeleton = () => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Skeleton className="size-[50px] rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 rounded-xl" />
          <Skeleton className="h-3 w-14 rounded-xl" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="size-[50px] rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 rounded-xl" />
          <Skeleton className="h-3 w-14 rounded-xl" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="size-[50px] rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 rounded-xl" />
          <Skeleton className="h-3 w-14 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
