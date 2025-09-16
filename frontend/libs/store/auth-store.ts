import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

const STORE_NAME = "AUTH";

interface IState {
  token: string;
  setToken: (token: string) => void;
}

const useAuthStore = create<IState>()(
  persist(
    immer(
      devtools(
        (set, get) => ({
          token: "",

          setToken: (token: string) => {
            console.log("🔐 AUTH STORE: Setting token:", {
              tokenLength: token?.length || 0,
              hasToken: !!token,
              token: token?.substring(0, 20) + "..." // Show first 20 chars for debug
            });
            
            // Test localStorage directly
            if (typeof window !== "undefined") {
              try {
                localStorage.setItem("test-token", token);
                const testRetrieve = localStorage.getItem("test-token");
                console.log("🔐 LOCALSTORAGE TEST:", { 
                  canWrite: true, 
                  canRead: testRetrieve === token,
                  testValue: testRetrieve?.substring(0, 20) + "..."
                });
              } catch (e) {
                console.error("🔐 LOCALSTORAGE ERROR:", e);
              }
            }
            
            set(
              (state) => {
                state.token = token;
              },
              false,
              "setToken",
            );
            
            // Log current state after setting
            setTimeout(() => {
              const currentState = get();
              console.log("🔐 AUTH STORE: Current state after set:", {
                hasToken: !!currentState.token,
                tokenLength: currentState.token?.length || 0,
                tokenPreview: currentState.token ? currentState.token.substring(0, 20) + "..." : "no token"
              });
            }, 100);
          },
        }),
        { name: STORE_NAME },
      )
    ),
    { 
      name: STORE_NAME,
      storage: typeof window !== "undefined" ? {
        getItem: (name) => {
          const item = localStorage.getItem(name);
          // Only log in development mode and when there's actually an item
          if (process.env.NODE_ENV === 'development' && item) {
            console.log("🔐 STORAGE: Getting item:", { name, hasItem: !!item, itemLength: item?.length || 0 });
          }
          return item ? JSON.parse(item) : null;
        },
        setItem: (name, value) => {
          if (process.env.NODE_ENV === 'development') {
            const serialized = JSON.stringify(value);
            console.log("🔐 STORAGE: Setting item:", { name, valueLength: serialized.length });
          }
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          if (process.env.NODE_ENV === 'development') {
            console.log("🔐 STORAGE: Removing item:", { name });
          }
          localStorage.removeItem(name);
        },
      } : undefined,
    },
  )
);

export default useAuthStore;
