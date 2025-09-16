"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useEffect, useState } from "react";
import { cn } from "@/libs/utils";
import { Button } from "../ui/button";
import {
  IAllergies,
  IMeal,
  ISingleMeal,
  IDietaryPreferences,
} from "@/libs/endpoints/meals/meals-schema";
import MealCard from "../meals/meal-card";
import { useRouter } from "next/navigation";
import { Routes } from "@/libs/routes";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ArrowDownIcon, CheckIcons } from "../icons/icons";

type ITabs = "all" | "drinks" | "desserts";

const RestaurantMealsMenu = ({ meals }: { meals: ISingleMeal[] }) => {
  const [tab, setTab] = useState<ITabs>("all");
  const [filteredMeals, setFilteredMeals] = useState<ISingleMeal[]>(meals);

  const [filters, setFilters] = useState<string[]>([]);
  const [diets, setDiets] = useState<string[]>([]);

  useEffect(() => {
    let categoryFilteredMeals = meals;
    if (tab === "drinks") {
      categoryFilteredMeals = meals.filter((meal) => meal.itemType === "Drink");
    } else if (tab === "desserts") {
      categoryFilteredMeals = meals.filter(
        (meal) => meal.itemType === "Dessert",
      );
    }

    let allergyFilteredMeals = categoryFilteredMeals;
    if (filters.length > 0) {
      allergyFilteredMeals = categoryFilteredMeals.filter(
        (meal) =>
          meal.allergies &&
          filters.every(
            (filter) => !meal.allergies?.[filter as keyof IAllergies],
          ),
      );
    }

    if (diets.length === 0) {
      setFilteredMeals(allergyFilteredMeals);
    } else {
      setFilteredMeals(
        allergyFilteredMeals.filter(
          (meal) =>
            meal.dietaryPreferences &&
            diets.every(
              (diet) =>
                meal.dietaryPreferences?.[diet as keyof IDietaryPreferences],
            ),
        ),
      );
    }
  }, [filters, diets, meals, tab]);

  const handleSelecting = (value: string) => {
    if (filters.includes(value)) {
      setFilters(filters.filter((item) => item !== value));
    } else {
      setFilters([...filters, value]);
    }
  };

  const handleSelectingDiets = (value: string) => {
    if (diets.includes(value)) {
      setDiets(diets.filter((item) => item !== value));
    } else {
      setDiets([...diets, value]);
    }
  };

  return (
    <div className="my-2">
      <div className="mx-auto mt-6 flex w-fit items-center justify-center rounded-full border">
        {tabs.map((item) => (
          <Button
            key={item.value}
            onClick={() => setTab(item.value as ITabs)}
            variant={tab === item.value ? "secondary" : "ghost"}
            className="h-full min-w-[110px]"
            value="all"
          >
            {item.title}
          </Button>
        ))}
      </div>
      <div className="mx-6 my-4 flex items-center gap-4">
        <SelectFilter
          filters={filters}
          handleSelecting={handleSelecting}
          items={menuList}
          title="Select Allergies"
        />
        <SelectFilter
          filters={diets}
          handleSelecting={handleSelectingDiets}
          items={dietMenuList}
          title="Select Diets"
        />
      </div>
      <MealsMenu
        filters={filters}
        setFilters={setFilters}
        meals={filteredMeals}
      />
    </div>
  );
};
const tabs = [
  {
    title: "Main Dish",
    value: "all",
  },
  {
    title: "Drinks",
    value: "drinks",
  },
  {
    title: "Desserts",
    value: "desserts",
  },
];
const menuList = [
  { label: "Egg", value: "egg" },
  { label: "Fish", value: "fish" },
  { label: "Milk", value: "milk" },
  { label: "Peanuts", value: "peanuts" },
  { label: "Soy", value: "soy" },
  { label: "TreeNuts", value: "treeNuts" },
  { label: "Wheat", value: "wheat" },
];
const dietMenuList = [
  { label: "Vegan", value: "vegan" },
  { label: "Halal", value: "halal" },
  { label: "Kosher", value: "kosher" },
  { label: "Keto", value: "keto" },
  { label: "Vegetarian", value: "vegetarian" },
];
const MealsMenu = ({
  meals,
  filters,
  setFilters,
}: {
  meals: ISingleMeal[];
  filters: string[];
  setFilters: (val: string[]) => void;
}) => {
  const router = useRouter();

  const handleSelecting = (value: string) => {
    if (filters.includes(value)) {
      setFilters(filters.filter((item) => item !== value));
    } else {
      setFilters([...filters, value]);
    }
  };

  return (
    <div className="px-2">
      {/* <div className=" flex items-center gap-2 overflow-auto py-2">
        {menuList.map((item) => (
          <Button
            key={item}
            variant="light"
            className={cn(
              "h-8 rounded-full px-4 py-1 text-sm font-light",
              filters.includes(item) ? "bg-secondary text-white" : null,
            )}
            onClick={() => handleSelecting(item)}
          >
            {item}
          </Button>
        ))}
      </div> */}
      <div className="space-y-3">
        {meals.map((meal) => (
          <MealCard
            key={meal.id}
            variant="small"
            meal={meal}
            className="w-full"
            handleMealClicked={() =>
              router.push(Routes.Meals + `?id=${meal.id}`)
            }
          />
        ))}
      </div>
    </div>
  );
};

export default RestaurantMealsMenu;

interface ISelectItems {
  label: string;
  value: string;
}
function SelectFilter({
  items,
  title,
  filters,
  handleSelecting,
}: {
  title: string;
  items: ISelectItems[];
  filters: string[];
  handleSelecting: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        className={cn(
          "flex max-w-[150px] items-center gap-1 rounded-full border p-2 !text-sm !font-normal text-heavy",
          filters.length > 0 && "text-neutral-900",
        )}
      >
        {title}
        <ArrowDownIcon
          className={cn("size-5 transition-all", isOpen && "rotate-180")}
        />
      </PopoverTrigger>
      <PopoverContent align="start" className="max-w-[150px] rounded-lg p-2">
        <div className="flex flex-col items-center">
          {items.map((item, index) => (
            <div
              key={item.value}
              className={cn(
                "w-full border-b border-offWhite",
                index === menuList.length - 1 && "border-none",
              )}
            >
              <Button
                variant="ghost"
                className="h-8 w-full justify-between text-xs font-normal"
                value={item.value}
                onClick={() => handleSelecting(item.value)}
              >
                {item.label}
                {filters.includes(item.value) && (
                  <CheckIcons className="size-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
