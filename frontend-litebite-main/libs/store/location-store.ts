import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { ILocation } from "../types/common";
import { test_lat, test_lng } from "@/config";

interface IState {
  userLocation: ILocation;
  isCameraOnUser: boolean;
  distance: number;
  fetchingLocation: ILocation;
}
interface IActions {
  setUserLocation: (lat: number, lng: number) => void;
  setIsCameraOnUser: (val: boolean) => void;
  setFetchingLocation: (lat: number, lng: number) => void;
  setDistance: (val: number) => void;
}

const useLocationStore = create<IState & IActions>()(
  immer(
    persist(
      (set) => ({
        userLocation: {
          lat: test_lat,
          lng: test_lng,
        },
        fetchingLocation: {
          lat: test_lat,
          lng: test_lng,
        },
        isCameraOnUser: false,
        distance: 1000,

        setUserLocation: (lat: number, lng: number) =>
          set((state) => {
            state.userLocation.lat = lat;
            state.userLocation.lng = lng;
          }),
        setFetchingLocation: (lat: number, lng: number) =>
          set((state) => {
            state.fetchingLocation.lat = lat;
            state.fetchingLocation.lng = lng;
          }),
        setIsCameraOnUser: (val) =>
          set((state) => {
            state.isCameraOnUser = val;
          }),
        setDistance: (val) =>
          set((state) => {
            state.distance = val;
          }),
      }),
      { name: "location" },
    ),
  ),
);

export default useLocationStore;
