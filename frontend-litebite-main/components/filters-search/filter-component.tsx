"use client";

import { Button } from "../ui/button";
import { CancelIcon } from "../icons/icons";
import { cn } from "@/libs/utils";
import useFilterStore from "@/libs/store/filters-store";
import TypeFilter from "./menu-filter";
import AllergyFilters from "./allergy-filter";
import DietFilters from "./diet-filter";
import CaloryFilters from "./calory-filter";
import { queryClient } from "@/libs/query-client";
import createFilterParams from "./create-filters-params";
import { mealsHook } from "@/libs/endpoints/meals/meals-endpoints";

const FilterComponent = () => {
  const {
    isFilterVisible,
    setIsFilterVisible,
    handleClearFilters,
    updateFilterParams,
    setIsCaloryChanged,
  } = useFilterStore();

  const onClearFilters = () => {
    updateFilterParams({});
    handleClearFilters();
    setIsCaloryChanged(false);
    setIsFilterVisible(false);
    queryClient.invalidateQueries(mealsHook.getKeyByAlias("queryMealsNearBy"));
  };
  const handleSetFilters = () => {
    const filterParams = createFilterParams();
    updateFilterParams(filterParams);
    setIsFilterVisible(false);
    queryClient.invalidateQueries(mealsHook.getKeyByAlias("queryMealsNearBy"));
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-1/2 z-50 w-[360px] -translate-x-1/2 overflow-hidden rounded-xl border bg-white p-4 shadow-md transition-transform duration-300 ease-in-out",
        isFilterVisible ? "-translate-y-24" : "translate-y-full",
      )}
    >
      <div className="flex w-full justify-between">
        <div>
          <div className="font-semibold">Filters</div>
          <div className="text-xs text-heavy">
            ⚠️ Allergy and diet info may not be 100% accurate. Please verify
            with the restaurant.
          </div>
        </div>
        <button className="h-fit" onClick={() => setIsFilterVisible(false)}>
          <CancelIcon className="size-6" />
        </button>
      </div>
      <TypeFilter />
      <div>
        <AllergyFilters />
      </div>
      <div className="border-t border-neutral-200 pt-3">
        <DietFilters />
      </div>
      <div className="border-t border-neutral-200 pt-3">
        <CaloryFilters />
      </div>

      <div className="flex items-center gap-2 px-4">
        <Button onClick={onClearFilters} variant="outline" className="flex-1">
          Clear all
        </Button>
        <Button
          variant="secondary"
          onClick={handleSetFilters}
          className="flex-1"
        >
          Apply
        </Button>
      </div>
    </div>
  );
};

export default FilterComponent;
