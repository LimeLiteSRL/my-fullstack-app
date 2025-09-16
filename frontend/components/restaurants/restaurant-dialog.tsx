/* eslint-disable @next/next/no-img-element */
"use client";

import useMealDetailsStore from "@/libs/store/meal-details-store";
import {
  ArrowLeftIcon,
  CancelIcon,
  DishIcon,
  LocationIcons,
} from "../icons/icons";
import Image from "next/image";
import {
  isRestaurantOpen,
  removeParentheses,
  shortenString,
} from "@/libs/utils";
import Link from "next/link";
import { Routes } from "@/libs/routes";
import { IRestaurantLocation } from "@/libs/endpoints/meals/meals-schema";
import useSelectedLocationStore from "@/libs/store/selected-location-store";

interface IRestaurant {
  id: string;
  name: string;
  type: string;
  location?: IRestaurantLocation;
  logo?: string | null;
  openingHours?: any;
}

const RestaurantDialog = ({
  restaurant,
}: {
  restaurant: IRestaurant | undefined;
}) => {
  // console.log(restaurant);

  const { handleCloseMealDetails } = useMealDetailsStore();
  const handleCloseDialog = () => {
    handleCloseMealDetails();
  };
  const { setSelectedLocation } = useSelectedLocationStore();
  const type = restaurant?.type
    .split(",")
    .filter((type) => !type.includes("€"))
    .slice(0, 3)
    .join(",");

  const isOpen =
    restaurant?.openingHours && isRestaurantOpen(restaurant?.openingHours);

  return (
    <div className="mx-auto max-w-sm rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={handleCloseDialog}
          className="flex items-center justify-center rounded-full bg-offWhite p-2"
        >
          <ArrowLeftIcon className="size-6 text-heavy" />
        </button>
        <div className="text-lg font-semibold">Meal Preview</div>
        <button
          onClick={() => {
            setSelectedLocation(
              restaurant?.location?.coordinates[1] || 0,
              restaurant?.location?.coordinates[0] || 0,
            );

            handleCloseDialog();
          }}
          className="flex items-center justify-center rounded-full bg-light p-2"
        >
          <LocationIcons className="size-6" />
        </button>
      </div>
      <Link
        href={{
          pathname: Routes.Restaurants,
          query: `id=${restaurant?.id}`,
        }}
        className="flex w-full"
      >
        <div className="flex items-center gap-4">
          <div className="h-[70px] w-[70px] shrink-0 overflow-hidden rounded-full border border-neutral-800/50">
            <img
              className="h-full object-cover"
              alt="logo"
              src={
                restaurant?.logo ? restaurant?.logo : "/images/restaurant.jpg"
              }
              loading="lazy"
            />
          </div>
          <div className="space-y-1">
            <div className="font-bold text-titleColor">
              {shortenString(removeParentheses(restaurant?.name || ""), 30)}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-xs font-medium text-softText">
                <DishIcon className="size-5 shrink-0" />
                {type}
              </div>
              <div className="h-fit w-fit rounded-full bg-primary-1 px-1 py-px text-xs font-medium">
                {isOpen ? "open" : "closed"}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default RestaurantDialog;
