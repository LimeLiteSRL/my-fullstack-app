import React from "react";
import { RadialBarChart, RadialBar, PolarAngleAxis, Text } from "recharts";

interface CaloriesChartProps {
  calories?: number;
  maxCalories?: number;
  color?: string;
}

const CaloriesChart: React.FC<CaloriesChartProps> = ({
  calories = 1500,
  maxCalories = 3000,
  color = "#4E56D3",
}) => {
  const data = [
    {
      name: "Calories",
      calories: calories.toFixed(2),
      fill: color,
    },
  ];

  const percentage = (calories / maxCalories) * 100;

  return (
    <div className="relative h-[180px] w-[180px]">
      <RadialBarChart
        width={180}
        height={180}
        innerRadius="65%"
        outerRadius="80%"
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis
          type="number"
          domain={[0, maxCalories]}
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
        <span className="text-xl font-bold">{calories.toFixed(2)}</span>
        <span className="text-sm text-gray-500">Calories</span>
        {/* <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span> */}
      </div>
    </div>
  );
};

export default CaloriesChart;
