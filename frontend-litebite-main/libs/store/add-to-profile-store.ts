import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

const STORE_NAME = "AddTOPROFILE";

interface IState {
  selectedMeal: string;
  setSelectedMeal: (value: string) => void;
}

const useAddToProfileStore = create<IState>()(
  immer(
    devtools(
      persist(
        (set) => ({
          selectedMeal: "",

          setSelectedMeal: (value) =>
            set(
              (state) => {
                state.selectedMeal = value;
              },
              false,
              "setMeal",
            ),
        }),
        { name: STORE_NAME },
      ),
      { name: STORE_NAME },
    ),
  ),
);

export default useAddToProfileStore;
