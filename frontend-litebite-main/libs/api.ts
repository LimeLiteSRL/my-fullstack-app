import { BASE_API_URL } from "@/config";
import axios from "axios";
import useAuthStore from "./store/auth-store";
import useProfileStore from "./store/profile-store";
import { getIsProduction } from "./utils";

// Don't get token at module level - it will be stale
// Token will be added dynamically in request interceptor

export const mainApiInstance = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

mainApiInstance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    const err = error.toJSON();

    if (err.status === 401) {
      console.log("🔐 401 Unauthorized - clearing auth state");
      
      // Clear auth state
      useAuthStore.getState().setToken("");
      useProfileStore.getState().setUser(undefined);
      useProfileStore.getState().setUsername("");
      
      // Only redirect to login for protected pages, not public pages
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
      const isProtectedPage = currentPath.includes("/profile") || 
                             currentPath.includes("/user-settings") ||
                             currentPath.includes("/ai");
      
      if (typeof window !== "undefined" && 
          !currentPath.includes("/login") && 
          isProtectedPage) {
        console.log("🔐 Redirecting to login from protected page:", currentPath);
        window.location.href = "/login";
      } else {
        console.log("🔐 401 on public page - no redirect needed:", currentPath);
      }
    }

    return Promise.reject(error);
  },
);

// Request interceptor to add token to headers
mainApiInstance.interceptors.request.use(
  function (config) {
    const token = useAuthStore.getState().token;
    
    // Only log in development mode and for protected endpoints
    const isProtectedEndpoint = config.url?.includes('/profile') || 
                               config.url?.includes('/auth/validate-token') ||
                               config.headers?.Authorization;
    
    if (process.env.NODE_ENV === 'development' && isProtectedEndpoint) {
      console.log("🔐 REQUEST INTERCEPTOR:", {
        url: config.url,
        hasToken: !!token,
        tokenLength: token?.length || 0,
        tokenPreview: token ? token.substring(0, 20) + "..." : "no token"
      });
    }
    
    if (token && token.trim() !== "") {
      config.headers.Authorization = `Bearer ${token}`;
      if (process.env.NODE_ENV === 'development' && isProtectedEndpoint) {
        console.log("🔐 ✅ Token added to request:", config.url);
      }
    } else {
      // Remove authorization header if no token
      delete config.headers.Authorization;
      // Don't log for public endpoints - it's expected
    }
    
    return config;
  },
  function (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("🔐 Request interceptor error:", error);
    }
    return Promise.reject(error);
  }
);
