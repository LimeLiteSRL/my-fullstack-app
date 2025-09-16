"use client";

import React, { useMemo, useState, useEffect, useRef, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import useLocationStore from "@/libs/store/location-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider, DualRangeSlider } from "@/components/ui/slider";
import Image from "next/image";
import Header from "@/components/header/header";
import BottomNavigation from "@/components/bottom-navigation";
import { Routes } from "@/libs/routes";
import Link from "next/link";
import useAuthStore from "@/libs/store/auth-store";
import { BASE_API_URL, test_lat, test_lng, maxDistance } from "@/config";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import useAddToProfile from "@/libs/hooks/use-add-to-profile";
import { usersHook } from "@/libs/endpoints/users/users-endpoints";
import { queryClient } from "@/libs/query-client";
import Spinner from "@/components/spinner";
import { mealsHook } from "@/libs/endpoints/meals/meals-endpoints";
import { restaurantsHook } from "@/libs/endpoints/restaurants/restaurants-endpoints";

// Format price to show decimals (e.g., 1299 -> 12.99)
const formatPrice = (price: number): string => {
  if (!price || price === 0) return "0.00";
  // Convert to dollars with 2 decimal places
  const formattedPrice = (price / 100).toFixed(2);
  return formattedPrice;
};

// Define the meal interface based on backend response
interface IMeal {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  price: number;
  url?: string;
  ubereatsUrl?: string;
  nutritionalInformation?: {
    caloriesKcal?: number;
    totalFatGrams?: number;
    proteinGrams?: number;
    totalCarbsGrams?: number;
  };
  reviewSummary?: {
    averageHealthRating?: number;
    averageTasteRating?: number;
  };
  restaurant?: {
    _id: string;
    name: string;
    url?: string;
    location?: {
      coordinates: [number, number];
    };
    heroUrl?: string;
    distance?: number; // Distance in miles
    locality?: string;
    region?: string;
    openingHours?: Array<{
      dayRange: string;
      sectionHours: Array<{
        startTime: number;
        endTime: number;
        sectionTitle?: string;
        _id?: string;
      }>;
      _id?: string;
    }>;
    isOpen?: boolean;
    rating?: number;
    reviewSummary?: {
      averageHealthRating?: number;
      averageTasteRating?: number;
    };
  };
  itemType?: string;
  category?: string[];
  dietaryPreferences?: string[];
  allergies?: string[];
}

const ProductsPage = () => {
  const router = useRouter();
  // Get auth state without validation - page is public, no login required
  const { token } = useAuthStore();
  const isAuthenticated = !!token;
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);

  // Debug authentication status (only log when status changes)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      
    }
  }, [isAuthenticated, token]);
  const [distance, setDistance] = useState([15]); // Max (15) = show all
  const [calories, setCalories] = useState([500]);
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["Main Dish"]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [calorieRange, setCalorieRange] = useState<number[]>([400, 800]);
  const [caloriesOpen, setCaloriesOpen] = useState(true);
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [mealTypeOpen, setMealTypeOpen] = useState(true);
  const [restaurantsOpen, setRestaurantsOpen] = useState(true);
  const [distanceOpen, setDistanceOpen] = useState(true);
  const [allergiesOpen, setAllergiesOpen] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isBelow1100, setIsBelow1100] = useState(false);

  // New state for API data
  const [meals, setMeals] = useState<IMeal[]>([]);
  const [allMeals, setAllMeals] = useState<IMeal[]>([]);
  const [mealsWithDistances, setMealsWithDistances] = useState<IMeal[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // 10 items per page
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculatingDistances, setIsCalculatingDistances] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track initial load
  const [hasInitialData, setHasInitialData] = useState(false); // Track if we have complete data
  
  // AbortController for canceling previous requests
  const abortControllerRef = useRef<AbortController | null>(null);
  // Track last request signature to avoid cancelling identical requests
  const lastRequestKeyRef = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filtersActive, setFiltersActive] = useState(false); // Start with false, will be set based on URL params
  
  // Add refs to prevent multiple initial requests
  const isInitializedRef = useRef(false);
  const initialRequestMadeRef = useRef(false);

  // Compare selection flow
  const [firstCompareId, setFirstCompareId] = useState<string | null>(null);
  const [firstCompareName, setFirstCompareName] = useState<string | null>(null);
  const [compareBanner, setCompareBanner] = useState<string | null>(null);

  const [restaurantsList, setRestaurantsList] = useState<{id: string; name: string}[]>([]);
  const [isRestaurantsModalOpen, setIsRestaurantsModalOpen] = useState(false);
  const [restaurantsByFoodId, setRestaurantsByFoodId] = useState<Record<string, any>>({});
  const [foodDetailsById, setFoodDetailsById] = useState<Record<string, any>>({});

  // Debouncer for filter-driven fetches (as a fallback to effects)
  const filterDebounceRef = useRef<number | null>(null);
  const suppressEffectRef = useRef(false);
  // Declare then assign after fetchMealsFromBackend is defined to avoid TDZ
  const triggerFilterFetchRef = useRef<null | (() => void)>(null);
  const triggerFilterFetch = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (filterDebounceRef.current) {
      window.clearTimeout(filterDebounceRef.current);
    }
    console.log("filter:debounce");
    suppressEffectRef.current = true; // prevent the effect-based debounce from also firing
    filterDebounceRef.current = window.setTimeout(() => {
      console.log("filter:fetch");
      setCurrentPage(1);
      if (triggerFilterFetchRef.current) {
        triggerFilterFetchRef.current();
      }
    }, 300);
  }, []);

  // Add to profile hook
  const { handleAddToProfile, isLoading: isAddingToProfile } = useAddToProfile();
  
  const handleSuccessAddToProfile = () => {
    queryClient.invalidateQueries(usersHook.getKeyByAlias("queryEatenMeals"));
  };

  const getRestaurantForFood = (meal: IMeal) => {
    // Restaurant data is now directly available in the meal object
    return meal.restaurant;
  };

  const getUberEatsHref = (meal: IMeal): string => {
    try {
      const rest = getRestaurantForFood(meal);
      const restUrl = rest?.url;
      const details = foodDetailsById[meal._id];
      const link = details?.link || (meal as any)?.link;
      if (restUrl && link) {
        return `https://www.ubereats.com${restUrl}/${link}`;
      }
      return (meal.url || meal.ubereatsUrl || meal.restaurant?.url || '#') as string;
    } catch {
      return (meal.url || meal.ubereatsUrl || meal.restaurant?.url || '#') as string;
    }
  };

  const handleCompareClick = async (mealId: string, mealName?: string) => {
    if (!firstCompareId) {
      setFirstCompareId(mealId);
      setFirstCompareName(mealName || null);
      setCompareBanner("Select one more item to compare");
      return;
    }
    if (firstCompareId === mealId) {
      // ignore same click; keep waiting for a different item
      setCompareBanner("Please select a different item to compare");
      return;
    }
    try {
      const params = new URLSearchParams({ foodIds: `${firstCompareId},${mealId}` });
      const url = `${BASE_API_URL}/foods/compare?${params.toString()}`;
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) {
        // still navigate, backend page can fetch again; but provide quick feedback removed
      }
      router.push(`${Routes.Compare}/result?first=${firstCompareId}&last=${mealId}`);
    } catch (err) {
      router.push(`${Routes.Compare}/result?first=${firstCompareId}&last=${mealId}`);
    } finally {
      setFirstCompareId(null);
      setFirstCompareName(null);
      setCompareBanner(null);
    }
  };

  const { userLocation } = useLocationStore();

  const mealTypes = [
    { id: "glutenFree", name: "Gluten Free" },
    { id: "nutFree", name: "Nut Free" },
    { id: "sesame", name: "Sesame" },
    { id: "vegan", name: "Vegan" },
    { id: "vegetarian", name: "Vegetarian" },
    { id: "halal", name: "Halal" },
    { id: "kosher", name: "Kosher" },
    { id: "mediterranean", name: "Mediterranean" },
    { id: "carnivore", name: "Carnivore" },
    { id: "keto", name: "Keto" },
    { id: "lowCarb", name: "Low Carb" },
    { id: "paleo", name: "Paleo" }
  ];

  const categoriesData = [
    { id: "main-dish", name: "Main Dish", icon: "/images/MainDish.png" },
    { id: "desserts", name: "Desserts", icon: "/images/Desert.png" },
    { id: "drinks", name: "Drinks", icon: "/images/Drink.png" },
  ];

  // Map UI categories to backend itemType values (memoized to keep stable identity)
  const categoryToItemTypeMap = useMemo<Record<string, string>>(
    () => ({
    "Main Dish": "Main Meal",
    "Desserts": "Dessert", 
    "Drinks": "Drink",
    }),
    [],
  );

  // Supported allergy keys per backend response
  const allergyOptions = [
    "milk",
    "egg",
    "wheat",
    "soy",
    "fish",
    "peanuts",
    "treeNuts",
  ];

  // Function to fetch meals from backend with complete filtering
  const fetchMealsFromBackend = useCallback(async (page = 1, applyDefaultFilters = true) => {
    console.log("filter:req", { p: page, d: applyDefaultFilters });
    
    // Prevent multiple initial requests (only on very first load)
    if (page === 1 && initialRequestMadeRef.current && isInitialLoad && !filtersActive) {
      return;
    }
    
    // If this is a filter change (not initial load), allow the request
    if (filtersActive && !isInitialLoad) {
    }
    
    // Build a stable request key to dedupe/cancel only when different
    const distanceInMiles = distance && distance.length > 0 ? distance[0] : 15;
    const requestKey = JSON.stringify({
      page,
      applyDefaultFilters,
      distanceInMiles,
      calorieRange,
      selectedCategories,
      selectedRestaurants,
      selectedMealTypes,
      selectedAllergies,
    });

    // Cancel previous request only if we are issuing a different request and not on initial load
    if (abortControllerRef.current && !isInitialLoad && lastRequestKeyRef.current !== requestKey) {
      abortControllerRef.current.abort();
    }
    
    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    lastRequestKeyRef.current = requestKey;
    
    setIsLoading(true);
    setError(null);
    
    // Meals are already cleared in filter effect, no need to clear again
    
    // Mark initial request as made (do NOT flip isInitialLoad yet to avoid aborting the first call in dev StrictMode)
    if (page === 1 && isInitialLoad) {
      initialRequestMadeRef.current = true;
    }

    try {
      
      // Use test coordinates for testing - these are from config.ts
      const searchLat = test_lat; // Los Angeles area: 33.7716477
      const searchLng = test_lng; // Los Angeles area: -118.1516594

      // Build query parameters with ALL filter fields
      const skip = (page - 1) * pageSize;
      
      // Convert distance filter from miles to meters (backend expects meters)
      // distanceInMiles already computed above
      
      // Special case: if distance is 0, set very small radius (1 meter) to show no results
      const maxDistanceInMeters = distanceInMiles === 0 
        ? 1 // 1 meter - will show no restaurants since none are that close
        : Math.round(distanceInMiles * 1609.34); // Convert miles to meters
      
      const params = new URLSearchParams({
        longitude: searchLng.toString(),
        latitude: searchLat.toString(),
        maxDistance: maxDistanceInMeters.toString(),
        limit: String(pageSize), // Fetch more items per page
        skip: String(skip) // Add skip parameter for pagination
      });
      
      

      // Apply calorie range filters
      if (calorieRange && Array.isArray(calorieRange) && calorieRange.length === 2) {
        const minCal = Number(calorieRange[0]);
        const maxCal = Number(calorieRange[1]);

        if (Number.isFinite(minCal) && minCal > 0) {
          params.append('caloriesKcalMin', minCal.toString());
        }
        if (Number.isFinite(maxCal) && maxCal > 0) {
          params.append('caloriesKcalMax', maxCal.toString());
        }
      } else if (applyDefaultFilters) {
        // Apply default filters if no custom calorie range is set
        params.append('caloriesKcalMin', '400');
        params.append('caloriesKcalMax', '800');
      }
      


      // Apply itemType filter (either from category selection or default)
      let itemTypeToUse: string | null = null;
      
      // First priority: user-selected category
      if (selectedCategories.length > 0) {
        const category = selectedCategories[0];
        itemTypeToUse = categoryToItemTypeMap[category];
      }
      
      // Second priority: default filter if no category is selected and default filters are requested
      if (!itemTypeToUse && applyDefaultFilters) {
        itemTypeToUse = 'Main Meal';
      }
      
      // Apply the itemType filter only once
      if (itemTypeToUse) {
        params.append('itemType', itemTypeToUse);
      }

      // Apply restaurant filter
      if (selectedRestaurants.length > 0) {
        const restaurantIds = restaurantsList
          .filter((r) => selectedRestaurants.includes(r.id))
          .map((r) => r.id);
        params.append('restaurantIds', restaurantIds.join(','));
        
        
      }

      // Apply meal types filter
      if (selectedMealTypes.length > 0) {
        params.append('mealTypes', selectedMealTypes.join(','));
      }

      // Apply allergy filters (exclude items with these allergies)
      if (selectedAllergies.length > 0) {
        params.append('allergies', selectedAllergies.join(','));
      }

      const apiUrl = `${BASE_API_URL}/foods/find-nearby?${params}`;
      
      
      
      const requestStartTime = Date.now();
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal, // Add abort signal
      });
      
      const requestEndTime = Date.now();
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      
      const data = await response.json();
      const menuItems: any[] = Array.isArray(data?.data) ? data.data : [];
      
      
      // Now data directly contains food items with restaurant information
      const transformedMeals: IMeal[] = menuItems.map((meal: any) => ({
        _id: meal._id,
        name: meal.name,
        description: meal.description,
        image: meal.image,
        price: meal.price || 0,
        url: meal.url,
        ubereatsUrl: meal.ubereatsUrl,
        nutritionalInformation: meal.nutritionalInformation,
        reviewSummary: meal.reviewSummary,
        restaurant: meal.restaurant ? {
          _id: meal.restaurant._id,
          name: meal.restaurant.name,
          url: meal.restaurant.url,
          location: meal.restaurant.location,
          heroUrl: meal.restaurant.heroUrl,
          distance: undefined, // Will be calculated on demand
        } : undefined,
        itemType: meal.itemType,
        category: meal.category,
        dietaryPreferences: meal.dietaryPreferences,
        allergies: meal.allergies,
      }));

      
      // Always replace meals for proper pagination (not append)
      setAllMeals([]);
      setMeals(transformedMeals);
      // Don't clear mealsWithDistances immediately - let distance calculation handle it
      
      setCurrentPage(page);

      // Use pagination metadata from backend
      const hasMore = data?.meta?.hasMore || false;
      const totalItems = data?.meta?.totalItems || 0;
      setHasMore(hasMore);
      setTotalItemsCount(totalItems);
      
      

      // Mark as having initial data if this is the first page
      if (page === 1) {
        setHasInitialData(true);
      }

    } catch (err) {
      
      // Don't show error if request was aborted (user changed filters)
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Don't update state for cancelled requests
      }
      
      // Downgrade errors during initial load to keep skeleton and avoid flashing error
      if (isInitialLoad) {
        return;
      }
      
      
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      if (page === 1) {
        setMeals([]);
      }
    } finally {
      // Only update loading state if this is the current request
      if (abortControllerRef.current === abortController) {
        setIsLoading(false);
        // Flip isInitialLoad only after the first request truly completes
        if (page === 1 && isInitialLoad) {
          setIsInitialLoad(false);
        }
      }
    }
  }, [
    isInitialLoad,
    distance,
    calorieRange,
    selectedCategories,
    categoryToItemTypeMap,
    selectedRestaurants,
    restaurantsList,
    selectedMealTypes,
    selectedAllergies,
    filtersActive,
  ]);

  // Now that fetchMealsFromBackend is defined, wire the ref to call it safely
  useEffect(() => {
    triggerFilterFetchRef.current = () => { fetchMealsFromBackend(1, false); };
    return () => { triggerFilterFetchRef.current = null; };
  }, [fetchMealsFromBackend]);

  // Fetch nearby restaurants for filter
  const fetchNearbyRestaurants = useCallback(async () => {
    try {
      // Use the same distance filter logic as meals
      const distanceInMiles = distance && distance.length > 0 ? distance[0] : 15;
      
      // Special case: if distance is 0, set very small radius (1 meter) to show no results
      const maxDistanceInMeters = distanceInMiles === 0 
        ? 1 // 1 meter - will show no restaurants since none are that close
        : Math.round(distanceInMiles * 1609.34); // Convert miles to meters
      
      const params = new URLSearchParams({
        longitude: test_lng.toString(),
        latitude: test_lat.toString(),
        maxDistance: maxDistanceInMeters.toString(),
      });
      const url = `${BASE_API_URL}/restaurants/find-nearby?${params}`;
      
      const res = await fetch(url);
      if (!res.ok) {
        return;
      }
      const data = await res.json();
      const list = (data?.data || []).map((r: any) => ({ id: r._id, name: r.name }));
      setRestaurantsList(list);
      

    } catch (e) {
      // ignore silently for filters
    }
  }, [distance]);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    // Round to 2 decimal places for more precision
    const result = Math.round(distance * 100) / 100;
    
    // If distance is very small (less than 0.01 miles = ~53 feet), show as 0.01 instead of 0.00
    if (result < 0.01) {
      return 0.01;
    }
    
    return result;
  }, []);

  // Get timezone based on city/locality
  const getTimezoneByCity = useCallback((locality: string, region?: string): string => {
    const cityTimezones: Record<string, string> = {
      'New York': 'America/New_York',
      'Los Angeles': 'America/Los_Angeles',
      'Chicago': 'America/Chicago',
      'Houston': 'America/Chicago',
      'Phoenix': 'America/Phoenix',
      'Philadelphia': 'America/New_York',
      'San Antonio': 'America/Chicago',
      'San Diego': 'America/Los_Angeles',
      'Dallas': 'America/Chicago',
      'San Jose': 'America/Los_Angeles',
      'Austin': 'America/Chicago',
      'Jacksonville': 'America/New_York',
      'Fort Worth': 'America/Chicago',
      'Columbus': 'America/New_York',
      'Charlotte': 'America/New_York',
      'San Francisco': 'America/Los_Angeles',
      'Indianapolis': 'America/New_York',
      'Seattle': 'America/Los_Angeles',
      'Denver': 'America/Denver',
      'Boston': 'America/New_York',
      'El Paso': 'America/Denver',
      'Detroit': 'America/New_York',
      'Nashville': 'America/Chicago',
      'Portland': 'America/Los_Angeles',
      'Memphis': 'America/Chicago',
      'Oklahoma City': 'America/Chicago',
      'Las Vegas': 'America/Los_Angeles',
      'Louisville': 'America/New_York',
      'Baltimore': 'America/New_York',
      'Milwaukee': 'America/Chicago',
      'Albuquerque': 'America/Denver',
      'Tucson': 'America/Phoenix',
      'Fresno': 'America/Los_Angeles',
      'Sacramento': 'America/Los_Angeles',
      'Mesa': 'America/Phoenix',
      'Kansas City': 'America/Chicago',
      'Atlanta': 'America/New_York',
      'Long Beach': 'America/Los_Angeles',
      'Colorado Springs': 'America/Denver',
      'Raleigh': 'America/New_York',
      'Miami': 'America/New_York',
      'Virginia Beach': 'America/New_York',
      'Omaha': 'America/Chicago',
      'Oakland': 'America/Los_Angeles',
      'Minneapolis': 'America/Chicago',
      'Tulsa': 'America/Chicago',
      'Arlington': 'America/Chicago',
      'Tampa': 'America/New_York',
      'New Orleans': 'America/Chicago',
      'Wichita': 'America/Chicago',
      'Cleveland': 'America/New_York',
      'Bakersfield': 'America/Los_Angeles',
      'Aurora': 'America/Denver',
      'Anaheim': 'America/Los_Angeles',
      'Honolulu': 'Pacific/Honolulu',
      'Santa Ana': 'America/Los_Angeles',
      'Corpus Christi': 'America/Chicago',
      'Riverside': 'America/Los_Angeles',
      'Lexington': 'America/New_York',
      'Stockton': 'America/Los_Angeles',
      'Henderson': 'America/Los_Angeles',
      'Saint Paul': 'America/Chicago',
      'St. Louis': 'America/Chicago',
      'Cincinnati': 'America/New_York',
      'Pittsburgh': 'America/New_York'
    };

    // Try exact match first
    if (cityTimezones[locality]) {
      return cityTimezones[locality];
    }

    // Try partial match
    for (const [city, timezone] of Object.entries(cityTimezones)) {
      if (locality.toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(locality.toLowerCase())) {
        return timezone;
      }
    }

    // Default fallback based on common US regions
    if (region) {
      const stateTimezones: Record<string, string> = {
        'NY': 'America/New_York', 'NJ': 'America/New_York', 'CT': 'America/New_York',
        'MA': 'America/New_York', 'PA': 'America/New_York', 'DE': 'America/New_York',
        'MD': 'America/New_York', 'DC': 'America/New_York', 'VA': 'America/New_York',
        'WV': 'America/New_York', 'OH': 'America/New_York', 'KY': 'America/New_York',
        'TN': 'America/Chicago', 'NC': 'America/New_York', 'SC': 'America/New_York',
        'GA': 'America/New_York', 'FL': 'America/New_York', 'AL': 'America/Chicago',
        'MS': 'America/Chicago', 'LA': 'America/Chicago', 'AR': 'America/Chicago',
        'MO': 'America/Chicago', 'IA': 'America/Chicago', 'MN': 'America/Chicago',
        'WI': 'America/Chicago', 'IL': 'America/Chicago', 'IN': 'America/New_York',
        'MI': 'America/New_York', 'TX': 'America/Chicago', 'OK': 'America/Chicago',
        'KS': 'America/Chicago', 'NE': 'America/Chicago', 'SD': 'America/Chicago',
        'ND': 'America/Chicago', 'MT': 'America/Denver', 'WY': 'America/Denver',
        'CO': 'America/Denver', 'NM': 'America/Denver', 'AZ': 'America/Phoenix',
        'UT': 'America/Denver', 'ID': 'America/Denver', 'NV': 'America/Los_Angeles',
        'CA': 'America/Los_Angeles', 'OR': 'America/Los_Angeles', 'WA': 'America/Los_Angeles',
        'AK': 'America/Anchorage', 'HI': 'Pacific/Honolulu'
      };
      
      if (stateTimezones[region]) {
        return stateTimezones[region];
      }
    }

    // Default to New York timezone
    return 'America/New_York';
  }, []);

  // Check if restaurant is currently open based on opening hours
  const isRestaurantOpen = useCallback((openingHours: any[], locality: string, region?: string): boolean => {
    if (!openingHours || openingHours.length === 0) {
      return false; // Assume closed if no opening hours provided
    }

    const timezone = getTimezoneByCity(locality, region);
    const now = new Date();
    
    // Get current time in restaurant's timezone
    const currentTimeInRestaurantTZ = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour12: false,
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit'
    }).formatToParts(now);

    const currentDay = currentTimeInRestaurantTZ.find(part => part.type === 'weekday')?.value;
    const currentHour = parseInt(currentTimeInRestaurantTZ.find(part => part.type === 'hour')?.value || '0');
    const currentMinute = parseInt(currentTimeInRestaurantTZ.find(part => part.type === 'minute')?.value || '0');
    const currentTimeInMinutes = currentHour * 60 + currentMinute;



    // Check each opening hours entry
    for (const hours of openingHours) {
      const { dayRange, sectionHours } = hours;
      
      // Check if current day matches the day range
      let dayMatches = false;
      if (dayRange.includes('-')) {
        // Handle ranges like "Monday - Friday"
        const [startDay, endDay] = dayRange.split(' - ').map((d: string) => d.trim());
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const startIndex = days.indexOf(startDay);
        const endIndex = days.indexOf(endDay);
        const currentIndex = days.indexOf(currentDay || '');
        
        if (startIndex !== -1 && endIndex !== -1 && currentIndex !== -1) {
          if (startIndex <= endIndex) {
            dayMatches = currentIndex >= startIndex && currentIndex <= endIndex;
          } else {
            // Handle wrap-around (e.g., Friday - Sunday)
            dayMatches = currentIndex >= startIndex || currentIndex <= endIndex;
          }
        }
      } else {
        // Handle single day
        dayMatches = dayRange === currentDay;
      }

      if (dayMatches && sectionHours && sectionHours.length > 0) {
        // Check if current time falls within any section hours
        for (const section of sectionHours) {
          const { startTime, endTime } = section;
          if (typeof startTime === 'number' && typeof endTime === 'number') {
            if (currentTimeInMinutes >= startTime && currentTimeInMinutes <= endTime) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }, [getTimezoneByCity]);

  // Calculate distances for currently displayed meals
  const calculateDistancesForCurrentMeals = useCallback(async (mealsToProcess: IMeal[]): Promise<IMeal[]> => {
    const updatedMeals = await Promise.all(
      mealsToProcess.map(async (meal) => {
        // If distance is already calculated, return the meal as is
        if (meal.restaurant?.distance !== undefined) {
          return meal;
        }

        try {
          // Get restaurant info from the foods endpoint
          const foodRestaurantsRes = await fetch(`${BASE_API_URL}/foods/${meal._id}/restaurants`);
          if (foodRestaurantsRes.ok) {
            const foodRestaurantsData = await foodRestaurantsRes.json();
            const restaurants = foodRestaurantsData?.data;
            
            if (restaurants && restaurants.length > 0) {
              const restaurantDetails = restaurants[0]; // Take the first restaurant
              
              // DEBUG LOG - کپی کن و بفرست
            
            let distance: number | undefined;
            let heroUrl: string | undefined;
            let locality: string | undefined;
            let region: string | undefined;
            let openingHours: any[] | undefined;
            let isOpen: boolean | undefined;
            let rating: number | undefined;
            let reviewSummary: any | undefined;

              // Calculate distance from user location to restaurant
              if (restaurantDetails?.location?.coordinates && Array.isArray(restaurantDetails.location.coordinates) && restaurantDetails.location.coordinates.length >= 2) {
                const [restaurantLng, restaurantLat] = restaurantDetails.location.coordinates;
                

                
                // Validate coordinates before calculation
                if (typeof restaurantLat === 'number' && typeof restaurantLng === 'number' && 
                    typeof test_lat === 'number' && typeof test_lng === 'number' &&
                    !isNaN(restaurantLat) && !isNaN(restaurantLng) && 
                    !isNaN(test_lat) && !isNaN(test_lng)) {
                  distance = calculateDistance(test_lat, test_lng, restaurantLat, restaurantLng);
                  
                  // Calculate raw distance for debugging
                  const R = 3959;
                  const dLat = (restaurantLat - test_lat) * Math.PI / 180;
                  const dLon = (restaurantLng - test_lng) * Math.PI / 180;
                  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(test_lat * Math.PI / 180) * Math.cos(restaurantLat * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
                  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                  const rawDistance = R * c;
                  
                } else {

                  distance = undefined;
                }
              } else {
                // DEBUG LOG - کپی کن و بفرست
              }
            
            heroUrl = restaurantDetails?.heroUrl;
            locality = restaurantDetails?.locality;
            region = restaurantDetails?.region;
            openingHours = restaurantDetails?.openingHours;
            rating = restaurantDetails?.rating;
            reviewSummary = restaurantDetails?.reviewSummary;

              // Check if restaurant is currently open
              if (openingHours && locality) {
                isOpen = isRestaurantOpen(openingHours, locality, region);
              }

              return {
                ...meal,
                restaurant: {
                  _id: restaurantDetails._id || meal.restaurant?._id || '',
                  name: restaurantDetails.name || meal.restaurant?.name || '',
                  url: restaurantDetails.url || meal.restaurant?.url,
                  location: restaurantDetails?.location || meal.restaurant?.location,
                  heroUrl: heroUrl || meal.restaurant?.heroUrl,
                  distance: distance,
                  locality: locality,
                  region: region,
                  openingHours: openingHours,
                  isOpen: isOpen,
                  rating: rating,
                  reviewSummary: reviewSummary,
                }
              };
            }
          }
        } catch (error) {
        }

        return meal;
      })
    );

    return updatedMeals;
  }, [isRestaurantOpen, calculateDistance]);

  // Fetch restaurant image for a meal
  const fetchRestaurantImage = async (mealId: string): Promise<string | undefined> => {
    try {
      // First, get the restaurant ID for this meal
      const restaurantsUrl = `${BASE_API_URL}/foods/${mealId}/restaurants`;
      const restaurantsResponse = await fetch(restaurantsUrl);
      
      if (!restaurantsResponse.ok) {
        return undefined;
      }
      
      const restaurantsData = await restaurantsResponse.json();
      const restaurants = restaurantsData?.data;
      
      if (!restaurants || restaurants.length === 0) {
        return undefined;
      }
      
      // Get the first restaurant (assuming one restaurant per meal)
      const restaurantId = restaurants[0]._id;
      
      // Then, get the restaurant details including heroUrl
      const restaurantUrl = `${BASE_API_URL}/restaurants/${restaurantId}`;
      const restaurantResponse = await fetch(restaurantUrl);
      
      if (!restaurantResponse.ok) {
        return undefined;
      }
      
      const restaurantData = await restaurantResponse.json();
      const restaurant = restaurantData?.data;
      
      return restaurant?.heroUrl || undefined;
    } catch (error) {
      return undefined;
    }
  };

  // Fetch restaurants list only after initialization and when distance changes
  useEffect(() => {
    if (!isInitializedRef.current) return; // Wait for initialization
    fetchNearbyRestaurants();
  }, [distance, fetchNearbyRestaurants]);

  // Fetch restaurant info for each meal
  // moved below to avoid "used before declaration" issues

  // Strictly control bottom navigation render by viewport width
  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 1099px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsBelow1100(("matches" in e ? e.matches : (e as MediaQueryList).matches));
    };
    // Initial
    handler(media);
    // Subscribe
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handler);
      return () => media.removeEventListener("change", handler);
    } else {
      media.addListener(handler as any);
      return () => media.removeListener(handler as any);
    }
  }, []);

  const getMealDistanceMiles = (meal: IMeal): number | undefined => {
    const coords = meal?.restaurant?.location?.coordinates;
    if (!coords || coords.length < 2) return undefined;
    const [lng2, lat2] = coords as [number, number];
    const lat1 = userLocation.lat;
    const lng1 = userLocation.lng;
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 3958.8; // Earth radius in miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // For backend filtering, use meals directly since filtering is done on backend
  const filteredMeals = meals; // Backend already returns filtered results

  // Total filtered count comes from backend
  const [totalItemsCount, setTotalItemsCount] = useState(0);

  // hasMore is now controlled by backend response, no need for local calculation

  // Ensure filtersActive flips to true on any user-facing filter change
  useEffect(() => {
    if (!isInitializedRef.current) return;
    // Mark that filters have changed and should trigger fetch via the filters effect
    setFiltersActive(true);
  }, [
    selectedRestaurants,
    selectedMealTypes,
    selectedCategories,
    selectedAllergies,
    calorieRange,
    distance,
  ]);

  // If user changed filters during initial load, trigger fetch once initial load completes
  useEffect(() => {
    if (!isInitialLoad && isInitializedRef.current && filtersActive) {
      setCurrentPage(1);
      void fetchMealsFromBackend(1, false);
    }
  }, [isInitialLoad, fetchMealsFromBackend, filtersActive]);

  // Removed immediate fire to avoid duplicate requests; rely on debounced flow

  // Reset to first page whenever filters change and fetch new data with debouncing
  useEffect(() => {
    
    // Only react to user-driven filter changes
    if (!filtersActive) {
      return;
    }

    // Skip during bootstrap/initial fetch to avoid aborting the first request
    if (!isInitializedRef.current || isInitialLoad) {
      return; // Wait for initialization
    }
    
    setCurrentPage(1);
    
    // Show skeleton and clear current meals when filters change
    setIsLoading(true);
    setHasInitialData(false);
    setMeals([]);
    setMealsWithDistances([]);
    
    // Debounce the API call to prevent too many requests
    if (suppressEffectRef.current) {
      // This change was already handled by handler-triggered debounce
      suppressEffectRef.current = false;
      return;
    }
    console.log("filter:debounce");
    const timeoutId = setTimeout(() => {
      console.log("filter:fetch");
      fetchMealsFromBackend(1, false);
    }, 300); // 300ms debounce
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    selectedRestaurants,
    selectedMealTypes,
    selectedCategories,
    selectedAllergies,
    calorieRange,
    distance,
    filtersActive,
    isInitialLoad,
    fetchMealsFromBackend,
  ]);

  // Calculate distances for currently displayed meals
  useEffect(() => {
    
    
    const calculateDistances = async () => {
      if (filteredMeals.length > 0) {
        
        // If distance filter is set to 0, don't calculate distances - show empty results
        const distanceInMiles = distance && distance.length > 0 ? distance[0] : 15;
        if (distanceInMiles === 0) {
          setMealsWithDistances([]);
          setHasInitialData(true);
          return;
        }
        
        // Check if meals already have distance calculated to prevent re-calculation
        const needsCalculation = filteredMeals.some(meal => 
          meal.restaurant && meal.restaurant.distance === undefined
        );
        
        if (!needsCalculation) {
          // All meals already have distance calculated, just update state
          setMealsWithDistances(filteredMeals);
          setHasInitialData(true);
          return;
        }
        
        // Don't show skeleton during distance calculation - keep showing current meals
        setIsCalculatingDistances(false); // Don't show skeleton
        
        try {
          const distanceStartTime = Date.now();
          const mealsWithCalculatedDistances = await calculateDistancesForCurrentMeals(filteredMeals);
          const distanceEndTime = Date.now();
          
          setMealsWithDistances(mealsWithCalculatedDistances);
          setHasInitialData(true); // Mark as having complete data
        } finally {
          setIsCalculatingDistances(false);
        }
      } else {
        // No meals, clear the distances array
        setMealsWithDistances([]);
      }
    };

    calculateDistances();
  }, [
    filteredMeals,
    distance,
    calculateDistancesForCurrentMeals,
  ]);

  // Initial fetch on mount - REMOVED, will be handled by URL params effect
  // useEffect(() => {
  //   fetchMealsFromBackend(1, true);
  //   
  //   // Cleanup function to cancel any pending requests
  //   return () => {
  //     if (abortControllerRef.current) {

  //       abortControllerRef.current.abort();
  //     }
  //   };
  // }, [fetchMealsFromBackend]);

  // Restaurant info is now included in the food data, so this is no longer needed
  // Keeping the useEffect but disabling the actual fetching
  useEffect(() => {
    // Restaurant data is now included in the main food response
  }, [filteredMeals]);

  // Fetch food details (to get UberEats link path) for displayed meals
  useEffect(() => {
    const fetchFoodDetails = async () => {
      if (!filteredMeals || filteredMeals.length === 0) return;
      const uniqueFoodIds = Array.from(new Set(filteredMeals.map((m) => m._id).filter(Boolean)));
      if (uniqueFoodIds.length === 0) return;
      
      const missingIds = uniqueFoodIds.filter((id) => id && typeof id === 'string' && id.length === 24 && foodDetailsById[id] === undefined);
      if (missingIds.length === 0) return;
      
      const results = await Promise.allSettled(
        missingIds.map(async (foodId) => {
          try {
            const res = await fetch(`${BASE_API_URL}/foods/${foodId}`);
            if (!res.ok) {
              return { foodId, data: null };
            }
            const json = await res.json();
            return { foodId, data: json?.data || json } as any;
          } catch (e) {
            return { foodId, data: null } as any;
          }
        })
      );
      const map: Record<string, any> = {};
      results.forEach((r) => {
        if (r.status === 'fulfilled' && r.value && r.value.data) {
          map[r.value.foodId] = r.value.data;
        }
      });
      if (Object.keys(map).length > 0) {
        setFoodDetailsById((prev) => ({ ...prev, ...map }));
      }
    };
    fetchFoodDetails();
  }, [filteredMeals, foodDetailsById]);

  const handleClearFilters = async () => {
    setSelectedRestaurants([]);
    setSelectedMealTypes([]);
    setSelectedCategories([]);
    setSelectedAllergies([]);
    setDistance([15]); // Reset to default distance
    setCalorieRange([400, 800]); // Reset to default calorie range
    setFiltersActive(true); // Keep filters active with defaults
    // Fetch items with default filters when filters are cleared
    await fetchMealsFromBackend(1, true);
  };

  // Share meal function
  const handleShareMeal = async (mealId: string, mealName: string) => {
    const mealUrl = `${window.location.origin}${Routes.Meals}?id=${mealId}`;
    const shareText = `Check out this delicious meal: ${mealName}`;
    
    if (navigator.share) {
      // Use native Web Share API if available (mobile devices)
      try {
        await navigator.share({
          title: mealName,
          text: shareText,
          url: mealUrl,
        });
      } catch (error) {
        // User cancelled or error occurred, fall back to clipboard
        await navigator.clipboard.writeText(mealUrl);
        alert('Link copied to clipboard!');
      }
    } else {
      // Fall back to copying to clipboard for desktop
      try {
        await navigator.clipboard.writeText(mealUrl);
        alert('Link copied to clipboard! You can now share it on any social media.');
      } catch (error) {
        // If clipboard API is not available, show the URL in a prompt
        prompt('Copy this link to share:', mealUrl);
      }
    }
  };

  const handleRestaurantChange = (restaurantId: string, checked: boolean) => {
    if (checked) {
      setSelectedRestaurants([...selectedRestaurants, restaurantId]);
    } else {
      setSelectedRestaurants(selectedRestaurants.filter(id => id !== restaurantId));
    }
    setFiltersActive(true);
    triggerFilterFetch();
  };

  const handleMealTypeChange = (mealTypeId: string, checked: boolean) => {
    if (checked) {
      setSelectedMealTypes([...selectedMealTypes, mealTypeId]);
    } else {
      setSelectedMealTypes(selectedMealTypes.filter(id => id !== mealTypeId));
    }
    setFiltersActive(true);
    triggerFilterFetch();
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId]);
    } else {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    }
    setFiltersActive(true);
    triggerFilterFetch();
  };

  const handleAllergyChange = (allergyId: string, checked: boolean) => {
    if (checked) {
      setSelectedAllergies([...selectedAllergies, allergyId]);
    } else {
      setSelectedAllergies(selectedAllergies.filter(id => id !== allergyId));
    }
    setFiltersActive(true);
    triggerFilterFetch();
  };

  // On first load: if URL has params (coming from landing search), apply them; otherwise apply default filters
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    
    const url = new URL(window.location.href);
    const minCalParam = url.searchParams.get("minCal");
    const maxCalParam = url.searchParams.get("maxCal");
    const distanceParam = url.searchParams.get("distance");
    const dietsParam = url.searchParams.get("diets");
    const allergiesParam = url.searchParams.get("allergies");

    const minCal = parseInt(minCalParam ?? "", 10);
    const maxCal = parseInt(maxCalParam ?? "", 10);
    const dist = parseFloat(distanceParam ?? "");

    const hasAnyParam =
      (minCalParam !== null && Number.isFinite(minCal)) ||
      (maxCalParam !== null && Number.isFinite(maxCal)) ||
      (distanceParam !== null && Number.isFinite(dist)) ||
      (dietsParam !== null && dietsParam.trim().length > 0) ||
      (allergiesParam !== null && allergiesParam.trim().length > 0);

    

    if (hasAnyParam) {
      
      // Apply provided params with guards
      if (Number.isFinite(minCal) && Number.isFinite(maxCal)) {
        setCalorieRange([
          Math.max(0, Math.min(3500, minCal)),
          Math.max(0, Math.min(3500, maxCal)),
        ]);
      }
      if (Number.isFinite(dist)) {
        setDistance([Math.max(1, Math.min(15, Math.round(dist)))]);
      }
      if (dietsParam) {
        const ids = dietsParam.split(',').map((s) => s.trim()).filter(Boolean);
        setSelectedMealTypes(ids);
      }
      if (allergiesParam) {
        const ids = allergiesParam.split(',').map((s) => s.trim()).filter(Boolean);
        setSelectedAllergies(ids);
      }
      setFiltersActive(true);
    } else {
      
      // No params → apply default filters (Main Meal, 400-800 calories)
      setCalorieRange([400, 800]);
      setSelectedCategories(["Main Dish"]); // This will trigger Main Meal itemType
      // Don't set filtersActive to true during initialization - let it be false for initial load
    }
    
    // Mark as initialized and trigger initial fetch
    
    isInitializedRef.current = true;
    
    
    // Single coordinated initial fetch
    fetchMealsFromBackend(1, true);
    // fetchNearbyRestaurants will be called by the restaurant effect after initialization
  }, []);

  return (
    <div>
      <Header />
      
      <div className="w-screen min-h-screen" style={{ paddingTop: '47px' }}>
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #2563eb;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #1d4ed8;
          }
          
          @media (max-width: 1023px) {
            .mobile-responsive {
              margin-left: 0 !important;
              margin-right: 0 !important;
              width: 100% !important;
              padding-left: 1rem !important;
              padding-right: 1rem !important;
            }
          }
          @media (max-width: 425px) {
            .mobile-responsive {
              padding-left: 8px !important;
              padding-right: 8px !important;
            }
          }
          @keyframes pulseDot {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.35); opacity: 1; }
          }
          .dot-1 { animation: pulseDot 1.6s ease-in-out 0s infinite; }
          .dot-2 { animation: pulseDot 1.6s ease-in-out 0.2s infinite; }
          .dot-3 { animation: pulseDot 1.6s ease-in-out 0.4s infinite; }
          /* Hide filters and expand content when width < 1100px */
          @media (max-width: 1099px) {
            .products-grid {
              grid-template-columns: 1fr !important;
            }
            .products-sidebar {
              display: none !important;
            }
            .products-main {
              margin-left: 0 !important;
              max-width: 100% !important;
              width: 100% !important;
            }
            .products-meal-card {
              max-width: 100% !important;
              width: 100% !important;
            }
          }
          /* Bottom navigation visible below 1100px */
          .products-bottomnav { display: none; }
          @media (max-width: 1099px) { .products-bottomnav { display: block !important; } }
          @media (min-width: 1100px) { .products-bottomnav { display: none !important; } }
          
          /* Prevent card overlapping on very small screens */
          @media (max-width: 425px) {
            .mobile-card-container {
              padding-left: 8px !important;
              padding-right: 8px !important;
              gap: 16px !important;
              grid-template-columns: 1fr !important;
              place-items: center !important;
              justify-items: center !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .mobile-meal-card {
              max-width: calc(100vw - 16px) !important;
              width: calc(100vw - 16px) !important;
              margin: 0 auto !important;
              display: block !important;
              box-sizing: border-box !important;
            }
            .mobile-card-container .flex {
              align-items: center !important;
              justify-content: center !important;
            }
            .mobile-meal-card .grid-cols-4 {
              grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
              gap: 8px !important;
            }
            .mobile-meal-card .flex {
              flex-wrap: wrap !important;
            }
            .mobile-meal-card .gap-3 {
              gap: 6px !important;
            }
            .mobile-meal-card .flex.gap-3 {
              gap: 4px !important;
            }
            .mobile-meal-card .p-4 {
              padding: 12px !important;
            }
            /* Ensure single column layout */
            .md\\:hidden.grid {
              display: grid !important;
              grid-template-columns: 1fr !important;
            }
            /* Force full width on very small screens */
            body {
              overflow-x: hidden !important;
            }
          }
        `}</style>
        <div className="mobile-responsive mx-auto max-w-[1320px] px-2 sm:px-4 lg:px-8 mt-[-40px] pt-16 pb-24 lg:pt-[104px] lg:pb-[104px]">
          <div className="products-grid grid grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)]" style={{ gap: '16px' }}>
            {/* Desktop Sidebar Filters - Hidden on mobile */}
            <div className="products-sidebar hidden lg:block lg:col-span-1 lg:w-[280px]">
              <div className="bg-white rounded-3xl p-6 shadow-sm sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar" style={{ borderRadius: '24px', scrollbarWidth: 'thin', scrollbarColor: '#2563eb #f1f5f9' }}>
                {/* Calories */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => setCaloriesOpen(v => !v)}>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-1 h-6 rounded bg-[#5B5BF0]"></span>
                      <h3 className="text-lg font-semibold text-gray-900">Calories</h3>
                    </div>
                    <svg className={`h-5 w-5 text-gray-700 transition-transform duration-300 ${caloriesOpen ? "rotate-180" : "rotate-0"}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M10 12a1 1 0 0 1-.707-.293l-4-4a1 1 0 1 1 1.414-1.414L10 9.586l3.293-3.293a1 1 0 0 1 1.414 1.414l-4 4A1 1 0 0 1 10 12z" clipRule="evenodd"/></svg>
                  </div>
                  {caloriesOpen && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Min: {calorieRange?.[0] ?? 100}</div>
                      <div className="rounded-full border border-gray-300 bg-white px-4 py-2 text-gray-700 text-sm min-w-[84px]">
                        {calorieRange?.[0] ?? 100}
                      </div>
                        </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Max: {(calorieRange?.[1] ?? 3500) >= 3500 ? '3500+' : (calorieRange?.[1] ?? 3500)}</div>
                      <div className="rounded-full border border-gray-300 bg-white px-4 py-2 text-gray-700 text-sm min-w-[84px]">
                        {(calorieRange?.[1] ?? 3500) >= 3500 ? '3500+' : (calorieRange?.[1] ?? 3500)}
                      </div>
                    </div>
                  </div>
                  )}
                  {caloriesOpen && (
                  <DualRangeSlider
                    value={calorieRange}
                    onValueChange={(val) => { 
                      
                      setCalorieRange(val); 
                      setFiltersActive(true); 
                    }}
                    max={3500}
                    min={100}
                    step={100}
                    minStepsBetweenThumbs={0}
                    aria-label="Calories"
                    className="w-full"
                  />
                  )}
                  {caloriesOpen && (
                    <>
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>0</span>
                        <span>1750</span>
                        <span>3500+</span>
                      </div>
                      <div className="my-6 h-[1px] bg-gray-200"></div>
                    </>
                  )}
                </div>

                {/* Categories */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => setCategoriesOpen(v => !v)}>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-1 h-6 rounded bg-[#5B5BF0]"></span>
                      <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
                    </div>
                    <svg className={`h-5 w-5 text-gray-700 transition-transform duration-300 ${categoriesOpen ? "rotate-180" : "rotate-0"}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M10 12a1 1 0 0 1-.707-.293l-4-4a1 1 0 1 1 1.414-1.414L10 9.586l3.293-3.293a1 1 0 0 1 1.414 1.414l-4 4A1 1 0 0 1 10 12z" clipRule="evenodd"/></svg>
                  </div>
                  {categoriesOpen && (
                    <div className="space-y-0">
                      {categoriesData.map((cat) => (
                        <div key={cat.id}>
                          <label htmlFor={`cat-${cat.id}`} className="flex items-center gap-3 py-3 cursor-pointer">
                            <input
                              id={`cat-${cat.id}`}
                              type="radio"
                              name="category"
                              checked={selectedCategories.includes(cat.name)}
                              onChange={() => { setSelectedCategories([cat.name]); setFiltersActive(true); }}
                              className="appearance-none w-4 h-4 border border-gray-300 !rounded-none checked:bg-blue-600 checked:border-blue-600"
                            />
                            <Image
                              src={cat.icon}
                              alt={cat.name}
                              width={18}
                              height={18}
                              className="w-4 h-4 object-contain brightness-0"
                            />
                            <span className="text-sm text-gray-700 font-medium">{cat.name}</span>
                          </label>
                          <div className="h-[1px] bg-gray-200"></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                

                {/* Categories duplicated block removed */}

                {/* Meal type */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => setMealTypeOpen(v => !v)}>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-1 h-6 rounded bg-[#5B5BF0]"></span>
                      <h3 className="text-lg font-semibold text-gray-900">Diets</h3>
                    </div>
                    <svg className={`h-5 w-5 text-gray-700 transition-transform duration-300 ${mealTypeOpen ? "rotate-180" : "rotate-0"}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M10 12a1 1 0 0 1-.707-.293l-4-4a1 1 0 1 1 1.414-1.414L10 9.586l3.293-3.293a1 1 0 0 1 1.414 1.414l-4 4A1 1 0 0 1 10 12z" clipRule="evenodd"/></svg>
                  </div>
                  {mealTypeOpen && (
                  <div className="space-y-0">
                    {mealTypes.map((mealType, index) => (
                      <div key={mealType.id}>
                        <label htmlFor={mealType.id} className="flex items-center space-x-3 py-3 cursor-pointer">
                          <Checkbox
                            id={mealType.id}
                            checked={selectedMealTypes.includes(mealType.id)}
                            onCheckedChange={(checked) => handleMealTypeChange(mealType.id, !!checked)}
                            className="border-gray-300 !rounded-none w-4 h-4 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                          />
                          <span className="text-sm text-gray-700 font-medium">{mealType.name}</span>
                        </label>
                        <div className="h-[1px] bg-gray-200"></div>
                      </div>
                    ))}
                  </div>
                  )}
                </div>

                {/* Allergies */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => setAllergiesOpen(v => !v)}>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-1 h-6 rounded bg-[#5B5BF0]"></span>
                      <h3 className="text-lg font-semibold text-gray-900">Allergies</h3>
                    </div>
                    <svg className={`h-5 w-5 text-gray-700 transition-transform duration-300 ${allergiesOpen ? "rotate-180" : "rotate-0"}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M10 12a1 1 0 0 1-.707-.293l-4-4a1 1 0 1 1 1.414-1.414L10 9.586l3.293-3.293a1 1 0 0 1 1.414 1.414l-4 4A1 1 0 0 1 10 12z" clipRule="evenodd"/></svg>
                  </div>
                  {allergiesOpen && (
                  <div className="space-y-0">
                    {allergyOptions.map((allergy) => (
                      <div key={allergy}>
                        <div className="flex items-center space-x-3 py-3">
                          <Checkbox
                            id={`alg-${allergy}`}
                            checked={selectedAllergies.includes(allergy)}
                            onCheckedChange={(checked) => handleAllergyChange(allergy, !!checked)}
                            className="border-gray-300 !rounded-none w-4 h-4 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                          />
                          <label htmlFor={`alg-${allergy}`} className="text-sm text-gray-700 cursor-pointer font-medium">
                            {allergy}
                          </label>
                        </div>
                        <div className="h-[1px] bg-gray-200"></div>
                      </div>
                    ))}
                  </div>
                  )}
                </div>

                {/* Restaurants */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => setRestaurantsOpen(v => !v)}>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-1 h-6 rounded bg-[#5B5BF0]"></span>
                      <h3 className="text-lg font-semibold text-gray-900">Restaurants</h3>
                    </div>
                    <svg className={`h-5 w-5 text-gray-700 transition-transform duration-300 ${restaurantsOpen ? "rotate-180" : "rotate-0"}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M10 12a1 1 0 0 1-.707-.293l-4-4a1 1 0 1 1 1.414-1.414L10 9.586l3.293-3.293a1 1 0 0 1 1.414 1.414l-4 4A1 1 0 0 1 10 12z" clipRule="evenodd"/></svg>
                  </div>
                  {restaurantsOpen && (
                  <div className="space-y-0">
                    {(restaurantsList.slice(0,4)).map((restaurant) => (
                      <div key={restaurant.id}>
                        <label htmlFor={`rest-${restaurant.id}`} className="flex items-center space-x-3 py-3 cursor-pointer">
                          <Checkbox
                            id={`rest-${restaurant.id}`}
                            checked={selectedRestaurants.includes(restaurant.id)}
                            onCheckedChange={(checked) => handleRestaurantChange(restaurant.id, !!checked)}
                            className="border-gray-300 !rounded-none w-4 h-4 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                          />
                          <span className="text-sm text-gray-700 font-medium">{restaurant.name}</span>
                        </label>
                        <div className="h-[1px] bg-gray-200"></div>
                      </div>
                    ))}
                  </div>
                  )}
                  {restaurantsOpen && (
                    <button onClick={() => setIsRestaurantsModalOpen(true)} className="mt-4 w-full rounded-full border border-[#5B5BF0] text-[#5B5BF0] py-3 text-sm font-medium">View all restaurants</button>
                  )}
                </div>

                {/* Distance */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => setDistanceOpen(v => !v)}>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-1 h-6 rounded bg-[#5B5BF0]"></span>
                      <h3 className="text-lg font-semibold text-gray-900">Distance</h3>
                    </div>
                    <svg className={`h-5 w-5 text-gray-700 transition-transform duration-300 ${distanceOpen ? "rotate-180" : "rotate-0"}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M10 12a1 1 0 0 1-.707-.293l-4-4a1 1 0 1 1 1.414-1.414L10 9.586l3.293-3.293a1 1 0 0 1 1.414 1.414l-4 4A1 1 0 0 1 10 12z" clipRule="evenodd"/></svg>
                  </div>
                  {distanceOpen && (
                    <>
                      <div className="flex items-center gap-3 mb-2">
                        {['0 mile','5 miles','15 miles'].map((label) => (
                          <span key={label} className="inline-block rounded-full bg-gray-100 text-gray-600 text-sm px-4 py-2">{label}</span>
                        ))}
                      </div>
                      <Slider value={distance} onValueChange={(val) => { 
                        
                        setDistance(val as number[]); 
                        setFiltersActive(true); 
                      }} max={15} min={0} step={1} className="w-full" />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>0 mile</span>
                        <span>5 miles</span>
                        <span>15+ miles</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="products-main col-span-1 lg:col-span-1 w-full max-w-[932px] lg:ml-10">
              {/* Results header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 md:mb-6 text-center md:text-left mt-3">
                <div className="mb-3 md:mb-0">
                  <div className="text-xl font-semibold">Result</div>
                  <div className="text-sm text-gray-500">{totalItemsCount} Results are shown based on your preferences</div>
                </div>
                <div className="hidden md:flex items-center gap-4">
                  <button onClick={handleClearFilters} className="flex items-center gap-3 rounded-xl bg-[#F1F3F2] px-5 py-3 text-base font-medium text-black">
                    <Image src="/images/filter Icon.png" alt="Clear" width={20} height={20} />
                    Clear filters
                  </button>
                </div>
              </div>
              {/* Inline banner removed; floating banner is rendered at root */}
              {/* Desktop Layout */}
              <div className="hidden md:block space-y-4">
                {(() => {
                  // Show skeleton if we're loading OR don't have initial data
                  const showSkeleton = isLoading || !hasInitialData;
                  return showSkeleton;
                })() && (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                      <MealCardSkeleton key={i} />
                    ))}
                  </div>
                )}
                
                {error && (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <p className="text-red-600 mb-2">Error loading meals: {error}</p>
                      <div className="flex gap-2">
                        <Button onClick={() => { void fetchMealsFromBackend(); }} variant="outline">
                          Retry
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {!isLoading && !error && filteredMeals.length === 0 && (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <p className="text-gray-600 mb-2">No meals found with current filters</p>
                      <div className="flex justify-center">
                        <Button onClick={handleClearFilters} variant="outline">
                          Clear Filters
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {!error && meals.length > 0 && !isLoading && hasInitialData && (() => {
                  const mealsToRender = mealsWithDistances.length > 0 ? mealsWithDistances : filteredMeals;
                  return mealsToRender;
                })().map((meal) => (
                  <Card key={meal._id} className="products-meal-card bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow" style={{ borderRadius: '24px', width: '100%', maxWidth: '980px', height: 'auto', minHeight: '202px' }}>
                    <CardContent className="p-0">
                      <div className="flex p-2 h-full">
                        {/* Meal Image */}
                        <div className="flex-shrink-0 mr-4 relative" style={{ width: '204px', height: '186px' }}>
                          <Image
                            src={meal.image || "/images/ListingPage Item.jpg"}
                            alt={meal.name || "Meal"}
                            width={204}
                            height={186}
                            className="w-full h-full object-cover rounded-xl"
                          />
                          {/* Restaurant Image */}
                          {meal.restaurant?.heroUrl && (
                            <div className="absolute top-2 right-2 w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-md">
                              <Image
                                src={meal.restaurant.heroUrl}
                                alt={meal.restaurant.name || "Restaurant"}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>

                        {/* Meal Info */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start h-full">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Link 
                                  href={`${Routes.Meals}?id=${meal._id}`}
                                  className="text-lg font-semibold text-gray-900 hover:text-blue-600 hover:underline cursor-pointer"
                                >
                                  {meal.name}
                                </Link>
                                <button
                                  onClick={() => handleShareMeal(meal._id, meal.name)}
                                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                  title="Share this meal"
                                >
                                  <Image 
                                    src="/images/Share Icon.png" 
                                    alt="Share" 
                                    width={16} 
                                    height={16}
                                    className="opacity-60 hover:opacity-100 transition-opacity"
                                  />
                                </button>
                              </div>
                              {meal.description && (
                                <p className="text-sm text-gray-500 mb-3 leading-relaxed line-clamp-2">
                                  {meal.description}
                                </p>
                              )}
                              
                              {/* Restaurant, Miles, Rating (with UberEats icon) */}
                              <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-1 text-blue-600 pr-4 border-r border-gray-200">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                  </svg>
                                  <Link 
                                    href={`${Routes.Restaurants}?id=${meal.restaurant?._id}`}
                                    className="text-sm hover:text-blue-800 hover:underline cursor-pointer"
                                  >
                                    {meal.restaurant?.name}
                                  </Link>
                                  {meal.restaurant?.isOpen !== undefined && (
                                    <span className={`text-sm font-medium ${meal.restaurant.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                                      {meal.restaurant.isOpen ? 'Open' : 'Close'}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 text-blue-600 pr-4 border-r border-gray-200">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                  </svg>
                                  <span className="leading-tight">
                                    <span className="block">
                                      {meal.restaurant?.distance !== undefined 
                                        ? meal.restaurant.distance.toFixed(2) 
                                        : "N/A"
                                      }
                                    </span>
                                    <span className="block text-[10px]">miles</span>
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <svg aria-hidden="true" viewBox="0 0 20 20" className="w-4 h-3 text-green-600" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.036a1 1 0 00-1.176 0l-2.802 2.036c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                  </svg>
                                  {(() => {
                                    const rest = getRestaurantForFood(meal);
                                    const rating = rest?.rating ?? rest?.reviewSummary?.averageTasteRating ?? rest?.reviewSummary?.averageHealthRating ?? '-';
                                    return <span className="text-xs font-medium">{rating}</span>;
                                  })()}
                                  <Image src="/images/UberEats.jpg" alt="UberEats" width={40} height={20} className="w-10 h-5 rounded-sm" />
                                </div>
                              </div>

                              {/* Nutrition Info */}
                              <div className="flex flex-wrap items-start gap-2">
                                <div className="rounded-md border border-gray-200 bg-[#F9FCFB] px-3 py-1.5 min-w-[72px] flex flex-col items-start justify-center text-left">
                                  <div className="text-[11px] text-gray-500 mb-0.5">Fat</div>
                                  <div className="text-sm font-bold text-gray-900">{meal.nutritionalInformation?.totalFatGrams ?? "-"}</div>
                                </div>
                                <div className="rounded-md border border-gray-200 bg-[#F9FCFB] px-3 py-1.5 min-w-[72px] flex flex-col items-start justify-center text-left">
                                  <div className="text-[11px] text-gray-500 mb-0.5">cal</div>
                                  <div className="text-sm font-bold text-gray-900">{meal.nutritionalInformation?.caloriesKcal ?? "-"}</div>
                                </div>
                                <div className="rounded-md border border-gray-200 bg-[#F9FCFB] px-3 py-1.5 min-w-[72px] flex flex-col items-start justify-center text-left">
                                  <div className="text-[11px] text-gray-500 mb-0.5">Prot</div>
                                  <div className="text-sm font-bold text-gray-900">{meal.nutritionalInformation?.proteinGrams ?? "-"}</div>
                                </div>
                                <div className="rounded-md border border-gray-200 bg-[#F9FCFB] px-3 py-1.5 min-w-[72px] flex flex-col items-start justify-center text-left">
                                  <div className="text-[11px] text-gray-500 mb-0.5">Carb</div>
                                  <div className="text-sm font-bold text-gray-900">{meal.nutritionalInformation?.totalCarbsGrams ?? "-"}</div>
                                </div>
                              </div>
                            </div>

                            {/* Price and Actions */}
                            <div className="ml-10 pr-2 text-right flex flex-col justify-between items-end h-full">
                              <div className="mb-0">
                                <div className="text-2xl font-bold text-blue-600 mb-1">${formatPrice(meal.price)}</div>
                                <div className="text-right">
                                  <Link
                                    href={getUberEatsHref(meal)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#4E56D3] hover:underline text-sm"
                                  >
                                    Order on UberEats
                                  </Link>
                                </div>
                              </div>
                              <div className="flex flex-row gap-3">
                                <Button asChild className="px-3 py-2 text-sm font-medium text-black rounded-lg" variant="ghost">
                                  <span onClick={() => handleCompareClick(meal._id, meal.name)} className={firstCompareId === meal._id ? "text-blue-700" : undefined}>
                                    {firstCompareId === meal._id ? "Selected" : "Compare"}
                                  </span>
                                </Button>
                                <Button
                                  onClick={() => handleAddToProfile(meal._id, 1, handleSuccessAddToProfile)}
                                  disabled={isAddingToProfile}
                                  className="w-24 bg-[#4E56D3] hover:bg-[#4046C7] text-white rounded-full text-sm disabled:opacity-50"
                                >
                                  {isAddingToProfile ? (
                                    <Spinner className="size-4 fill-white/70 text-white/30" />
                                  ) : (
                                    "Add"
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Mobile Layout */}
              <div className="mobile-card-container md:hidden grid grid-cols-1 px-2 sm:px-4 pb-6 place-items-center justify-items-center" style={{ gap: '32px' }}>
                {(() => {
                  // Show skeleton if we're loading OR don't have initial data
                  const showSkeleton = isLoading || !hasInitialData;
                  return showSkeleton;
                })() && (
                  <div className="flex flex-col items-center gap-4 w-full">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                      <MobileMealCardSkeleton key={i} />
                    ))}
                  </div>
                )}
                
                {error && (
                  <div className="flex items-center justify-center py-8 w-full">
                    <div className="text-center">
                      <p className="text-red-600 mb-2">Error loading meals: {error}</p>
                      <div className="flex gap-2">
                        <Button onClick={() => { void fetchMealsFromBackend(); }} variant="outline">
                          Retry
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {!isLoading && !error && filteredMeals.length === 0 && (
                  <div className="flex items-center justify-center py-8 w-full">
                    <div className="text-center">
                      <p className="text-gray-600 mb-2">No meals found with current filters</p>
                      <div className="flex justify-center">
                        <Button onClick={handleClearFilters} variant="outline">
                          Clear Filters
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {!error && meals.length > 0 && !isLoading && hasInitialData && (() => {
                  const mealsToRender = mealsWithDistances.length > 0 ? mealsWithDistances : filteredMeals;
                  return mealsToRender;
                })().map((meal) => (
                  <Card key={meal._id} className="mobile-meal-card bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden w-full max-w-[360px]">
                    <CardContent className="p-0">
                      <div className="relative">
                        {/* Meal Image */}
                        <div className="relative w-full h-48">
                          <Image
                            src={meal.image || "/images/ListingPage Item.jpg"}
                            alt={meal.name || "Meal"}
                            fill
                            className="object-cover"
                          />
                          {/* Restaurant Image */}
                          {meal.restaurant?.heroUrl && (
                            <div className="absolute top-2 right-2 w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-md">
                              <Image
                                src={meal.restaurant.heroUrl}
                                alt={meal.restaurant.name || "Restaurant"}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>

                        {/* Meal Content */}
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <Link 
                              href={`${Routes.Meals}?id=${meal._id}`}
                              className="text-lg font-semibold text-gray-900 hover:text-blue-600 hover:underline cursor-pointer flex-1"
                            >
                              {meal.name}
                            </Link>
                            <div className="text-right leading-tight flex items-center gap-2">
                              <button
                                onClick={() => handleShareMeal(meal._id, meal.name)}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                                title="Share this meal"
                              >
                                <Image 
                                  src="/images/Share Icon.png" 
                                  alt="Share" 
                                  width={14} 
                                  height={14}
                                  className="opacity-60 hover:opacity-100 transition-opacity"
                                />
                              </button>
                              <div className="text-[#4E56D3] text-base font-bold">${formatPrice(meal.price)}</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-end">
                            <Link
                              href={getUberEatsHref(meal)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#4E56D3] hover:underline text-xs"
                            >
                              Order on UberEats
                            </Link>
                          </div>
                          
                          {/* Restaurant, Miles, Rating (mobile) */}
                          <div className="flex items-center gap-3 mb-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                              </svg>
                              <Link 
                                href={`${Routes.Restaurants}?id=${meal.restaurant?._id}`}
                                className="hover:text-blue-600 hover:underline cursor-pointer"
                              >
                                {meal.restaurant?.name}
                              </Link>
                              {meal.restaurant?.isOpen !== undefined && (
                                <span className={`text-xs font-medium ml-1 ${meal.restaurant.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                                  {meal.restaurant.isOpen ? 'Open' : 'Close'}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                              </svg>
                              <span className="leading-tight">
                                <span className="block">
                                  {meal.restaurant?.distance !== undefined 
                                    ? meal.restaurant.distance.toFixed(2) 
                                    : "N/A"
                                  }
                                </span>
                                <span className="block text-[10px]">miles</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <svg aria-hidden="true" viewBox="0 0 20 20" className="w-4 h-4 text-green-600" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.036a1 1 0 00-1.176 0l-2.802 2.036c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                              </svg>
                              {(() => {
                                const rest = getRestaurantForFood(meal);
                                const rating = rest?.rating ?? rest?.reviewSummary?.averageTasteRating ?? rest?.reviewSummary?.averageHealthRating ?? '-';
                                return <span className="text-xs font-medium">{rating}</span>;
                              })()}
                              <Image src="/images/UberEats.jpg" alt="UberEats" width={40} height={20} className="w-10 h-5 rounded-sm" />
                            </div>
                          </div>

                          {/* Nutrition Info */}
                          <div className="grid grid-cols-4 gap-3 mb-4">
                            <div className="text-center">
                              <div className="text-xs text-gray-500 mb-1">Fat</div>
                              <div className="text-sm font-bold text-gray-900">{meal.nutritionalInformation?.totalFatGrams ?? "-"}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-500 mb-1">cal</div>
                              <div className="text-sm font-bold text-gray-900">{meal.nutritionalInformation?.caloriesKcal ?? "-"}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-500 mb-1">Prot</div>
                              <div className="text-sm font-bold text-gray-900">{meal.nutritionalInformation?.proteinGrams ?? "-"}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-500 mb-1">Carb</div>
                              <div className="text-sm font-bold text-gray-900">{meal.nutritionalInformation?.totalCarbsGrams ?? "-"}</div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <Button
                              onClick={() => handleAddToProfile(meal._id, 1, handleSuccessAddToProfile)}
                              disabled={isAddingToProfile}
                              className="flex-1 bg-[#4E56D3] hover:bg-[#4046C7] text-white rounded-full py-2 disabled:opacity-50"
                            >
                              {isAddingToProfile ? (
                                <Spinner className="size-4 fill-white/70 text-white/30" />
                              ) : (
                                "Add"
                              )}
                            </Button>
                            <Button onClick={() => handleCompareClick(meal._id, meal.name)} className="flex-1 bg-transparent text-[#4E56D3] hover:bg-gray-50 rounded-full py-2" variant="ghost">
                              {firstCompareId === meal._id ? "Selected" : "Compare"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination Controls - Mobile */}
              {!isLoading && !error && totalItemsCount > pageSize && (
                <div className="flex items-center justify-center gap-3 my-6">
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    disabled={currentPage === 1 || isLoading}
                    onClick={() => {
                      const nextPage = Math.max(1, currentPage - 1);
                      setCurrentPage(nextPage);
                      fetchMealsFromBackend(nextPage, false);
                    }}
                    aria-label="Previous page"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                  </button>
                  <div className="flex items-center gap-2">
                    {currentPage > 1 && (
                      <button
                        className="px-3 py-1 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => {
                          const p = currentPage - 1;
                          setCurrentPage(p);
                          fetchMealsFromBackend(p, false);
                        }}
                      >
                        {currentPage - 1}
                      </button>
                    )}
                    <span className="px-3 py-1 rounded-full bg-[#4E56D3] text-white">{currentPage}</span>
                    {hasMore && (
                      <button
                        className="px-3 py-1 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => {
                          const p = currentPage + 1;
                          setCurrentPage(p);
                          fetchMealsFromBackend(p, false);
                        }}
                      >
                        {currentPage + 1}
                      </button>
                    )}
                  </div>
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    disabled={!hasMore || isLoading}
                    onClick={() => {
                      const nextPage = currentPage + 1;
                      setCurrentPage(nextPage);
                      fetchMealsFromBackend(nextPage, false);
                    }}
                    aria-label="Next page"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                  </button>
                </div>
              )}
              
              {/* Show page info */}
              {!isLoading && !error && (
                <div className="text-center text-sm text-gray-500 my-4">
                  Page {currentPage} - Showing {meals.length} of {totalItemsCount} items
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal (bottom sheet up to 1100px) */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-60 bg-black bg-opacity-50">
          <div className="fixed inset-x-0 bottom-0 bg-white shadow-xl rounded-t-3xl max-h-[85vh] flex flex-col z-60">
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>
            
              {/* Header */}
            <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Filter Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
                {/* Restaurants Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-blue-600 mb-4 flex items-center">
                    <div className="w-1 h-4 bg-blue-600 mr-2 rounded"></div>
                    Restaurants
                  </h3>
                  <div className="space-y-0">
                    {(restaurantsList.slice(0,4)).map((restaurant, index) => (
                      <div key={restaurant.id}>
                        <label htmlFor={`mobile-rest-${restaurant.id}`} className="flex items-center space-x-3 py-3 cursor-pointer">
                          <Checkbox
                            id={`mobile-rest-${restaurant.id}`}
                            checked={selectedRestaurants.includes(restaurant.id)}
                            onCheckedChange={(checked) => handleRestaurantChange(restaurant.id, !!checked)}
                            className="border-gray-300 !rounded-none w-4 h-4 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                          />
                          <span className="text-sm text-gray-700 font-medium">{restaurant.name}</span>
                        </label>
                        <div className="h-[1px] bg-gray-200"></div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setIsRestaurantsModalOpen(true)} className="mt-4 w-full rounded-full border border-[#5B5BF0] text-[#5B5BF0] py-3 text-sm font-medium">View all restaurants</button>
                </div>

                {/* Distance Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-blue-600 mb-4 flex items-center">
                    <div className="w-1 h-4 bg-blue-600 mr-2 rounded"></div>
                    Distance
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>0 mile</span>
                      <span>5 miles</span>
                      <span>15 miles</span>
                    </div>
                    <Slider
                      value={distance}
                      onValueChange={(val) => { 
                        
                        setDistance(val as number[]); 
                        setFiltersActive(true); 
                      }}
                      max={15}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="text-sm font-semibold text-blue-600 mb-4 flex items-center">
                    <div className="w-1 h-4 bg-blue-600 mr-2 rounded"></div>
                    Categories
                  </h3>
                  <div className="space-y-0">
                    {categoriesData.map((cat) => (
                      <div key={cat.id}>
                        <label htmlFor={`mcat-${cat.id}`} className="flex items-center gap-3 py-3 cursor-pointer">
                          <input
                            id={`mcat-${cat.id}`}
                            type="radio"
                            name="m-category"
                            checked={selectedCategories.includes(cat.name)}
                            onChange={() => { setSelectedCategories([cat.name]); setFiltersActive(true); }}
                            className="appearance-none w-4 h-4 border border-gray-300 !rounded-none checked:bg-blue-600 checked:border-blue-600"
                          />
                          <Image src={cat.icon} alt={cat.name} width={18} height={18} className="w-4 h-4 object-contain brightness-0" />
                          <span className="text-sm text-gray-700 font-medium">{cat.name}</span>
                        </label>
                        <div className="h-[1px] bg-gray-200"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calories Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-blue-600 mb-4 flex items-center">
                    <div className="w-1 h-4 bg-blue-600 mr-2 rounded"></div>
                    Calories
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Min: {calorieRange?.[0] ?? 100}</div>
                      <div className="rounded-full border border-gray-300 bg-white px-4 py-2 text-gray-700 text-sm min-w-[84px]">
                        {calorieRange?.[0] ?? 100}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Max: {(calorieRange?.[1] ?? 3500) >= 3500 ? '3500+' : (calorieRange?.[1] ?? 3500)}</div>
                      <div className="rounded-full border border-gray-300 bg-white px-4 py-2 text-gray-700 text-sm min-w-[84px]">
                        {(calorieRange?.[1] ?? 3500) >= 3500 ? '3500+' : (calorieRange?.[1] ?? 3500)}
                      </div>
                    </div>
                  </div>
                  <DualRangeSlider
                    value={calorieRange}
                    onValueChange={(val) => { 
                      
                      setCalorieRange(val); 
                      setFiltersActive(true); 
                    }}
                    max={3500}
                    min={100}
                    step={100}
                    minStepsBetweenThumbs={0}
                    aria-label="Calories"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>0</span>
                    <span>1750</span>
                    <span>3500+</span>
                  </div>
                </div>

                {/* Meal Type Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-blue-600 mb-4 flex items-center">
                    <div className="w-1 h-4 bg-blue-600 mr-2 rounded"></div>
                    Diets
                  </h3>
                  <div className="space-y-0">
                    {mealTypes.map((mealType, index) => (
                      <div key={mealType.id}>
                        <label htmlFor={`mobile-meal-${mealType.id}`} className="flex items-center space-x-3 py-3 cursor-pointer">
                          <Checkbox
                            id={`mobile-meal-${mealType.id}`}
                            checked={selectedMealTypes.includes(mealType.id)}
                            onCheckedChange={(checked) => handleMealTypeChange(mealType.id, !!checked)}
                            className="border-gray-300 !rounded-none w-4 h-4 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                          />
                          <span className="text-sm text-gray-700 font-medium">{mealType.name}</span>
                        </label>
                        <div className="h-[1px] bg-gray-200"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Allergies */}
                <div>
                  <h3 className="text-sm font-semibold text-blue-600 mb-4 flex items-center">
                    <div className="w-1 h-4 bg-blue-600 mr-2 rounded"></div>
                    Allergies
                  </h3>
                  <div className="space-y-0">
                    {allergyOptions.map((allergy, index) => (
                      <div key={allergy}>
                        <label htmlFor={`mobile-alg-${allergy}`} className="flex items-center space-x-3 py-3 cursor-pointer">
                          <Checkbox
                            id={`mobile-alg-${allergy}`}
                            checked={selectedAllergies.includes(allergy)}
                            onCheckedChange={(checked) => handleAllergyChange(allergy, !!checked)}
                            className="border-gray-300 !rounded-none w-4 h-4 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                          />
                          <span className="text-sm text-gray-700 font-medium">{allergy}</span>
                        </label>
                        <div className="h-[1px] bg-gray-200"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
            <div className="p-4 border-t bg-white space-y-3 rounded-b-3xl flex-shrink-0">
                <Button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full bg-[#4E56D3] hover:bg-[#4046C7] text-white rounded-full py-3"
                >
                  Apply Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full py-3"
                >
                  Reset Filters
                </Button>
            </div>
          </div>
        </div>
      )}

      {compareBanner && (
        <div className="fixed right-2 md:right-4 bottom-20 md:bottom-4 z-50">
          <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-white shadow-lg px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm font-bold">1</div>
            <div className="min-w-[180px] max-w-[260px]">
              <div className="text-[13px] text-gray-800 font-medium mb-0.5">{compareBanner}</div>
              {firstCompareName && (
                <div className="text-[12px] text-gray-500 truncate">Selected item: <span className="font-semibold text-gray-800">{firstCompareName}</span></div>
              )}
            </div>
            <button
              onClick={() => { setCompareBanner(null); setFirstCompareId(null); setFirstCompareName(null); }}
              className="ml-2 rounded-full p-1 text-gray-400 hover:text-gray-600"
              aria-label="Dismiss"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
            </button>
          </div>
        </div>
      )}


      {/* Bottom Navigation - Visible below 1100px */}
          {!isMobileFilterOpen && isBelow1100 && (
        <div className="products-bottomnav block">
          <BottomNavigation onFilterClick={() => setIsMobileFilterOpen(true)} />
        </div>
      )}

      {isRestaurantsModalOpen && (
        <div className="fixed inset-0 z-70 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Restaurants</h2>
            <div className="space-y-4">
              {restaurantsList.map((restaurant) => (
                <div key={restaurant.id}>{restaurant.name}</div>
              ))}
            </div>
            <Button onClick={() => setIsRestaurantsModalOpen(false)} className="mt-4 w-full bg-[#4E56D3] text-white rounded-full py-3">Close</Button>
          </div>
        </div>
      )}

      {/* Restaurants Modal */}
      {isRestaurantsModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/40 flex items-end md:items-center justify-center">
          <div className="bg-white w-full md:w-[520px] max-h-[80vh] rounded-t-3xl md:rounded-2xl shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="text-base font-semibold">Nearby Restaurants</div>
              <button onClick={() => setIsRestaurantsModalOpen(false)} className="p-2 rounded-full hover:bg-gray-100">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {restaurantsList.map((restaurant) => (
                  <label key={restaurant.id} htmlFor={`modal-rest-${restaurant.id}`} className="flex items-center gap-3 py-2 cursor-pointer">
                    <Checkbox
                      id={`modal-rest-${restaurant.id}`}
                      checked={selectedRestaurants.includes(restaurant.id)}
                      onCheckedChange={(checked) => handleRestaurantChange(restaurant.id, !!checked)}
                      className="border-gray-300 w-4 h-4 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                    />
                    <span className="text-sm text-gray-800">{restaurant.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsRestaurantsModalOpen(false)}>Close</Button>
              <Button className="bg-[#4E56D3] hover:bg-[#4046C7] text-white" onClick={() => setIsRestaurantsModalOpen(false)}>Apply</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Skeleton component for meal cards
// Memoize skeletons to avoid re-render churn during loading
const MealCardSkeleton: React.FC = memo(function MealCardSkeleton() {
  return (
  <Card className="products-meal-card bg-white rounded-2xl shadow-sm border border-gray-200" style={{ borderRadius: '24px', width: '100%', maxWidth: '980px', height: 'auto', minHeight: '202px' }}>
    <CardContent className="p-0">
      <div className="flex p-2 h-full">
        {/* Meal Image Skeleton */}
        <div className="flex-shrink-0 mr-4" style={{ width: '204px', height: '186px' }}>
          <Skeleton className="w-full h-full rounded-xl" />
        </div>

        {/* Meal Info Skeleton */}
        <div className="flex-1">
          <div className="flex justify-between items-start h-full">
            <div className="flex-1">
              {/* Title Skeleton */}
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-3" />
              
              {/* Restaurant, Miles, Rating Skeleton */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1 pr-4 border-r border-gray-200">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="w-20 h-4" />
                  <Skeleton className="w-8 h-4" />
                </div>
                <div className="flex items-center gap-1 pr-4 border-r border-gray-200">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="w-16 h-4" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="w-8 h-4" />
                  <Skeleton className="w-7 h-7 rounded-sm" />
                </div>
              </div>

              {/* Nutrition Info Skeleton */}
              <div className="flex flex-wrap items-start gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-md border border-gray-200 bg-[#F9FCFB] px-3 py-1.5 min-w-[72px] flex flex-col items-start justify-center">
                    <Skeleton className="w-8 h-3 mb-1" />
                    <Skeleton className="w-6 h-4" />
                  </div>
                ))}
              </div>
            </div>

            {/* Price and Actions Skeleton */}
            <div className="ml-10 pr-2 text-right flex flex-col justify-between items-end h-full">
              <div className="mb-0">
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="w-24 h-3 mb-4" />
              </div>
              <div className="flex flex-row gap-3">
                <Skeleton className="w-20 h-9 rounded-lg" />
                <Skeleton className="w-24 h-9 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
  );
});

// Mobile skeleton component for meal cards
const MobileMealCardSkeleton: React.FC = memo(function MobileMealCardSkeleton() {
  return (
  <Card className="mobile-meal-card bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden w-full max-w-[360px] mx-auto">
    <CardContent className="p-0">
      <div className="relative">
        {/* Meal Image Skeleton */}
        <div className="relative w-full h-48">
          <Skeleton className="w-full h-full" />
        </div>

        {/* Meal Content Skeleton */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <Skeleton className="h-6 w-3/4" />
            <div className="text-right leading-tight">
              <Skeleton className="h-6 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          
          {/* Restaurant, Miles, Rating Skeleton */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1">
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="w-16 h-4" />
            </div>
            <div className="flex items-center gap-1">
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="w-12 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="w-6 h-4" />
              <Skeleton className="w-7 h-7 rounded-sm" />
            </div>
          </div>

          {/* Nutrition Info Skeleton */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <Skeleton className="w-8 h-3 mb-1 mx-auto" />
                <Skeleton className="w-6 h-4 mx-auto" />
              </div>
            ))}
          </div>

          {/* Actions Skeleton */}
          <div className="flex gap-2">
            <Skeleton className="flex-1 h-10 rounded-lg" />
            <Skeleton className="flex-1 h-10 rounded-lg" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
  );
});

export default ProductsPage;