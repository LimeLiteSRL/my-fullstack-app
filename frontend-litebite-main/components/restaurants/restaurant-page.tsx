/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";

import {
  ArrowLeftIcon,
  CallIcon,
  FoodIcon,
  LocationIcons,
} from "@/components/icons/icons";
import { Routes } from "@/libs/routes";
import React, { useEffect, useState } from "react";
import RestaurantMealsMenu from "./restaurant-meals-menu";
import { useRouter, useSearchParams } from "next/navigation";
import ShareRestaurant from "./share-restaurant";
import useRestaurantMeal from "@/libs/hooks/use-restaurant-meals";
import { DotsLoading } from "../icons/three-dots-loading";
import { isRestaurantOpen, removeParentheses } from "@/libs/utils";
import Link from "next/link";
import { Button } from "../ui/button";
import { ResponsiveDialog } from "../responsive-dialog";
import useUserAgent from "@/libs/hooks/use-user-agent";
import Badge from "../common/badge";

const Restaurant = () => {
  const [isDirectionOpen, setIsDirectionOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const restaurantId = searchParams.get("id");

  useEffect(() => {
    if (!restaurantId) {
      router.push(Routes.Home);
    }
  }, [restaurantId]);

  const { isLoading, meals } = useRestaurantMeal(restaurantId || "");

  const data = meals[1]?.restaurant;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <DotsLoading className="size-7" />
      </div>
    );
  }
  const isOpen = data?.openingHours && isRestaurantOpen(data?.openingHours);

  return (
    <div className="relative h-full bg-white">
      <button
        onClick={() => router.back()}
        className="absolute start-5 top-5 z-40 flex size-8 items-center justify-center overflow-hidden rounded-full bg-white"
      >
        <ArrowLeftIcon className="size-5" />
      </button>
      <div className="absolute end-5 top-5 z-40">
        <ShareRestaurant />
      </div>
      <div className="relative z-30 h-[350px] w-full overflow-hidden rounded-b-3xl">
        {data?.heroUrl ? (
          <img
            className="h-full object-cover"
            alt="restaurant"
            src={data?.heroUrl || ""}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-offWhite">
            <FoodIcon className="size-24 text-heavy" />
          </div>
        )}
        <div className="absolute bottom-4 left-1/2 z-20 flex w-[95%] -translate-x-1/2 items-center justify-between rounded-3xl bg-[#A9A9A9]/20 p-3 text-offWhite backdrop-blur-md">
          <div className="relative flex items-center justify-center gap-2">
            <div className="h-[50px] w-[50px] shrink-0 overflow-hidden rounded-full border border-neutral-800/50">
              <img
                className="h-full object-cover"
                alt="logo"
                src={data?.logo ? data?.logo : "/images/restaurant.jpg"}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 leading-normal">
                <div className="text-lg font-semibold">
                  {removeParentheses(data?.name || "")}
                </div>
                {<Badge text={isOpen ? "open" : "closed"} />}
              </div>
              <div className="text-xs font-light">
                {data?.type.split(",").slice(0, 3).join(", ")}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 z-10 h-1/2 w-full bg-gradient-to-t from-black/25"></div>
      </div>
      {data?.description ? (
        <div className="z-10 rounded-t-3xl bg-white p-3">
          <div className="text-xs text-heavy">{data?.description}</div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <CallIcon className="size-5 shrink-0" />
              <Link
                className="text-sm font-semibold"
                href={`tel:${data?.telephone}`}
              >
                {data?.telephone}
              </Link>
            </div>
            <Button onClick={() => setIsDirectionOpen(true)} variant="pale">
              Get direction{" "}
            </Button>
          </div>
        </div>
      ) : null}
      <GetDirection
        isOpen={isDirectionOpen}
        setIsOpen={setIsDirectionOpen}
        address={data?.street || ""}
        location={{ lat: 34, lng: 118 }}
        isRestaurantOpen={isOpen}
      />
      {meals && <RestaurantMealsMenu meals={meals} />}
    </div>
  );
};

export default Restaurant;

const GetDirection = ({
  isOpen,
  setIsOpen,
  location,
  address,
  isRestaurantOpen,
}: {
  isOpen: boolean;
  isRestaurantOpen: boolean;
  setIsOpen: (val: boolean) => void;
  location: { lat: number; lng: number };
  address: string;
}) => {
  const { device } = useUserAgent();

  const openMapURL =
    device === "android"
      ? `geo:${location.lat},${location.lng}`
      : device === "ios"
        ? `maps://?q=${location.lat},${location.lng}`
        : `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;

  return (
    <ResponsiveDialog title="Direction" open={isOpen} setOpen={setIsOpen}>
      <div className="my-3 flex items-center gap-1">
        <div className="flex size-9 items-center justify-center rounded-full bg-offWhite">
          <LocationIcons className="size-5" />
        </div>
        <div>
          To{" "}
          <span className="text-sm font-medium text-heavy">
            {/* {leg.end_address.split(",")[0]} */}
            {address}
          </span>
        </div>
        {isRestaurantOpen && <Badge text="Open" />}
      </div>

      <div className="mt-3 flex items-center gap-4">
        <Button
          onClick={() => setIsOpen(false)}
          variant="destructive"
          className="mt-2 w-full"
        >
          Close
        </Button>
        <Button
          // onClick={handleClear}
          variant="outline"
          className="mt-2 w-full"
          asChild
        >
          <a href={openMapURL} target="_blank">
            Open in map
          </a>
        </Button>
      </div>
    </ResponsiveDialog>
  );
};
