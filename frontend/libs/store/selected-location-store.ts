import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type ILocation = {
  lat: number | null;
  lng: number | null;
};
interface IState {
  selectedLocation: ILocation;
}
interface IActions {
  setSelectedLocation: (lat: number | null, lng: number | null) => void;
}

const useSelectedLocationStore = create<IState & IActions>()(
  immer((set) => ({
    selectedLocation: {
      lat: null,
      lng: null,
    },
    isCameraOnUser: false,

    setSelectedLocation: (lat, lng) =>
      set((state) => {
        state.selectedLocation.lat = lat;
        state.selectedLocation.lng = lng;
      }),
  })),
);

export default useSelectedLocationStore;
