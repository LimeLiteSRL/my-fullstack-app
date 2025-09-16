import { useEffect, useMemo, useRef, useState } from "react";
import useLocationStore from "../store/location-store";
import { ISingleMeal } from "../endpoints/meals/meals-schema";
import { mealsHook } from "../endpoints/meals/meals-endpoints";
import useFilterStore from "../store/filters-store";
import { useDebounce } from "@uidotdev/usehooks";
import { toast } from "sonner";

interface IRestaurantNear {
  lat: number;
  lng: number;
  key: string;
  name: string;
  address: string | undefined;
  type: string | undefined;
  logo?: string | null;
}
const useNearbyMeals = (searchTerm?: string, inRestaurant?: boolean) => {
  const [meals, setMeals] = useState<ISingleMeal[]>([]);
  const [restaurantList, setRestaurantList] = useState<IRestaurantNear[]>([]);
  const { userLocation, fetchingLocation, distance } = useLocationStore();
  const { filterParams, setIsFilterVisible } = useFilterStore();
  const searchText = useDebounce(searchTerm, 500);

  const { data, isLoading } = mealsHook.useQueryMealsNearBy(
    {
      queries: {
        longitude: fetchingLocation.lng,
        latitude: fetchingLocation.lat,
        maxDistance: distance,
        ...(searchText ? { name: searchText } : null),
        ...filterParams,
        limit: 12,
      },
    },
    {
      staleTime: 5 * 60 * 1000,
      // cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  );
  const toastShown = useRef(false);

  useEffect(() => {
    if (data?.data) {
      const restaurants = data?.data.map((restaurant) => ({
        lat: restaurant.location.coordinates[1],
        lng: restaurant.location.coordinates[0],
        key: restaurant._id,
        name: restaurant.name,
        address: restaurant.street,
        logo: restaurant.logo,
        type: restaurant?.cuisineType
          ?.filter((type) => !type.includes("€"))
          .slice(0, 3)
          .join(","),
      }));
      setRestaurantList(restaurants);
      const menuArray: ISingleMeal[] = data?.data.flatMap((restaurant) =>
        restaurant.menu.map((item) => ({
          name: item.name || "",
          healthRating: item?.reviewSummary?.averageHealthRating || 0,
          tasteRating: item?.reviewSummary?.averageTasteRating || 0,
          link: (restaurant.url || "") + "/" + (item.link || ""),
          image: item?.image || "",
          calories:
            item?.nutritionalInformation?.caloriesKcal?.toString() || "",
          price: `${((item?.price || 0) / 100).toFixed(2)}` || "",
          id: item._id,
          dietaryPreferences: item.dietaryPreferences,
          nutritionalInformation: item.nutritionalInformation,
          category: item.category || [""],
          itemType: item.itemType || "",
          allergies: item.allergies,
          restaurant: {
            id: restaurant._id,
            name: restaurant.name,
            description: restaurant.description || "",
            heroUrl: restaurant.heroUrl || "",
            image: restaurant.heroUrl || "",
            logo: restaurant.logo || "",
            type: restaurant.cuisineType?.join(", ") || "",
            location: restaurant.location,
            url: restaurant.url || "",
            openingHours: restaurant.openingHours,
          },
        })),
      );
      setMeals(menuArray);
    }
    if (data?.data.length == 0 && Object.keys(filterParams).length != 0) {
      if (!toastShown.current && !inRestaurant) {
        toastShown.current = true;
        toast(
          <div>
            No food was found with the selected filters 📭.
            <button
              onClick={() => setIsFilterVisible(true)}
              className="mx-2 text-xs text-blue-500"
            >
              Change Filters
            </button>
          </div>,
        );
      }
    }
  }, [data?.data, filterParams]);

  return { meals, isLoading, restaurantList };
};

export default useNearbyMeals;
