"use client";

import LocationBox from "@/components/filters-search/location-box";
import SearchBar from "@/components/filters-search/search-bar";
import GoogleMap from "@/components/map/google-map";
import MealRestaurantDataModal from "@/components/meals/meal-restaurant-data-modal";
import MealsCarousel from "@/components/meals/meals-carousel";
import useMealDetailsStore from "@/libs/store/meal-details-store";
import useSelectedLocationStore from "@/libs/store/selected-location-store";
import { cn } from "@/libs/utils";


import MealCard from "@/components/meals/meal-card";
import { useEffect } from "react";
import { useTour } from "@reactour/tour";
import useUiStore from "@/libs/store/ui-store";

export default function Page() {
  const { isMealDetailsOpen } = useMealDetailsStore();
  const { selectedLocation } = useSelectedLocationStore();
  const { setIsOpen } = useTour();
  const { isFirstVisit } = useUiStore();

  // useEffect(() => {
  //   if (isFirstVisit) {
  //     setIsOpen(true);
  //   }
  // }, [isFirstVisit]);

  return (
    <>
      <MealRestaurantDataModal />

      <div className="h-full">
        <div
          className={cn(
            "fixed left-1/2 z-50 flex w-full max-w-2xl -translate-x-1/2 items-center gap-2 px-4 transition-all",
            isMealDetailsOpen ? "top-0 -translate-y-24" : "top-4",
          )}
        >
          <div className="flex-1">
            <SearchBar />
          </div>
          <LocationBox />
        </div>
        <div className="fixed left-0 z-10 h-full w-full blur-0">
          <GoogleMap />
        </div>
        <div
          className={cn(
            "fixed left-1/2 z-50 max-w-2xl -translate-x-1/2 transition-all duration-300 ease-in-out",
            isMealDetailsOpen || !!selectedLocation.lat
              ? "bottom-0 translate-y-52"
              : "bottom-[85px]",
          )}
        >
          <MealsCarousel />
        </div>
      </div>
    </>
  );
}
