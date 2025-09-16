"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A bar chart with a label";

const chartConfig = {
  desktop: {
    label: "value",
    color: "#4E56D3",
  },
} satisfies ChartConfig;

interface IChartData {
  day: string;
  desktop: number;
}
export function WeekBarChart({
  data,
  unit,
}: {
  data: IChartData[];
  unit: string;
}) {
  const chartWidth = Math.max(data.length * 60, 300);
  return (
    <div
      className="no-scrollbar"
      //  style={{ overflowX: "auto" }}
    >
      <div
      // style={{ minWidth: `${chartWidth}px` }}
      >
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              top: 40,
            }}
          >
            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              className="text-xs font-light"
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="desktop" fill="#4E56D3" radius={8}>
              <LabelList
                position="top"
                offset={10}
                className="p-2 text-[10px]"
                fontSize={3}
                formatter={(value: number) => `${value} ${unit}`}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}
