"use client";

import CompareChart from "@/components/compare/compare-chart";
import { mealsHook } from "@/libs/endpoints/meals/meals-endpoints";
import { useRouter, useSearchParams } from "next/navigation";
import CompareDetailsMeal from "./compare-details-meal";
import { ArrowLeftIcon } from "@/components/icons/icons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const firstMealId = searchParams.get("first");
  const lastMealId = searchParams.get("last");

  const { data, isLoading } = mealsHook.useQueryCompareMeals({
    queries: {
      foodIds: `${firstMealId},${lastMealId}`,
    },
  });

  if (isLoading) {
    return <CompareSkeleton />;
  }
  const food1 = {
    name: data?.data[0].name || "",
    protein: data?.data[0].nutritionalInformation?.proteinGrams || 0,
    carbs: data?.data[0].nutritionalInformation?.totalCarbsGrams || 0,
    fat: data?.data[0].nutritionalInformation?.totalFatGrams || 0,
  };
  const food2 = {
    name: data?.data[1].name || "",
    protein: data?.data[1].nutritionalInformation?.proteinGrams || 0,
    carbs: data?.data[1].nutritionalInformation?.totalCarbsGrams || 0,
    fat: data?.data[1].nutritionalInformation?.totalFatGrams || 0,
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-around">
        <button
          onClick={() => router.back()}
          className="flex size-10 items-center justify-center rounded-full bg-neutral-200/70"
        >
          <ArrowLeftIcon className="size-6" />
        </button>
        <div className="text-xl font-bold">Nutrition Faceoff</div>
        <div></div>
      </div>
      <div className="mt-6 flex justify-between">
        <CompareDetailsMeal data={data?.data[0]} />
        <CompareDetailsMeal isTargetMeal data={data?.data[1]} />
      </div>
      <CompareChart food1={food1} food2={food2} />
    </div>
  );
}

const CompareSkeleton = () => {
  return (
    <div className="p-4">
      <div className="flex items-center justify-around">
        <div className="text-xl font-bold">Nutrition Faceoff</div>
      </div>
      <div className="mt-6 flex justify-between gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <div className="mt-20 flex items-end justify-center gap-6 border-b">
        <div className="flex items-end gap-1">
          <Skeleton className="h-48 w-10 rounded-xl" />
          <Skeleton className="h-20 w-10 rounded-xl" />
        </div>
        <div className="flex items-end gap-1">
          <Skeleton className="h-28 w-10 rounded-xl" />
          <Skeleton className="h-11 w-10 rounded-xl" />
        </div>
        <div className="flex items-end gap-1">
          <Skeleton className="h-20 w-10 rounded-xl" />
          <Skeleton className="h-32 w-10 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

const ChartSkeleton = () => {
  return (
    <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-10">
      <Skeleton className="size-[122px] rounded-xl" />
      <div className="flex items-center gap-3">
        <Skeleton className="size-7 rounded-xl" />
        <Skeleton className="size-7 rounded-xl" />
        <Skeleton className="size-7 rounded-xl" />
      </div>
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="size-[150px] rounded-full border-[20px] border-neutral-200 bg-transparent" />
    </div>
  );
};
