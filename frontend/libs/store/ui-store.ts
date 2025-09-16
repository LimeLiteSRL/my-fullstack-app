import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

const STORE_NAME = "UI";

interface IState {
  hasSeenAiFirstPage: boolean;
  isFirstVisit: boolean;
  isCookieConsent: boolean;
  messageCount: number;
  setHasSeenAiFirstPage: (val: boolean) => void;
  setIsFirstVisit: (val: boolean) => void;
  setIsCookieConsent: (val: boolean) => void;
  setMessageCount: (val: number) => void;
}

const useUiStore = create<IState>()(
  immer(
    devtools(
      persist(
        (set) => ({
          hasSeenAiFirstPage: false,
          isFirstVisit: true,
          isCookieConsent: false,
          messageCount: 0,

          setHasSeenAiFirstPage: (val) =>
            set(
              (state) => {
                state.hasSeenAiFirstPage = val;
              },
              false,
              "hasSeenAiFirstPage",
            ),
          setIsFirstVisit: (val) =>
            set(
              (state) => {
                state.isFirstVisit = val;
              },
              false,
              "isFirstVisit",
            ),
          setIsCookieConsent: (val) =>
            set(
              (state) => {
                state.isCookieConsent = val;
              },
              false,
              "isCookieConsent",
            ),
          setMessageCount: (val) =>
            set(
              (state) => {
                state.messageCount = val;
              },
              false,
              "remaining",
            ),
        }),
        { name: STORE_NAME },
      ),
      { name: STORE_NAME },
    ),
  ),
);

export default useUiStore;
