import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { ISingleMeal } from "../endpoints/meals/meals-schema";

interface IState {
  isMealDetailsOpen: boolean;
  mealDetails: ISingleMeal | null;
  restaurantId: string | null;
  meals: ISingleMeal[] | null;
}
interface IActions {
  setIsMealDetailsOpen: (value: boolean) => void;
  setMealDetails: (value: ISingleMeal) => void;
  handleCloseMealDetails: () => void;
  setRestaurantId: (value: string) => void;
  setMeals: (value: ISingleMeal[]) => void;
}

const useMealDetailsStore = create<IState & IActions>()(
  immer((set) => ({
    isMealDetailsOpen: false,
    mealDetails: null,
    restaurantId: null,
    meals: null,

    setIsMealDetailsOpen: (value: boolean) =>
      set((state) => {
        state.isMealDetailsOpen = value;
      }),

    setMealDetails: (value) =>
      set((state) => {
        state.mealDetails = value;
      }),

    setRestaurantId: (value) =>
      set((state) => {
        state.restaurantId = value;
      }),
    setMeals: (value) =>
      set((state) => {
        state.meals = value;
      }),

    handleCloseMealDetails: () =>
      set((state) => {
        state.isMealDetailsOpen = false;
        state.mealDetails = null;
        state.restaurantId = null;
        state.meals = null;
      }),
  })),
);

export default useMealDetailsStore;
