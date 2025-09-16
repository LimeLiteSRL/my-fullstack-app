import { CalendarIcon } from "@/components/icons/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, getDaysArray } from "@/libs/utils";
import React, { useEffect, useMemo, useRef, useState } from "react";
import DateSelection from "./date-selection";
import MealCard from "./meal-card";
import { usersHook } from "@/libs/endpoints/users/users-endpoints";
import { Skeleton } from "@/components/ui/skeleton";

type ITab = "ai" | "app";

const MealHistory = () => {
  const [selectedTab, setSelectedTab] = useState<ITab>("app");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { data, isLoading } = usersHook.useQueryEatenMeals(
    {
      queries: {
        startDate,
        endDate,
      },
    },
    {
      staleTime: 0,
      cacheTime: 0,
    },
  );
  const mealList = data?.eatenFoods.map((item) => ({
    food: item.food,
    foodId: item.foodId,
    eatenFoodId: item._id,
    foodName: item.foodName,
    source: item.source,
    nutritionalInformation: item.nutritionalInformation,
  }));

  return (
    <div className="mt-6">
      <Tabs
        value={selectedTab}
        onValueChange={(e) => {
          setEndDate("");
          setStartDate("");
          setSelectedTab(e as ITab);
        }}
      >
        <TabsList className="justify-start gap-2 !bg-transparent">
          <TabsTrigger
            className="border border-offWhite !text-sm text-heavy"
            value="ai"
          >
            AI Recipes
          </TabsTrigger>
          <TabsTrigger
            className="border border-offWhite !text-sm text-heavy"
            value="app"
          >
            Restaurant
          </TabsTrigger>
        </TabsList>
        <TabsContent value="ai">
          <DateSelection setStartDate={setStartDate} setEndDate={setEndDate} />
          <div className="mt-6 space-y-4">
            {!!data?.eatenFoods?.length
              ? mealList
                  ?.filter((food) => food.source === "AI")
                  ?.map((item, i) => (
                    <MealCard
                      meal={item.food}
                      eatenFoodId={item.eatenFoodId}
                      key={item?.foodId + "" + i}
                      foodName={item.foodName}
                      nutritionalInformation={item.nutritionalInformation}
                    />
                  ))
              : null}

            {isLoading && (
              <>
                <MealCardSkeleton />
                <MealCardSkeleton />
              </>
            )}

            {!isLoading && !mealList?.length && (
              <div className="mt-40 text-center font-medium text-heavy">
                No food has been added.
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="app">
          <DateSelection setStartDate={setStartDate} setEndDate={setEndDate} />
          <div className="mt-6 space-y-4">
            {!!data?.eatenFoods?.length
              ? mealList
                  ?.filter((food) => food.source === "Restaurant")
                  ?.map((item, i) =>
                    item.food ? (
                      <MealCard
                        meal={item.food}
                        eatenFoodId={item.eatenFoodId}
                        key={item?.foodId + "" + i}
                        nutritionalInformation={item.nutritionalInformation}
                        isApp
                      />
                    ) : null,
                  )
              : null}

            {isLoading && (
              <>
                <MealCardSkeleton />
                <MealCardSkeleton />
              </>
            )}

            {!isLoading && !mealList?.length && (
              <div className="mt-40 text-center font-medium text-heavy">
                No food has been added.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MealHistory;

const MealCardSkeleton = () => {
  return (
    <div className="mx-auto flex min-h-[150px] w-full items-center justify-center rounded-3xl bg-white p-4 shadow-md">
      <div className="flex w-full gap-3">
        <div className="h-[130px] w-[130px] shrink-0 animate-pulse overflow-hidden rounded-xl bg-neutral-300"></div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-40 rounded-3xl" />
          <Skeleton className="h-3 w-28 rounded-3xl" />
          <div className="flex items-center gap-2 text-softText">
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="size-6 rounded-full" />
          </div>

          <div className="mt-auto flex items-center justify-between gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
