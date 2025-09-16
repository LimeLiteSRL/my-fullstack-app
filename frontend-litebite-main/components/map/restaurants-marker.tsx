/* eslint-disable @next/next/no-img-element */
"use client";

import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { ReactNode, useEffect, useState } from "react";
import useLocationStore from "@/libs/store/location-store";
import { toast } from "sonner";
import { RestaurantMenuIcon } from "../icons/icons";
import { cn, isObjectEmpty, shortenString } from "@/libs/utils";
import useFilterStore from "@/libs/store/filters-store";
import useMealDetailsStore from "@/libs/store/meal-details-store";
import useNearbyMeals from "@/libs/hooks/use-nearby-meals";
import useUiStore from "@/libs/store/ui-store";

type Point = google.maps.LatLngLiteral & { key: string };
type Props = { points: Point[] };

const RestaurantsMarkers = () => {
  const { userLocation } = useLocationStore();
  const [maxDistance, setMaxDistance] = useState(2000);
  const [noRestaurantsFound, setNoRestaurantsFound] = useState(false);
  const { filterParams } = useFilterStore();
  const { isFirstVisit } = useUiStore();
  const { setIsMealDetailsOpen, setRestaurantId, setMeals } =
    useMealDetailsStore();

  const { restaurantList: points, meals, isLoading } = useNearbyMeals("", true);

  const body = `
  Hello LiteBite Team,
  
  I would like to request adding restaurants in my area. Here are my location details:
  
  Latitude: ${userLocation.lat}
  Longitude: ${userLocation.lng}
  
  Looking forward to hearing from you!
  
  Best regards,
  [Your Name]
  `;
  useEffect(() => {
    if (points.length === 0 && maxDistance < 4000) {
      setMaxDistance((prev) => prev + 1000);
    } else if (
      points?.length === 0 &&
      maxDistance >= 4000 &&
      !isLoading &&
      !noRestaurantsFound &&
      isObjectEmpty(filterParams) &&
      !isFirstVisit
    ) {
      setNoRestaurantsFound(true);
      toast.error(
        <div>
          We do not have any active restaurants in this area. Contact us at{" "}
          <a
            className="text-blue-500"
            href={`mailto:hello@litebite.ai?subject=No Restaurants Found&body=${encodeURIComponent(body)}`}
          >
            support@litebite.ai
          </a>{" "}
          to request LiteBite in your area.
        </div>,
        {
          position: "top-center",
          closeButton: true,
          duration: 4000,
        },
      );
    }
  }, [points, maxDistance, noRestaurantsFound, isLoading, filterParams, isFirstVisit, body]);

  const handleMarkerClick = (restaurantId: string) => {
    const restaurantMeals = meals.filter(
      (meal) => meal.restaurant.id === restaurantId,
    );
    setMeals(restaurantMeals);
    setIsMealDetailsOpen(true);
    setRestaurantId(restaurantId);
  };

  return (
    <>
      {points.map((point) => (
        <AdvancedMarker
          key={point.key}
          clickable
          position={{ lat: point.lat, lng: point.lng }}
          onClick={() => handleMarkerClick(point.key)}
        >
          {point.logo ? (
            <LocationSolidIcon className="top-[10px] size-7 overflow-hidden rounded-full">
              <img
                className="h-full !max-w-full object-cover"
                src={point.logo}
                alt={point.name}
              />
            </LocationSolidIcon>
          ) : (
            <LocationSolidIcon>
              <RestaurantMenuIcon className="size-5 transition-all group-hover:text-[#4CAF50]" />
            </LocationSolidIcon>
          )}
        </AdvancedMarker>
      ))}
    </>
  );
};

export default RestaurantsMarkers;

function LocationSolidIcon({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="group relative hover:cursor-pointer">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        className="size-14 text-white drop-shadow-[0px_0px_2px_rgba(0,0,0,0.5)]"
      >
        <path
          fill="currentColor"
          d="M6.14 4.648A8.34 8.34 0 0 1 12 2.25c2.196 0 4.304.861 5.86 2.398c1.409 1.39 2.143 2.946 2.337 4.562c.193 1.602-.152 3.21-.81 4.718c-1.306 3-3.902 5.728-6.392 7.503a1.71 1.71 0 0 1-1.99 0c-2.49-1.775-5.086-4.504-6.393-7.503c-.657-1.508-1.001-3.116-.809-4.719c.194-1.615.928-3.17 2.337-4.561M9.25 10a2.75 2.75 0 1 1 5.5 0a2.75 2.75 0 0 1-5.5 0"
        ></path>
      </svg>
      <span
        className={cn(
          "absolute start-1/2 top-[14px] -translate-x-1/2 text-neutral-500",
          className,
        )}
      >
        {children}
      </span>
    </div>
  );
}
