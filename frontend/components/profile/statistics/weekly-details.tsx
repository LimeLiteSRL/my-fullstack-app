"use client";

import React, { useEffect, useMemo, useState } from "react";
import { WeekBarChart } from "../week-bar-chart";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ILastSevenDays,
  IWaterIntake,
} from "@/libs/endpoints/users/users-schema";
import { INutritionalInformation } from "@/libs/endpoints/meals/meals-schema";
import { calculatePercentage } from "@/libs/utils";

type ITab =
  | "caloriesKcal"
  | "totalFatGrams"
  | "totalCarbsGrams"
  | "proteinGrams";

interface IChartData {
  day: string;
  desktop: number;
}
const WeeklyDetails = ({
  data,
  waterIntake,
}: {
  data: ILastSevenDays;
  waterIntake: IWaterIntake | undefined;
}) => {
  const [selectedTab, setSelectedTab] = useState<ITab>("caloriesKcal");
  const [unit, setUnit] = useState("");
  const [average, setAverage] = useState(0);
  const [chartData, setChartData] = useState<IChartData[]>([]);

  useEffect(() => {
    if (selectedTab) {
      const result = transformToChartData(data, selectedTab);
      setUnit(selectedTab === "caloriesKcal" ? "Kcal" : "g");
      setChartData(result);
      const av = calculateWeeklyAverage(data, selectedTab);
      setAverage(av);
    }
  }, [selectedTab, data]);

  const transformToChartData = (
    nutritional: ILastSevenDays,
    nutrient: keyof INutritionalInformation,
  ) => {
    return dayOrder.map((day, index) => ({
      day: dayShortNames[index],
      desktop: +(
        nutritional[day as keyof ILastSevenDays]?.[nutrient] || 0
      )?.toFixed(2),
    }));
  };

  const calculateWeeklyAverage = (
    data: ILastSevenDays,
    nutrient: keyof INutritionalInformation,
  ) => {
    let total = 0;
    let count = 0;

    for (const day of Object.keys(data) as (keyof typeof data)[]) {
      const dayData = data[day];
      if (dayData && dayData[nutrient] !== undefined) {
        total += dayData[nutrient];
        count++;
      }
    }
    return count > 0 ? total / count : 0;
  };

  const sugarData = useMemo(
    () => transformToChartData(data, "sugarsGrams"),
    [data],
  );

  const transformWeeklyData = (
    dailyThisWeek: Record<string, number> | undefined,
  ) => {
    if (!dailyThisWeek) return []; // Handle case where data is undefined

    return Object.entries(dailyThisWeek).map(([key, value]) => ({
      value: (value || 0) / 1000,
      label: dayMappings[key]?.label || key,
      day: dayMappings[key]?.day || key,
    }));
  };

  const waterData = transformWeeklyData(waterIntake?.dailyThisWeek);

  return (
    <>
      <div className="my-6 flex items-center justify-between">
        <div className="text-lg font-medium">Week Days</div>
      </div>
      <div className="flex flex-1 flex-col gap-2 rounded-2xl p-3 shadow-3xl">
        <div className="mb-2 flex items-center gap-2">
          <div className="text-lg font-medium text-secondary">Average</div>
          <div className="font-medium">
            {average.toFixed(2)} {unit}
          </div>
        </div>
        <WeekBarChart unit={unit} data={chartData} />
        <div className="no-scrollbar mt-2 flex items-center gap-1 overflow-x-auto">
          {tabs.map((item) => (
            <Button
              key={item.value}
              onClick={() => setSelectedTab(item.value as ITab)}
              className="flex-1"
              variant={selectedTab === item.value ? "default" : "light"}
            >
              {item.title}
            </Button>
          ))}
        </div>
      </div>
      <div className="mt-5 flex flex-col items-center gap-4 md:flex-row">
        <div className="flex min-h-[250px] w-full flex-1 flex-col gap-2 rounded-2xl p-3 shadow-3xl">
          <div className="text-lg font-medium text-secondary">Water</div>
          <div className="text-xs font-light">
            your daily water intake in liters
          </div>
          <div className="flex h-full w-full flex-1 gap-2">
            {waterData.map((water, index) => (
              <div
                key={water.label + index}
                className="flex min-h-full w-full flex-1 flex-col items-center justify-between gap-1"
              >
                <div className="text-nowrap text-xs opacity-80">
                  {water.value}
                </div>
                <Progress
                  color="bg-light"
                  className="w-full rounded-xl bg-offWhite"
                  value={calculatePercentage(water.value, 5)}
                  orientation="vertical"
                />
                <div className="text-sm font-light">{water.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex min-h-[250px] w-full flex-1 flex-col justify-between gap-1 rounded-2xl p-3 shadow-3xl">
          <div className="flex flex-col gap-1">
            <div className="text-lg font-medium text-secondary">Sugar</div>
            <div className="text-xs font-light">
              Average
              <span className="font-medium"> 7 Grams in week</span>
            </div>
          </div>
          <div className="flex h-full w-full flex-1 gap-2">
            {sugarData.map((water, index) => (
              <div
                key={water.day + index}
                className="flex min-h-full w-full flex-1 flex-col items-center justify-between gap-1"
              >
                <div className="text-nowrap opacity-80">{water.desktop}</div>
                <Progress
                  color="bg-offWhite"
                  className="w-full rounded-xl bg-heavy"
                  value={calculatePercentage(water.desktop, 30)}
                  orientation="vertical"
                />
                <div className="text-sm font-light">
                  {Array.from(water.day)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default WeeklyDetails;

const tabs = [
  {
    title: "Calories",
    value: "caloriesKcal",
  },
  {
    title: "Protein",
    value: "proteinGrams",
  },
  {
    title: "Fat",
    value: "totalFatGrams",
  },
  {
    title: "Carb",
    value: "totalCarbsGrams",
  },
];

const dayOrder = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const dayShortNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const dayMappings: Record<string, { label: string; day: string }> = {
  Mon: { label: "Mun", day: "Monday" },
  Tue: { label: "Tue", day: "Tuesday" },
  Wed: { label: "Wen", day: "Wednesday" },
  Thu: { label: "Thu", day: "Thursday" },
  Fri: { label: "Fri", day: "Friday" },
  Sat: { label: "Sat", day: "Saturday" },
  Sun: { label: "Sun", day: "Sunday" },
};
