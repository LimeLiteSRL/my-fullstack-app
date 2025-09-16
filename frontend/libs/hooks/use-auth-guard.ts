import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "../store/auth-store";
import { authHooks } from "../endpoints/auth/auth-endpoints";
import { Routes } from "@/libs/routes";

interface UseAuthGuardOptions {
  redirectToLogin?: boolean;
  onInvalidToken?: () => void;
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { redirectToLogin = true, onInvalidToken } = options;
  const router = useRouter();
  const { token, setToken } = useAuthStore();
  const [isValidating, setIsValidating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const validateTokenMutation = authHooks.useValidateTokenMutation();
  const isRunningRef = useRef(false);
  const lastValidatedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      // If no token, user is not authenticated
      if (!token || token.trim() === "") {
        setIsAuthenticated(false);
        console.log("🔐 No token found:", { redirectToLogin });
        if (redirectToLogin) {
          console.log("🔐 Redirecting to login (no token)");
          router.push(Routes.Login);
        } else {
          console.log("🔐 No redirect - optional auth");
        }
        return;
      }

      // Avoid duplicate validations for the same token
      if (isRunningRef.current) return;
      if (lastValidatedTokenRef.current === token && isAuthenticated !== null) return;

      isRunningRef.current = true;
      setIsValidating(true);
      
      try {
        const response = await validateTokenMutation.mutateAsync({
          token: token,
        });

        if (response.valid) {
          setIsAuthenticated(true);
          console.log("🔐 Token is valid:", response.user);
        } else {
          setIsAuthenticated(false);
          // Clear invalid token
          setToken("");
          console.log("🔐 Invalid token found:", { redirectToLogin });
          
          if (onInvalidToken) {
            onInvalidToken();
          }
          
          if (redirectToLogin) {
            console.log("🔐 Invalid token, redirecting to login");
            router.push(Routes.Login);
          } else {
            console.log("🔐 Invalid token, but no redirect - optional auth");
          }
        }
      } catch (error) {
        const err = error as unknown;
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("🔐 Token validation error:", err);
        setIsAuthenticated(false);
        
        // Clear invalid token on error
        setToken("");
        console.log("🔐 Token validation failed:", { redirectToLogin, error: errorMessage });
        
        if (onInvalidToken) {
          onInvalidToken();
        }
        
        // For optional auth, don't redirect on network errors - user might be offline
        if (redirectToLogin && !errorMessage.includes('fetch')) {
          console.log("🔐 Validation error, redirecting to login");
          router.push(Routes.Login);
        } else {
          console.log("🔐 Validation error, but no redirect - optional auth or network error");
        }
      } finally {
        lastValidatedTokenRef.current = token;
        isRunningRef.current = false;
        setIsValidating(false);
      }
    };

    validateToken();
    // Only re-run when token changes to prevent repeated calls
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return {
    isAuthenticated,
    isValidating,
    token,
  };
}

// Hook for components that require authentication
export function useRequireAuth(options: UseAuthGuardOptions = {}) {
  return useAuthGuard({ redirectToLogin: true, ...options });
}

// Hook for optional authentication (doesn't redirect)
export function useOptionalAuth() {
  return useAuthGuard({ redirectToLogin: false });
}
