/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { ISingleMeal } from "../endpoints/meals/meals-schema";
import { restaurantsHook } from "../endpoints/restaurants/restaurants-endpoints";

const useRestaurantMeal = (restaurantId: string) => {
  const [meals, setMeals] = useState<ISingleMeal[]>([]);

  const { data, isLoading } = restaurantsHook.useQuerySingleRestaurant(
    {
      params: {
        id: restaurantId || "",
      },
    },
    {
      enabled: !!restaurantId,
    },
  );
  const restaurant = data?.data;

  useEffect(() => {
    if (restaurant) {
      const menuArray = restaurant?.menu.map((item) => ({
        name: item.name || "",
        healthRating: item?.reviewSummary?.averageHealthRating || 0,
        tasteRating: item?.reviewSummary?.averageTasteRating || 0,
        image: item?.image || "",
        calories: item?.nutritionalInformation?.caloriesKcal?.toString() || "",
        price: `${((item?.price || 0) / 100).toFixed(2)}` || "",
        id: item._id,
        dietaryPreferences: item.dietaryPreferences,
        nutritionalInformation: item.nutritionalInformation,
        category: item.category || [""],
        itemType: item.itemType || "",
        allergies: item.allergies,
        link: (restaurant.url || "") + "/" + (item.link || ""),
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          description: restaurant.description || "",
          heroUrl: restaurant.heroUrl || "",
          image: restaurant.heroUrl || "",
          type: restaurant.cuisineType?.join(", ") || "",
          location: restaurant.location,
          logo: restaurant.logo,
          openingHours: restaurant.openingHours,
          telephone: restaurant.telephone || "",
          street: restaurant.street || "",
        },
      }));
      setMeals(menuArray);
    }
  }, [data?.data]);

  return { meals, isLoading };
};

export default useRestaurantMeal;
