import { mainApiInstance } from "../api";
import useAuthStore from "../store/auth-store";
import useIsomorphicLayoutEffect from "./use-isomorphic-layout-effect";

export default function useSyncToken() {
  const accessToken = useAuthStore((s) => s.token);

  useIsomorphicLayoutEffect(() => {
    // Only log in development mode and when there are actual changes
    if (process.env.NODE_ENV === 'development' && accessToken) {
      console.log("🔐 SYNC TOKEN:", {
        hasToken: !!accessToken,
        tokenLength: accessToken?.length || 0,
        tokenPreview: accessToken ? accessToken.substring(0, 20) + "..." : "no token"
      });
    }
    
    // Set default headers as backup (request interceptor is primary)
    if (accessToken && accessToken.trim() !== "") {
      mainApiInstance.defaults.headers.Authorization = `Bearer ${accessToken}`;
      if (process.env.NODE_ENV === 'development') {
        console.log("🔐 ✅ Default headers updated with token");
      }
    } else {
      // Silently clear headers - this is normal for public pages
      delete mainApiInstance.defaults.headers.Authorization;
      // Don't log when clearing headers - it's expected for public pages
    }
  }, [accessToken]);
}
