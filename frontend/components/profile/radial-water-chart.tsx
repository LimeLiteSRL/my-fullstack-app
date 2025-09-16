"use client";

import {
  Label,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import { ChartConfig, ChartContainer } from "@/components/ui/chart";

export const description = "A radial chart with text";

const chartData = [{ browser: "safari", visitors: 8, fill: "#D1D4FF" }];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  safari: {
    label: "Safari",
    color: "#D1D4FF",
  },
} satisfies ChartConfig;

interface IProps {
  calories?: number;
  maxCalories?: number;
  color?: string;
}
export default function RadialWaterChart<IProps>({
  value = 85,
  max = 3000,
  color = "#D1D4FF",
}) {
  const data = [
    {
      name: "Glasses",
      calories: value,
      fill: color,
    },
  ];

  return (
    <div className="relative h-[150px] w-[150px]">
      <RadialBarChart
        width={150}
        height={150}
        innerRadius="65%"
        outerRadius="80%"
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis
          type="number"
          domain={[0, 20]}
          angleAxisId={0}
          tick={false}
        />
        <RadialBar
          background
          dataKey="calories"
          cornerRadius={30}
          fill={color}
        />
      </RadialBarChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold">{value}</span>
        <span className="text-sm text-gray-500">Glasses</span>
        {/* <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span> */}
      </div>
    </div>
  );
}
