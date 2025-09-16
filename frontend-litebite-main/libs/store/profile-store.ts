import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { ISingleMeal } from "../endpoints/meals/meals-schema";
import { IUser } from "../endpoints/users/users-schema";

interface IState {
  username: string;
}
interface IActions {
  setUsername: (value: string) => void;
  user: IUser | undefined;
  setUser: (value: IUser | undefined) => void;
}

const useProfileStore = create<IState & IActions>()(
  immer((set) => ({
    username: "",
    user: undefined,

    setUsername: (value) =>
      set((state) => {
        state.username = value;
      }),
    setUser: (value) =>
      set((state) => {
        state.user = value;
      }),
  })),
);

export default useProfileStore;
