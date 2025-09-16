/* eslint-disable @next/next/no-img-element */
import React, { useRef } from "react";
import { mealsHook } from "@/libs/endpoints/meals/meals-endpoints";
import { INearByRestaurant } from "@/libs/endpoints/restaurants/reastaurants-schema";
import Link from "next/link";
import { Routes } from "@/libs/routes";
import { Skeleton } from "../ui/skeleton";
import { removeParentheses, shortenString } from "@/libs/utils";

const RestaurantsOfMeal = ({ meal_id }: { meal_id: string }) => {
  const { data, isLoading } = mealsHook.useQueryRestaurantsOfMeal(
    {
      params: {
        foodId: meal_id,
      },
    },
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  );
  if (isLoading) {
    return <RestaurantSkeleton />;
  }

  const restaurants = data?.data;
  return (
    <div className="absolute bottom-2 left-1/2 z-20 w-[90%] -translate-x-1/2">
      {restaurants && <RestaurantMeals restaurant={restaurants[0]} />}
    </div>
  );
};

export default RestaurantsOfMeal;

const RestaurantMeals = ({ restaurant }: { restaurant: INearByRestaurant }) => {
  return (
    <Link
      href={{
        pathname: Routes.Restaurants,
        query: `id=${restaurant._id}`,
      }}
      className="flex w-full items-center justify-between rounded-3xl bg-[#A9A9A9]/10 p-3 text-offWhite backdrop-blur-md"
    >
      <div className="flex items-center gap-2">
        <div className="h-[50px] w-[50px] shrink-0 overflow-hidden rounded-full border-2 border-neutral-800">
          <img
            className="h-full object-cover"
            alt="logo"
            src={restaurant?.logo ? restaurant?.logo : "/images/restaurant.jpg"}
          />
        </div>
        <div>
          <div className="flex items-center gap-2 leading-normal">
            <div className="text-lg font-semibold">
              {shortenString(removeParentheses(restaurant.name || ""), 30)}
            </div>
            {/* <span className="rounded-3xl bg-primary-1 px-2 py-px text-[10px] font-medium text-black">
              Open
            </span> */}
          </div>
          <div className="flex items-center gap-1 text-xs font-light">
            {restaurant.cuisineType?.slice(0, 4).join(", ")}
          </div>
        </div>
      </div>
    </Link>
  );
};

const RestaurantSkeleton = () => {
  return (
    <div className="absolute bottom-2 left-1/2 flex w-[90%] -translate-x-1/2 animate-pulse items-center justify-between rounded-3xl bg-[#A9A9A9]/10 p-3 text-offWhite backdrop-blur-md">
      <div className="flex items-center gap-2">
        <div className="h-[50px] w-[50px] animate-pulse overflow-hidden rounded-full bg-neutral-300/70"></div>
        <div className="space-y-3">
          <Skeleton className="h-3 w-24 bg-neutral-300/70" />

          <Skeleton className="h-2 w-16 bg-neutral-300/70" />
        </div>
        {/* <div className="text-sm font-semibold text-softText">1.8 km</div> */}
      </div>
    </div>
  );
};
