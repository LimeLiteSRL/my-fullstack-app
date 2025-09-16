"use client";

import { useEffect, useState } from "react";
import { DualRangeSlider } from "../ui/slider";
import useFilterStore from "@/libs/store/filters-store";
import { cn } from "@/libs/utils";

const CaloryFilters = () => {
  const {
    caloryFilters,
    setCaloryFilters,
    filterParams,
    isCaloryChanged,
    setIsCaloryChanged,
  } = useFilterStore();

  const isDefault =
    caloryFilters?.[0] == 400 &&
    caloryFilters?.[1] == 800 &&
    !("caloriesKcalMax" in filterParams);

  useEffect(() => {
    if (
      (caloryFilters?.[0] !== 400 || caloryFilters?.[1] !== 800) &&
      !isCaloryChanged
    ) {
      setIsCaloryChanged(true);
    }
  }, [caloryFilters, isCaloryChanged, setIsCaloryChanged]);

  return (
    <div>
      <span className="text-xs font-medium">Calories you want to take</span>
      <div className="my-3 flex items-center justify-center gap-3 text-sm">
        <div className="rounded-3xl bg-neutral-100 px-3 py-1 text-heavy">
          Min:
          <span className="ms-2 font-medium text-neutral-800">
            {caloryFilters[0]}
          </span>
        </div>
        <div className="rounded-3xl bg-neutral-100 px-3 py-1 text-heavy">
          Max:
          <span className="ms-2 font-medium text-neutral-800">
            {caloryFilters[1] >= 1500 ? "+2500" : caloryFilters[1]}
          </span>
        </div>
      </div>
      <div className={cn("my-6", isDefault && "opacity-75")}>
        <DualRangeSlider
          rangeClassName={isDefault ? "bg-neutral-500" : ""}
          value={caloryFilters}
          onValueChange={setCaloryFilters}
          min={0}
          max={1500}
          step={1}
        />
      </div>
    </div>
  );
};

export default CaloryFilters;
