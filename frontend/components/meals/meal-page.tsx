/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect } from "react";
import { Button } from "../ui/button";
import DietaryPreferenceItems from "./dietary-preferences-items";
import { mealsHook } from "@/libs/endpoints/meals/meals-endpoints";
import { useRouter, useSearchParams } from "next/navigation";
import { Routes } from "@/libs/routes";
import { ArrowLeftIcon, BookmarkCheckIcon, DishIcon } from "../icons/icons";
import Link from "next/link";
import RestaurantsOfMeal from "./restaurants-of-meal";
import RatingDetails from "./rating-review/rating-overview";
import ShareMeal from "./share-meal";
import MealCard from "./meal-card";
import useAddToProfile from "@/libs/hooks/use-add-to-profile";
import { INutritionalInformation } from "@/libs/endpoints/meals/meals-schema";
import { usersHook } from "@/libs/endpoints/users/users-endpoints";
import { hasOneDayPassed } from "@/libs/utils";
import { UBER_EATS_URL, test_lat, test_lng } from "@/config";
import { DotsLoading } from "../icons/three-dots-loading";

const MealPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const foodId = searchParams.get("id");

  const ensureString = (value: unknown): string => {
    if (typeof value === "string") return value;
    if (value && typeof value === "object") {
      const v = value as Record<string, unknown>;
      if (typeof v.url === "string") return v.url;
      if (typeof v.src === "string") return v.src;
      if (typeof v.href === "string") return v.href;
      if (typeof v.link === "string") return v.link;
    }
    return "";
  };

  // Global error handler for the component
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Unhandled Error in Product Page:", {
        error: event.error,
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        foodId,
        timestamp: new Date().toISOString(),
      });
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [foodId, router]);

  useEffect(() => {
    if (!foodId) {
      router.push(Routes.Home);
    }
  }, [foodId, router]);

  // Log when component mounts and API calls are made
  useEffect(() => {
    console.log("Product Page - API Calls Made:", {
      foodId,
      latitude: test_lat,
      longitude: test_lng,
      timestamp: new Date().toISOString(),
    });

    // Log test coordinates being used
    console.log("Product Page - Test Coordinates Configuration:", {
      latitude: test_lat,
      longitude: test_lng,
      maxDistance: 50000,
      limit: 20,
      timestamp: new Date().toISOString(),
    });
  }, [foodId]);

  const { handleAddToProfile, isLoading: addToProfileLoading } =
    useAddToProfile();

  // (No explicit error field in useAddToProfile hook result)

  const { data, isLoading, refetch, error } = mealsHook.useQuerySingleMeal({
    params: {
      id: foodId || "",
    },
  });

  // Get nearby similar meals using test coordinates
  const { data: nearbyMeals, isLoading: nearbyLoading } = mealsHook.useQueryMealsNearBy({
    queries: {
      longitude: test_lng,
      latitude: test_lat,
      maxDistance: 50000, // 50km radius for better coverage
      limit: 20,
    },
  });

  // Get restaurants for this meal
  const { data: restaurants, error: restaurantsError } = mealsHook.useQueryRestaurantsOfMeal(
    {
      params: {
        foodId: foodId || "",
      },
    },
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  );

  // Get eaten meals
  const {
    data: eaten,
    isLoading: loadingData,
    refetch: refetchEaten,
    error: eatenError,
  } = usersHook.useQueryEatenMeals();

  // Log API request details
  useEffect(() => {
    if (foodId) {
      console.log("Product Page - API Request Details:", {
        requests: {
          singleMeal: {
            endpoint: `/foods/${foodId}`,
            method: "GET",
            params: { id: foodId },
          },
          nearbyMeals: {
            endpoint: "/foods/find-nearby",
            method: "GET",
            queries: {
              longitude: test_lng,
              latitude: test_lat,
              maxDistance: 50000,
              limit: 20,
            },
          },
          restaurants: {
            endpoint: `/foods/${foodId}/restaurants`,
            method: "GET",
            params: { foodId },
          },
          eatenMeals: {
            endpoint: "/profile/eaten",
            method: "GET",
            queries: { timezoneOffset: new Date().getTimezoneOffset() },
          },
        },
        foodId,
        timestamp: new Date().toISOString(),
      });
    }
  }, [foodId]);

  // Log any backend errors
  if (error) {
    console.error("Backend Error in Product Page:", {
      error,
      foodId,
      timestamp: new Date().toISOString(),
    });
  }

  // Log successful API responses for debugging
  if (data && !error) {
    console.log("Product Page - API Response Success:", {
      foodId,
      mealName: data?.data?.name,
      hasImage: !!data?.data?.image,
      hasNutritionalInfo: !!data?.data?.nutritionalInformation,
      timestamp: new Date().toISOString(),
    });

    // Log detailed meal data from backend
    console.log("Product Page - Detailed Meal Data from Backend:", {
      meal: data?.data,
      foodId,
      timestamp: new Date().toISOString(),
    });
  }

  // Log nearby meals response
  if (nearbyMeals && !nearbyLoading) {
    console.log("Product Page - Nearby Meals Response:", {
      totalNearbyMeals: nearbyMeals?.data?.length || 0,
      latitude: test_lat,
      longitude: test_lng,
      timestamp: new Date().toISOString(),
    });

    // Log detailed nearby meals data from backend
    console.log("Product Page - Detailed Nearby Meals from Backend:", {
      nearbyMeals: nearbyMeals?.data,
      totalCount: nearbyMeals?.data?.length || 0,
      latitude: test_lat,
      longitude: test_lng,
      maxDistance: 50000,
      timestamp: new Date().toISOString(),
    });
  }

  // Log comprehensive summary when all data is loaded
  useEffect(() => {
    if (data?.data && nearbyMeals?.data && restaurants?.data && eaten?.eatenFoods) {
      console.log("Product Page - Complete Data Summary from Backend:", {
        summary: {
          mainMeal: {
            id: data.data._id,
            name: data.data.name,
            hasImage: !!data.data.image,
            hasNutritionalInfo: !!data.data.nutritionalInformation,
            price: data.data.price,
            itemType: data.data.itemType,
          },
          nearbyMeals: {
            total: nearbyMeals.data.length,
            sampleNames: nearbyMeals.data.slice(0, 3).map(m => m.name),
          },
          restaurants: {
            total: restaurants.data.length,
            names: restaurants.data.map(r => r.name),
          },
          eatenMeals: {
            total: eaten.eatenFoods.length,
            currentMealIncluded: !!eaten.eatenFoods.find(item => item?.foodId === foodId),
          },
          location: {
            latitude: test_lat,
            longitude: test_lng,
            maxDistance: 50000,
          }
        },
        foodId,
        timestamp: new Date().toISOString(),
      });
    }
  }, [data?.data, nearbyMeals?.data, restaurants?.data, eaten?.eatenFoods, foodId]);

  // Log any eaten meals query errors
  if (eatenError) {
    console.error("Backend Error in Eaten Meals Query:", {
      error: eatenError,
      timestamp: new Date().toISOString(),
    });
  }

  // Log successful eaten meals data from backend
  if (eaten?.eatenFoods && !eatenError) {
    console.log("Product Page - Eaten Meals Data from Backend:", {
      eatenFoods: eaten?.eatenFoods,
      totalEatenFoods: eaten?.eatenFoods?.length || 0,
      currentMealInEaten: eaten?.eatenFoods?.find(item => item?.foodId === foodId),
      foodId,
      timestamp: new Date().toISOString(),
    });
  }

  // Log any restaurants query errors
  if (restaurantsError) {
    console.error("Backend Error in Restaurants Query:", {
      error: restaurantsError,
      foodId,
      timestamp: new Date().toISOString(),
    });
  }

  // Log successful restaurants data from backend
  if (restaurants?.data && !restaurantsError) {
    console.log("Product Page - Restaurants Data from Backend:", {
      restaurants: restaurants?.data,
      totalRestaurants: restaurants?.data?.length || 0,
      foodId,
      timestamp: new Date().toISOString(),
    });
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "title",
          text: "text",
          url: "url",
        });
        console.log("Content shared successfully");
      } catch (error) {
        console.log("Error sharing content:", error);
      }
    } else {
      const fallbackUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent("text")}&url=${encodeURIComponent("url")}`;
      window.open(fallbackUrl, "_blank");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <DotsLoading className="size-7" />
      </div>
    );
  }

  // Show error state if there's a backend error
  if (error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold text-red-600">Error Loading Meal</div>
          <div className="mb-4 text-gray-600">
            There was an error loading the meal data from the server.
          </div>
          <div className="mb-4 text-sm text-gray-500">
            Check the browser console for detailed error information.
          </div>
          <button
            onClick={() => refetch()}
            className="rounded-lg bg-secondary px-4 py-2 text-white hover:bg-secondary/80"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const meal = data?.data;

  // Show error if meal data is missing
  if (!meal) {
    console.error("No meal data received from backend:", {
      data,
      foodId,
      timestamp: new Date().toISOString(),
    });
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold text-red-600">Meal Not Found</div>
          <div className="mb-4 text-gray-600">
            The requested meal could not be found or loaded.
          </div>
          <div className="mb-4 text-sm text-gray-500">
            Check the browser console for detailed error information.
          </div>
          <button
            onClick={() => router.back()}
            className="rounded-lg bg-secondary px-4 py-2 text-white hover:bg-secondary/80"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const mealDetails = [
    {
      title: "Kcal",
      value: meal?.nutritionalInformation?.caloriesKcal || 0,
    },
    {
      title: "Carb",
      value: meal?.nutritionalInformation?.totalCarbsGrams || 0,
    },
    {
      title: "Port",
      value: meal?.nutritionalInformation?.proteinGrams || 0,
    },
    {
      title: "Fat",
      value: meal?.nutritionalInformation?.totalFatGrams || 0,
    },
  ];

  const mealInfo = [
    {
      title: "Total Fat",
      value: (meal?.nutritionalInformation?.totalFatGrams || 0) + " gr",
    },
    {
      title: "Cholesterol",
      value: (meal?.nutritionalInformation?.cholesterolMg || 0) + " mg",
    },
    {
      title: "Sodium",
      value: (meal?.nutritionalInformation?.sodiumMg || 0) + " mg",
    },
    {
      title: "Vitamin A",
      value: (meal?.nutritionalInformation?.vitaminAMg || 0) + " mg",
    },
    {
      title: "Vitamin C",
      value: (meal?.nutritionalInformation?.vitaminCMg || 0) + " mg",
    },
  ];
  const otherMealInfo = Object.entries(NutritionalInformationSchema).map(
    ([key, { title, unit }]) => ({
      title,
      value:
        meal?.nutritionalInformation?.[key as keyof INutritionalInformation] ??
        "0",
      unit,
    }),
  );
  const onSuccessAddToProfile = () => {
    refetchEaten();
  };
  const eatenMeal = eaten?.eatenFoods?.find((item) => item?.foodId === foodId);
  const isAdded = !!eatenMeal && !hasOneDayPassed(eatenMeal.dateEaten);
  const mealLink = restaurants?.data?.[0].url + "/" + meal?.link;

  return (
    <div className="relative h-full">
      <button
        onClick={() => router.back()}
        className="absolute start-5 top-5 z-40 flex size-8 items-center justify-center overflow-hidden rounded-full bg-white"
      >
        <ArrowLeftIcon className="size-5" />
      </button>
      <div className="absolute end-5 top-5 z-40">
        <div className="flex items-center gap-3">
          {isAdded && (
            <div className="flex size-8 items-center justify-center rounded-full bg-secondary text-white">
              <BookmarkCheckIcon className="size-5" />
            </div>
          )}
          <ShareMeal />
        </div>
      </div>
      <div className="relative z-30 flex h-[350px] w-full items-center justify-center overflow-hidden rounded-b-3xl">
        {meal?.image ? (
          <img
            className="h-full object-cover"
            alt="restaurant"
            src={ensureString(meal?.image) || ""}
            width={1080}
            height={1080}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-offWhite">
            <DishIcon className="size-24 text-heavy" />
          </div>
        )}
        <RestaurantsOfMeal meal_id={foodId || ""} />
        <div className="absolute bottom-0 z-10 h-1/2 w-full bg-gradient-to-t from-black/30"></div>
      </div>
      <div className="relative z-10 rounded-t-3xl bg-white p-4">
        <div>
          <div className="text-center text-xl font-semibold">{meal?.name}</div>
          {meal?.description && (
            <p className="mt-2 text-justify text-xs">{meal.description}</p>
          )}
          
          {/* Location Info */}
          <div className="mt-3 text-center text-xs text-gray-500">
            📍 Using test location: {test_lat}, {test_lng}
          </div>
          {meal && (
            <div className="my-4">
              <RatingDetails
                refetch={refetch}
                foodId={meal._id}
                healthRate={meal?.reviewSummary?.averageHealthRating || 0}
                tasteRate={meal?.reviewSummary?.averageTasteRating || 0}
                totalReview={meal.reviewSummary?.totalComments || 0}
              />
            </div>
          )}
          <div className="mt-6">
            <div className="mb-2 text-xl font-semibold">Diet</div>
            {meal?.dietaryPreferences && (
              <DietaryPreferenceItems
                isLarge
                dietaryPreferences={meal?.dietaryPreferences}
              />
            )}
          </div>

          <div>
            <div className="mt-10 flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className="text-xl font-bold">
                  ${((meal?.price || 100) / 100).toFixed(2)}
                </div>
                {/* <div className="text-softText line-through">$15.99</div> */}
              </div>
              <Button asChild variant="outline" className="px-8 font-semibold">
                <Link
                  href={{
                    pathname: Routes.Compare,
                    query: { id: foodId },
                  }}
                >
                  Compare
                </Link>
              </Button>
            </div>

            <Button
              onClick={() =>
                handleAddToProfile(meal?._id || "", 1, onSuccessAddToProfile)
              }
              className="mt-3 w-full font-medium"
              variant="secondary"
              isLoading={addToProfileLoading}
            >
              Add to profile
            </Button>
            {isAdded && (
              <Button asChild className="mt-3 w-full text-xs" variant="pale">
                <Link href={UBER_EATS_URL + mealLink} target="_blank">
                  Order on
                  <span className="ms-2 flex flex-col items-start font-semibold leading-tight">
                    <span className="text-black">Uber</span>
                    <span className="text-[#00C444]">Eats</span>
                  </span>
                </Link>
              </Button>
            )}
          </div>

          <div className="mt-10">
            <div className="mb-4 text-xl font-semibold">Nutrients</div>
            <div className="flex items-center justify-center gap-4">
              {mealDetails.map((detail) => (
                <>
                  <div
                    key={detail.title}
                    className="flex h-[70px] w-[70px] flex-col items-center justify-around rounded-2xl p-2 shadow-4xl"
                  >
                    <div className="font-semibold">{detail.value}</div>
                    <div className="font-light">{detail.title}</div>
                  </div>
                  {/* <div className="relative h-[40px] w-px bg-heavy last:!w-0"></div> */}
                </>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-2 font-medium">
            {mealInfo.map((info, index) => (
              <div
                key={info.title + index}
                className="flex items-center justify-between border-b border-offWhite pb-1"
              >
                <div className="text-sm font-normal">{info.title}</div>
                <div className="text-sm font-normal">{info.value}</div>
              </div>
            ))}
            <div className="space-y-2 font-medium">
              {otherMealInfo.map(
                (info) =>
                  (+info.value || 0) > 0 && (
                    <div
                      key={info.title}
                      className="flex items-center justify-between border-b border-offWhite pb-1"
                    >
                      <div className="text-sm font-normal">{info.title}</div>
                      <div className="text-sm font-normal">
                        {info.value} {info.unit}
                      </div>
                    </div>
                  ),
              )}
            </div>
            {/* <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger className="p-0 pb-1 text-sm font-normal">
                  More
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 font-medium">
                    {otherMealInfo.map(
                      (info) =>
                        (+info.value || 0) > 0 && (
                          <div
                            key={info.title}
                            className="flex items-center justify-between border-t border-offWhite pt-1"
                          >
                            <div className="text-sm font-normal">
                              {info.title}
                            </div>
                            <div className="text-sm font-normal">
                              {info.value} {info.unit}
                            </div>
                          </div>
                        ),
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion> */}
          </div>

          {/* Nearby Similar Meals Section */}
          <div className="mt-10">
            <div className="mb-4 text-xl font-semibold">Similar Meals Nearby</div>
            <div className="text-sm text-gray-600 mb-4">
              Based on your location: {test_lat}, {test_lng} (50km radius)
            </div>
            
            {nearbyLoading ? (
              <div className="flex justify-center">
                <DotsLoading className="size-6" />
              </div>
            ) : nearbyMeals?.data && nearbyMeals.data.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {nearbyMeals.data
                  .filter(nearbyMeal => nearbyMeal._id !== foodId) // Exclude current meal
                  .slice(0, 6) // Show max 6 meals
                  .map((nearbyMeal) => (
                    <MealCard
                      key={nearbyMeal._id}
                      meal={{
                        id: nearbyMeal._id,
                        name: nearbyMeal.name || "",
                        healthRating: (nearbyMeal.reviewSummary as any)?.averageHealthRating || 0,
                        tasteRating: (nearbyMeal.reviewSummary as any)?.averageTasteRating || 0,
                        link: String(nearbyMeal.link || ""),
                        image: ensureString(nearbyMeal.image) || "",
                        calories: String(((nearbyMeal.nutritionalInformation as Partial<INutritionalInformation> | undefined)?.caloriesKcal) ?? ""),
                        price: String((Number(nearbyMeal.price ?? 0) || 0) / 100),
                        itemType: String(nearbyMeal.itemType ?? ""),
                        category: Array.isArray(nearbyMeal.category) ? nearbyMeal.category : [""],
                        dietaryPreferences: (typeof nearbyMeal.dietaryPreferences === 'object' && nearbyMeal.dietaryPreferences !== null)
                          ? (nearbyMeal.dietaryPreferences as any)
                          : undefined,
                        nutritionalInformation: (typeof nearbyMeal.nutritionalInformation === 'object' && nearbyMeal.nutritionalInformation !== null)
                          ? (nearbyMeal.nutritionalInformation as Partial<INutritionalInformation>)
                          : undefined,
                        allergies: (typeof nearbyMeal.allergies === 'object' && nearbyMeal.allergies !== null)
                          ? (nearbyMeal.allergies as any)
                          : undefined,
                        restaurant: {
                          id: (nearbyMeal.restaurant as any)?._id || "",
                          name: (nearbyMeal.restaurant as any)?.name || "",
                          image: (nearbyMeal.restaurant as any)?.heroUrl || "",
                          type: Array.isArray((nearbyMeal.restaurant as any)?.cuisineType)
                            ? ((nearbyMeal.restaurant as any).cuisineType as string[]).join(", ")
                            : "",
                          location: (nearbyMeal.restaurant as any)?.location,
                          description: (nearbyMeal.restaurant as any)?.description || "",
                          heroUrl: (nearbyMeal.restaurant as any)?.heroUrl || "",
                        },
                      }}
                      variant="vertical"
                      className="w-full"
                      handleMealClicked={() => {
                        router.push(Routes.Meals + `?id=${nearbyMeal._id}`);
                      }}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No similar meals found nearby
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPage;

const NutritionalInformationSchema = {
  saturatedFatGrams: {
    title: "Saturated Fat",
    unit: "g",
  },

  sugarsGrams: {
    title: "Sugars",
    unit: "g",
  },
  dietaryFiberGrams: {
    title: "Dietary Fiber",
    unit: "g",
  },
  potassiumMg: {
    title: "Potassium",
    unit: "mg",
  },
  calciumMg: {
    title: "Calcium",
    unit: "mg",
  },
  ironMg: {
    title: "Iron",
    unit: "mg",
  },
  polyunsaturatedFatGrams: {
    title: "Polyunsaturated Fat",
    unit: "g",
  },
  transFatGrams: {
    title: "Trans Fat",
    unit: "g",
  },
  monounsaturatedFatGrams: {
    title: "Monounsaturated Fat",
    unit: "g",
  },
};
