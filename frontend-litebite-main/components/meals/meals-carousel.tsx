"use client";

import React, { useRef } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "../ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import useMealDetailsStore from "@/libs/store/meal-details-store";
import { ISingleMeal } from "@/libs/endpoints/meals/meals-schema";
import useNearbyMeals from "@/libs/hooks/use-nearby-meals";
import { usersHook } from "@/libs/endpoints/users/users-endpoints";
import MealCard from "./meal-card";
import { hasOneDayPassed } from "@/libs/utils";
import CarouselDots from "../common/carousel-dots";

const MealsCarousel = () => {
  const [api, setApi] = React.useState<CarouselApi>();
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: false }));
  const { setIsMealDetailsOpen, setMealDetails } = useMealDetailsStore();
  const { meals, isLoading } = useNearbyMeals();
  const { data, isLoading: loadingData } = usersHook.useQueryEatenMeals();
  const eatenFoods = data?.eatenFoods;

  const handleClickMeal = (meal: ISingleMeal) => {
    setMealDetails(meal);
    setIsMealDetailsOpen(true);
  };

  return (
    <div>
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        opts={{
          align: "center",
          loop: true,
        }}
      >
        <CarouselContent className="-ml-2 !py-3">
          {meals.map((meal, index) => {
            const eatenMeal = eatenFoods?.find(
              (item) => item?.foodId === meal.id,
            );
            return (
              <CarouselItem key={meal.id + index} className="basis-2/3 pl-12">
                <MealCard
                  meal={meal}
                  handleMealClicked={() => handleClickMeal(meal)}
                  isMarked={
                    !!eatenMeal && !hasOneDayPassed(eatenMeal.dateEaten)
                  }
                />
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
      <CarouselDots totalItems={meals.length} api={api} />
    </div>
  );
};

export default MealsCarousel;
