"use client";

import React, { useEffect, useMemo, useState } from "react";
import { WeekBarChart } from "../week-bar-chart";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ILastSevenDays,
  ILastTwelveMonths,
  IWaterIntake,
} from "@/libs/endpoints/users/users-schema";
import { INutritionalInformation } from "@/libs/endpoints/meals/meals-schema";
import { calculatePercentage } from "@/libs/utils";
import WaterIntake from "@/components/ai/chat/water-intake";

type ITab =
  | "caloriesKcal"
  | "totalFatGrams"
  | "totalCarbsGrams"
  | "proteinGrams";

interface IChartData {
  day: string;
  desktop: number;
}
const MonthlyDetails = ({
  data,
  waterIntake,
}: {
  data: ILastTwelveMonths;
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
    nutritional: ILastTwelveMonths,
    nutrient: keyof INutritionalInformation,
  ) => {
    return months.map((month, index) => ({
      day: months[index].tag,
      desktop: +(
        nutritional[month.label as keyof ILastTwelveMonths]?.[nutrient] || 0
      )?.toFixed(2),
    }));
  };

  const calculateWeeklyAverage = (
    data: ILastTwelveMonths,
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

  const transformMonthlyData = (
    monthlyData: Record<string, number> | undefined,
  ) => {
    if (!monthlyData) return [];

    return Object.entries(monthlyData).map(([key, value]) => ({
      value: (value || 0) / 1000,
      label: key,
      day: monthMappings[key] || key,
    }));
  };
  const waterData = transformMonthlyData(waterIntake?.monthly);

  return (
    <>
      <div className="my-6 flex items-center justify-between">
        <div className="text-lg font-medium">Months</div>
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
      <div className="mt-5 flex flex-col items-center gap-4">
        <div className="flex min-h-[250px] w-full flex-1 flex-col gap-2 rounded-2xl p-3 shadow-3xl">
          <div className="text-lg font-medium text-secondary">Water</div>
          <div className="text-xs font-light">your daily water intake</div>
          <div className="no-scrollbar flex h-full flex-1 gap-2 overflow-auto">
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
                  value={calculatePercentage(water.value, 35)}
                  orientation="vertical"
                />
                <div className="text-xs font-light">{water.label}</div>
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
                <div className="text-nowrap text-xs opacity-80">
                  {water.desktop}
                </div>
                <Progress
                  color="bg-offWhite"
                  className="w-full rounded-xl bg-heavy"
                  value={calculatePercentage(water.desktop, 90)}
                  orientation="vertical"
                />
                <div className="text-xs font-light">
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

export default MonthlyDetails;

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
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const dayShortNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const monthMappings: Record<string, string> = {
  Jan: "January",
  Feb: "February",
  Mar: "March",
  Apr: "April",
  May: "May",
  Jun: "June",
  Jul: "July",
  Aug: "August",
  Sep: "September",
  Oct: "October",
  Nov: "November",
  Dec: "December",
};
const months = [
  { tag: "Jan", label: "January" },
  { tag: "Feb", label: "February" },
  { tag: "Mar", label: "March" },
  { tag: "Apr", label: "April" },
  { tag: "May", label: "May" },
  { tag: "Jun", label: "July" },
  { tag: "Jul", label: "August" },
  { tag: "Aug", label: "September" },
  { tag: "Sep", label: "October" },
  { tag: "Oct", label: "June" },
  { tag: "Nov", label: "November" },
  { tag: "Dec", label: "December" },
];
