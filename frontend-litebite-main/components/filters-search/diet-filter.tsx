"use client";

import useFilterStore from "@/libs/store/filters-store";
import { HalalIcon, KosherIcon, VegetarianIcon } from "../icons/icons";
import { cn } from "@/libs/utils";
import { DIETARY_PREFERENCES } from "@/libs/constants/ditary-preferences";

const DietFilters = () => {
  const { dietFilters, setDietFilters } = useFilterStore();

  const handleSelecting = (value: string) => {
    if (dietFilters.includes(value)) {
      setDietFilters(dietFilters.filter((item) => item !== value));
    } else {
      setDietFilters([...dietFilters, value]);
    }
  };
  return (
    <div>
      <span className="text-xs font-medium">Choose your preferred diet</span>
      <div className="no-scrollbar my-3 flex w-full gap-1 overflow-auto py-2">
        {Object.entries(DIETARY_PREFERENCES).map(([key, value]) => (
          <button
            key={key}
            onClick={() => handleSelecting(key)}
            className={cn(
              "flex w-full flex-1 shrink-0 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-xs text-heavy",
              dietFilters.includes(key) && "bg-primary",
            )}
          >
            {value.icon}
            {value.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DietFilters;
