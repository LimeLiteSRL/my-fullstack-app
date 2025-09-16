"use client";

import React, { useState } from "react";
import { Progress } from "@/components/ui/progress";
import RadialCaloriesChart from "../radial-calories-chart";
import {
  INutritionalValues,
  IWaterIntake,
} from "@/libs/endpoints/users/users-schema";
import { calculatePercentage } from "@/libs/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AiLineIcon,
  CubeIcon,
  PlusSignIcon,
  WaterOutlineIcon,
} from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { usersHook } from "@/libs/endpoints/users/users-endpoints";
import { useRouter } from "next/navigation";
import { Routes } from "@/libs/routes";
import { isToday } from "date-fns";
import { useNutrientCalculator } from "@/libs/hooks/use-nutrient-calculator";
import { queryClient } from "@/libs/query-client";

const TodayDetails = ({
  data,
  isLoading,
  waterIntake,
}: {
  data: INutritionalValues | undefined;
  isLoading: boolean;
  waterIntake: IWaterIntake | undefined;
}) => {
  const [isAddWaterOpen, setIsAddWaterOpen] = useState(false);

  const { calories, carbohydrates, fats, proteins, fiber, waterInLiters } =
    useNutrientCalculator();

  // const todayEntries = waterIntake
  //   ?.filter((entry) => isToday(entry.date))
  //   .reduce((sum, entry) => sum + entry.amountMl, 0);

  const totalFat = data?.totalFatGrams || 0;

  const sugarCubes = Math.floor((data?.sugarsGrams || 0) / 4);

  return (
    <>
      <div className="flex items-center rounded-2xl p-3 shadow-4xl">
        <div className="flex-1">
          <div className="text-lg font-medium text-secondary">Calories</div>
          <div className="text-sm font-light">
            Your daily calorie intake based on your goal weight
          </div>
          <div className="mt-4 font-semibold">{calories || 0} Kcal</div>
        </div>
        {isLoading ? (
          <div className="m-4 flex size-[120px] items-center justify-center rounded-full border-[14px] border-neutral-200 bg-transparent p-4">
            <div className="animate-pulse font-semibold">Calories</div>
          </div>
        ) : (
          <RadialCaloriesChart
            maxCalories={+calories || 3000}
            calories={data?.caloriesKcal || 0}
          />
        )}
      </div>
      <div className="mt-4 flex flex-col gap-5 rounded-2xl p-3 shadow-4xl">
        <div className="flex items-center gap-2">
          <div className="text-lg font-medium text-secondary">Protein</div>
          <div className="text-xs font-light">
            Your daily protein intake is {proteins || 0} grams
          </div>
        </div>
        <div className="flex w-full items-center justify-center gap-2">
          <div className="text-nowrap font-medium">
            {data?.proteinGrams?.toFixed(2) || 0} g
          </div>
          {isLoading ? (
            <Skeleton className="h-9 w-full rounded-xl bg-heavy/30" />
          ) : (
            <Progress
              color="bg-primary-1"
              className="mx-auto h-9 rounded-xl bg-offWhite"
              value={calculatePercentage(data?.proteinGrams, +proteins)}
            />
          )}
          <div className="text-nowrap font-medium">{proteins} g</div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-5 rounded-2xl p-3 shadow-4xl">
        <div className="flex items-center gap-2">
          <div className="text-lg font-medium text-secondary">fiber</div>
          <div className="text-xs font-light">
            Your daily dietary fiber intake is {fiber || 0} grams
          </div>
        </div>
        <div className="flex w-full items-center justify-center gap-2">
          <div className="text-nowrap font-medium">
            {data?.dietaryFiberGrams?.toFixed(2) || 0} g
          </div>
          {isLoading ? (
            <Skeleton className="h-9 w-full rounded-xl bg-heavy/30" />
          ) : (
            <Progress
              color="bg-light"
              className="mx-auto h-9 rounded-xl bg-offWhite"
              value={calculatePercentage(data?.dietaryFiberGrams, fiber)}
            />
          )}
          <div className="text-nowrap font-medium">{fiber} g</div>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-5 rounded-2xl p-3 shadow-4xl">
        <div className="flex items-center gap-2">
          <div className="text-lg font-medium text-secondary">Fat</div>
          <div className="text-xs font-light">
            Your daily fat intake is {fats} grams
          </div>
        </div>
        <div className="flex w-full items-center justify-center gap-2">
          <div className="text-nowrap font-medium">
            {totalFat?.toFixed(2)} g
          </div>
          {isLoading ? (
            <Skeleton className="mx-auto h-9 w-full max-w-[240px] rounded-xl bg-heavy/30" />
          ) : (
            <Progress
              color="bg-secondary"
              className="h-9 rounded-xl bg-offWhite"
              value={calculatePercentage(totalFat, +fats)}
            />
          )}
          <div className="text-nowrap font-medium">{fats} g</div>
        </div>
      </div>

      <div className="mt-4 flex h-[235px] items-end gap-4">
        <div className="flex h-full flex-1 flex-col gap-2 rounded-2xl p-3 shadow-4xl">
          <div className="text-lg font-medium text-secondary">Water</div>
          <div className="text-xs font-light">your daily water intake</div>
          <div className="flex flex-col gap-1 sm:mt-2 sm:gap-2">
            <WaterOutlineIcon className="size-9 text-secondary" />
            <div className="flex items-end gap-2">
              <span className="text-3xl font-medium">
                {(waterIntake?.today || 0) / 1000}
              </span>
              <span className="text-xl font-medium">Liter</span>
            </div>
            <div className="text-xs font-light">
              Your right amount{" "}
              <span className="font-medium">{waterInLiters}</span> Liter
            </div>
            <Button
              onClick={() => setIsAddWaterOpen(true)}
              className="h-8 text-xs font-light sm:text-sm"
              variant="outline"
            >
              <PlusSignIcon className="size-4" />
              Add water intake
            </Button>
          </div>
        </div>

        <div className="no-scrollbar flex h-full flex-1 shrink-0 flex-col justify-between gap-2 overflow-auto rounded-2xl p-3 shadow-4xl">
          <div>
            <div className="text-lg font-medium text-secondary">Sugar</div>
            <div className="text-xs font-light">
              Each cube of sugar is about 4 grams
            </div>
          </div>
          <div className="grid grid-cols-6 gap-1">
            {[...Array(sugarCubes)].map((_, index) => (
              <CubeIcon key={index} className="size-8 text-secondary" />
            ))}
          </div>
          <div className="text-sm font-medium">
            {sugarCubes} sugar cubes{" "}
            {data?.sugarsGrams && (
              <>
                ≃{" "}
                <span className="text-sm font-normal text-heavy">
                  {data?.sugarsGrams}g
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <AddWaterIntake isOpen={isAddWaterOpen} setIsOpen={setIsAddWaterOpen} />
    </>
  );
};

export default TodayDetails;

const AddWaterIntake = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}) => {
  const [liter, setLiter] = useState("0");
  const router = useRouter();
  const addWaterIntakeMutation = usersHook.useAddWaterIntakeMutation();
  const date = new Date();

  const handleAddWater = () => {
    if (!liter) return;
    addWaterIntakeMutation.mutate(
      {
        amountMl: +liter * 1000,
        date: date.toISOString(),
      },
      {
        onError: (error) => {
          toast.error("Failed to add water intake");
        },
        onSuccess: () => {
          toast.success("Water 💧 intake added successfully!");
          queryClient.invalidateQueries(
            usersHook.getKeyByAlias("queryWaterIntake"),
          );
          setIsOpen(false);
          setLiter("0");
        },
      },
    );
  };

  return (
    <ResponsiveDialog
      open={isOpen}
      setOpen={setIsOpen}
      title="Add water intake"
      description={
        <span>
          To add water, you can use{" "}
          <span className="font-medium text-black">AI</span> to add the amount
          of water consumed in each unit (glass, liter, etc.) to your profile.
          Or, you can enter the amount of liters consumed right here:
        </span>
      }
    >
      <div>
        <Input
          className="mx-auto w-1/2"
          placeholder="2 liter..."
          type="number"
          step="any"
          value={liter}
          onChange={(e) =>
            setLiter(+e.target.value >= 0 ? e.target.value : "0")
          }
        />
        <div className="mt-3 flex items-center justify-between gap-2">
          <Button
            className="flex w-full items-center gap-1 text-sm font-normal"
            variant="outline"
            onClick={() => router.push(Routes.Chat)}
          >
            Go to AI <AiLineIcon className="size-5 shrink-0" />
          </Button>
          <Button
            onClick={handleAddWater}
            disabled={!liter}
            className="w-full text-sm font-normal"
          >
            Add Water
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
};
