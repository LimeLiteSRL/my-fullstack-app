"use client";

import React, { useRef } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "../ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { ISingleMeal } from "@/libs/endpoints/meals/meals-schema";
import { usersHook } from "@/libs/endpoints/users/users-endpoints";
import MealCard from "./meal-card";
import { hasOneDayPassed } from "@/libs/utils";
import CarouselDots from "../common/carousel-dots";

const RestaurantMealCarousel = ({ meals }: { meals: ISingleMeal[] }) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: false }));
  const { data, isLoading: loadingData } = usersHook.useQueryEatenMeals(
    undefined,
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  );
  const eatenFoods = data?.eatenFoods;

  if (!meals) return null;
  return (
    <div>
      <CarouselDots className="mb-2" totalItems={meals.length} api={api} />
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        opts={{
          align: "center",
          loop: true,
        }}
      >
        <CarouselContent className="-ml-4">
          {meals.map((meal, index) => {
            const eatenMeal = eatenFoods?.find(
              (item) => item?.foodId === meal.id,
            );
            return (
              <CarouselItem key={meal.id + index} className="basis-[100%] pl-4">
                <MealCard
                  meal={meal}
                  variant="fullDetails"
                  className="w-full"
                  isMarked={
                    !!eatenMeal && !hasOneDayPassed(eatenMeal.dateEaten)
                  }
                />
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default RestaurantMealCarousel;
