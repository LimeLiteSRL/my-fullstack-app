import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface IFood {
  name: string;
  protein: number;
  carbs: number;
  fat: number;
}
const CompareCaloriesChart = ({
  food1,
  food2,
}: {
  food1: IFood;
  food2: IFood;
}) => {
  const chartData = [
    {
      nutrient: "Protein",
      [food1.name]: food1.protein,
      [food2.name]: food2.protein,
    },
    { nutrient: "Carbs", [food1.name]: food1.carbs, [food2.name]: food2.carbs },
    { nutrient: "Fat", [food1.name]: food1.fat, [food2.name]: food2.fat },
  ];

  const chartConfig = {
    [food1.name]: {
      label: food1.name,
      color: "#4E56D3",
    },
    [food2.name]: {
      label: food2.name,
      color: "#D1D4FF",
    },
  };

  return (
    <div className="flex items-center justify-center">
      <BarChart
        width={400}
        height={330}
        data={chartData}
        margin={{ top: 20, right: 30, left: 10, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="nutrient" />
        {/* <YAxis
          label={{ value: "Calories", angle: -90, position: "insideLeft" }}
        /> */}
        <Tooltip />
        <Bar
          dataKey={food1.name}
          fill={chartConfig[food1.name].color}
          radius={[14, 14, 0, 0]}
        >
          <LabelList dataKey={food1.name} position="top" />
        </Bar>
        <Bar
          dataKey={food2.name}
          fill={chartConfig[food2.name].color}
          radius={[14, 14, 0, 0]}
        >
          <LabelList dataKey={food2.name} position="top" />
        </Bar>
      </BarChart>
    </div>
  );
};

export default CompareCaloriesChart;
