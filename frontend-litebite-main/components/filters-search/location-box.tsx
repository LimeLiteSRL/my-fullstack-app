"use client";
import React, { useEffect, useState } from "react";
import { LocationIcons } from "../icons/icons";
import { ResponsiveDialog } from "../responsive-dialog";
import { Button } from "../ui/button";
import useLocationStore from "@/libs/store/location-store";
import { GOOGLE_MAP_API_KEY, test_lat, test_lng } from "@/config";
import useNearbyMeals from "@/libs/hooks/use-nearby-meals";
import { DotsLoading } from "../icons/three-dots-loading";
import { toast } from "sonner";
import PlacesAutocomplete from "../map/places-autocomplete";

const LocationBox = () => {
  const { isLoading } = useNearbyMeals();
  const [isOpen, setIsOpen] = useState(false);

  const { setUserLocation, setIsCameraOnUser, setFetchingLocation } =
    useLocationStore();

  const handleShowLocation = () => {
    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation(position.coords.latitude, position.coords.longitude);
          setFetchingLocation(
            position.coords.latitude,
            position.coords.longitude,
          );
          setIsCameraOnUser(true);
        },
        (error) => {
          // if (error.code === 1) {
          //   toast.error("You have disabled geolocation.");
          // }
          console.log("Error getting location: ", error);
        },
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
    setIsOpen(false);
  };

  // useEffect(() => {
  //   handleShowLocation();
  // }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-[40px] min-w-[120px] items-center justify-center gap-2 rounded-full bg-white px-2 font-light shadow-md"
        id="location"
      >
        {isLoading ? (
          <DotsLoading className="size-7" />
        ) : (
          <>
            <LocationIcons className="size-5 shrink-0" />
            <div className="text-sm">Location</div>
          </>
        )}
      </button>
      <ResponsiveDialog
        title="Select your location"
        open={isOpen}
        setOpen={setIsOpen}
      >
        <div className="space-y-2">
          {/* {<PlacesAutocomplete />} */}
          <Button
            variant="light"
            className="flex w-full items-center justify-start gap-2 rounded-md"
            onClick={handleShowLocation}
          >
            <LocationIcons className="size-5" />
            My Current Location
          </Button>
          <Button
            variant="light"
            className="flex w-full items-center justify-start gap-2 rounded-md"
            onClick={() => {
              setUserLocation(test_lat, test_lng);
              setFetchingLocation(test_lat, test_lng);
              setIsCameraOnUser(true);
              setIsOpen(false);
            }}
          >
            <LocationIcons className="size-5" />
            Start Location
          </Button>
        </div>
      </ResponsiveDialog>
    </>
  );
};

export default LocationBox;
