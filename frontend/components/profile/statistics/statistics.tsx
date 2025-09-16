"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TodayDetails from "./today-details";
import WeeklyDetails from "./weekly-details";
import MonthlyDetails from "./monthly-details";
import { INutritional, IUser } from "@/libs/endpoints/users/users-schema";
import { usersHook } from "@/libs/endpoints/users/users-endpoints";
import { useNutrientCalculator } from "@/libs/hooks/use-nutrient-calculator";

type ITimeTab = "today" | "weekly" | "monthly";

const TabsTriggerClass = "tabs-trigger active";

const Statistics = ({
  nutritional,
  isLoading,
  user,
}: {
  nutritional: INutritional | undefined;
  isLoading: boolean;
  user: IUser | undefined;
}) => {
  const [selectedTab, setSelectedTab] = useState<ITimeTab>("today");

  const { data } = usersHook.useQueryWaterIntake();

  const { bmiValue } = useNutrientCalculator();

  const userInfo = [
    {
      title: "Weight",
      value: user?.weight?.toFixed(2),
      unit: user?.weightUnit,
    },
    {
      title: "Height",
      value: user?.height?.toFixed(2),
      unit: user?.heightUnit,
    },
    {
      title: "BMI",
      value: bmiValue.toFixed(2),
    },
  ];

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between gap-4">
        {isLoading
          ? [...Array(3)].map((_, index) => (
              <div
                key={index}
                className="h-[72px] w-[120px] animate-pulse rounded-2xl bg-light/20 p-3"
              ></div>
            ))
          : !!user?.weight &&
            !!user?.height &&
            userInfo.map((userInfo) => (
              <div
                key={userInfo.title}
                className="flex flex-1 flex-col items-center justify-center rounded-2xl p-3 text-sm shadow-4xl"
              >
                <span>{userInfo.title}</span>
                <span>
                  {userInfo.value}{" "}
                  <span className="text-sm text-heavy">{userInfo.unit}</span>
                </span>
              </div>
            ))}
      </div>
      <div className="mt-8">
        <Tabs
          value={selectedTab}
          onValueChange={(e) => setSelectedTab(e as ITimeTab)}
        >
          <TabsList className="mb-8 justify-start gap-2 !bg-transparent">
            <TabsTrigger
              className="border border-[#E2E8F0] !text-sm text-heavy"
              value="today"
            >
              Today
            </TabsTrigger>
            <TabsTrigger
              className="border border-[#E2E8F0] !text-sm text-heavy"
              value="weekly"
            >
              Weekly
            </TabsTrigger>
            <TabsTrigger
              className="border border-[#E2E8F0] !text-sm text-heavy"
              value="monthly"
            >
              monthly
            </TabsTrigger>
          </TabsList>
          <TabsContent value="today">
            <TodayDetails
              waterIntake={data}
              isLoading={isLoading}
              data={nutritional?.today}
            />
          </TabsContent>
          <TabsContent value="weekly">
            {nutritional?.lastSevenDays && (
              <WeeklyDetails
                waterIntake={data}
                data={nutritional?.lastSevenDays}
              />
            )}
          </TabsContent>
          <TabsContent value="monthly">
            {nutritional?.lastSevenDays && (
              <MonthlyDetails
                waterIntake={data}
                data={nutritional?.lastTwelveMonths}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Statistics;
