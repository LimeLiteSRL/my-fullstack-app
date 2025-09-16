import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools, persist } from "zustand/middleware";

type IFilterParams = Record<string, string | number | boolean | undefined>;
interface IState {
  isFilterVisible: boolean;
  typeFilters: string[];
  allergyFilters: string[];
  dietFilters: string[];
  caloryFilters: number[];
  filterParams: IFilterParams;
  isCaloryChanged: boolean;
}
interface IActions {
  setIsFilterVisible: (value: boolean) => void;
  setTypeFilters: (value: string[]) => void;
  setAllergyFilters: (value: string[]) => void;
  setDietFilters: (value: string[]) => void;
  setCaloryFilters: (value: number[]) => void;
  handleClearFilters: () => void;
  updateFilterParams: (value: IFilterParams) => void;
  setIsCaloryChanged: (value: boolean) => void;
}

const useFilterStore = create<IState & IActions>()(
  immer(
    persist(
      (set) => ({
        isFilterVisible: false,
        typeFilters: [],
        allergyFilters: [],
        dietFilters: [],
        caloryFilters: [400, 800],
        filterParams: {},
        isCaloryChanged: false,

        setIsFilterVisible: (value: boolean) =>
          set((state) => {
            state.isFilterVisible = value;
          }),
        setIsCaloryChanged: (value: boolean) =>
          set((state) => {
            state.isCaloryChanged = value;
          }),

        setTypeFilters: (value: string[]) =>
          set((state) => {
            state.typeFilters = value;
          }),
        setAllergyFilters: (value: string[]) =>
          set((state) => {
            state.allergyFilters = value;
          }),
        setCaloryFilters: (value: number[]) =>
          set((state) => {
            state.caloryFilters = value;
          }),
        setDietFilters: (value: string[]) =>
          set((state) => {
            state.dietFilters = value;
          }),
        updateFilterParams: (value) =>
          set((state) => {
            state.filterParams = value;
          }),
        handleClearFilters: () =>
          set((state) => {
            state.dietFilters = [];
            state.allergyFilters = [];
            state.dietFilters = [];
            state.typeFilters = [];
            state.caloryFilters = [400, 800];
            state.filterParams = {};
          }),
      }),
      { name: "filters" },
    ),
  ),
);

export default useFilterStore;
