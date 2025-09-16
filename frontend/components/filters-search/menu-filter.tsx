"use client";

import useFilterStore from "@/libs/store/filters-store";
import { CheeseCakeIcon, DrinkIcon, MainDishIcon } from "../icons/icons";
import { cn } from "@/libs/utils";
import { MENULIST } from "@/libs/constants/menu";
import { Button } from "../ui/button";

const MenuFilter = () => {
  const { typeFilters, setTypeFilters } = useFilterStore();

  const handleSelectType = (value: string) => {
    if (typeFilters.includes(value)) {
      setTypeFilters(typeFilters.filter((item) => item !== value));
    } else {
      setTypeFilters([value]);
    }
  };

  return (
    <div>
      <div className="mb-2 mt-4 flex items-center justify-between gap-3 py-2">
        {MENULIST.map((menu) => (
          <Button
            variant={typeFilters.includes(menu.value) ? "secondary" : "light"}
            key={menu.value}
            className={cn(
              "flex flex-1 items-center gap-1 px-2 py-1 text-xs font-normal",
              typeFilters.includes(menu.value) && "border border-secondary",
            )}
            onClick={() => handleSelectType(menu.value)}
          >
            {menu.icon}
            {menu.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MenuFilter;

const typeList = [
  {
    title: "DRINKS",
    icon: <DrinkIcon className="size-6" />,
    value: "drink",
  },
  {
    title: "MAIN DISH",
    icon: <MainDishIcon className="size-6" />,
    value: "dish",
  },
  {
    title: "DESSERTS",
    icon: <CheeseCakeIcon className="size-6" />,
    value: "desserts",
  },
];
