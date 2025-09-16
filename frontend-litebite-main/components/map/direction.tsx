import useLocationStore from "@/libs/store/location-store";
import useSelectedLocationStore from "@/libs/store/selected-location-store";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  ArrowLeftIcon,
  CarIcon,
  LocationIcons,
  TimeIcon,
} from "../icons/icons";
import { cn } from "@/libs/utils";
import useMealDetailsStore from "@/libs/store/meal-details-store";
import useUserAgent from "@/libs/hooks/use-user-agent";

const Direction = () => {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const [directionsService, setDirectionsService] =
    useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer>();
  const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);
  const [routeIndex, setRouteIndex] = useState(0);
  const selected = routes[routeIndex];
  const leg = selected?.legs[0];
  const [closeInfo, setCloseInfo] = useState(false);
  const { userLocation } = useLocationStore();
  const { selectedLocation, setSelectedLocation } = useSelectedLocationStore();
  const { isMealDetailsOpen } = useMealDetailsStore();
  const { device } = useUserAgent();

  useEffect(() => {
    if (!routesLibrary || !map || !selectedLocation.lat) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(
      new routesLibrary.DirectionsRenderer({
        map,
        suppressMarkers: true,
        preserveViewport: true,
        // polylineOptions: {
        //   strokeColor: "#2563eb", // Blue color
        //   strokeOpacity: 0.8,
        //   strokeWeight: 5,
        // },
      }),
    );
  }, [routesLibrary, map, selectedLocation?.lat]);

  useEffect(() => {
    if (
      !directionsService ||
      !directionsRenderer ||
      !userLocation ||
      !selectedLocation
    )
      return;

    directionsRenderer.setMap(null);
    //   34.050723,-118.265609,17
    directionsService
      .route({
        origin: { lat: userLocation.lat, lng: userLocation.lng },
        destination: {
          lat: selectedLocation.lat || 0,
          lng: selectedLocation.lng || 0,
        },
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: false,
      })
      .then((response) => {
        directionsRenderer.setMap(map);
        directionsRenderer.setDirections(response);
        setRoutes(response.routes);
        setCloseInfo(false);
      });

    return () => directionsRenderer.setMap(null);
  }, [directionsService, directionsRenderer, userLocation, selectedLocation, map]);

  useEffect(() => {
    if (!directionsRenderer) return;
    directionsRenderer.setRouteIndex(routeIndex);
  }, [routeIndex, directionsRenderer]);

  const handleClear = () => {
    setSelectedLocation(null, null);
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
      setDirectionsRenderer(undefined);
    }
    setRoutes([]);
    setRouteIndex(0);
  };

  useEffect(() => {
    if (isMealDetailsOpen) {
      setSelectedLocation(null, null);
      if (directionsRenderer) {
        directionsRenderer.setMap(null);
        setDirectionsRenderer(undefined);
      }
      setRoutes([]);
      setRouteIndex(0);
    }
  }, [isMealDetailsOpen, directionsRenderer, setSelectedLocation]);

  if (!leg) return null;

  const openMapURL =
    device === "android"
      ? `geo:${selectedLocation.lat},${selectedLocation.lng}`
      : device === "ios"
        ? `maps://?q=${selectedLocation.lat},${selectedLocation.lng}`
        : `https://www.google.com/maps/search/?api=1&query=${selectedLocation.lat},${selectedLocation.lng}`;

  return (
    <div
      className={cn(
        "absolute bottom-24 start-1/2 w-[350px] -translate-x-1/2 overflow-hidden rounded-xl bg-white p-4 pt-5 shadow-4xl transition-all duration-300",
        closeInfo ? "h-[70px]" : "h-[220px]",
      )}
    >
      <div className="relative">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">{selected.summary}</h2>

          <button
            onClick={() => setCloseInfo((prv) => !prv)}
            className="mb-1 flex items-center justify-center rounded-full bg-offWhite p-2"
          >
            <ArrowLeftIcon
              className={cn(
                "size-4 rotate-90 text-heavy transition-all",
                !closeInfo && "-rotate-90",
              )}
            />
          </button>
        </div>
        {!closeInfo && (
          <>
            <div className="my-3 flex items-center gap-1">
              <div className="flex size-9 items-center justify-center rounded-full bg-offWhite">
                <LocationIcons className="size-5" />
              </div>
              <div>
                To{" "}
                <span className="text-sm font-medium text-heavy">
                  {leg.end_address.split(",")[0]}
                </span>
              </div>
            </div>
            <div className="ms-2 flex items-center gap-2 text-xs text-heavy">
              <p className="flex items-center gap-1">
                <CarIcon className="size-5" />
                {leg.distance?.text}
              </p>
              <p className="flex items-center gap-1">
                <TimeIcon className="size-5" />
                {leg.duration?.text}
              </p>
            </div>
            <div className="mt-3 flex items-center gap-4">
              <Button
                onClick={handleClear}
                variant="destructive"
                className="mt-2 w-full"
              >
                Cancel
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                className="mt-2 w-full"
                asChild
              >
                <a href={openMapURL} target="_blank">
                  Open in map
                </a>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Direction;
