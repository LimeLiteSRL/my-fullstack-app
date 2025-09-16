"use client";

import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { authHooks } from "@/libs/endpoints/auth/auth-endpoints";
import { usersHook } from "@/libs/endpoints/users/users-endpoints";
import useAuthStore from "@/libs/store/auth-store";
import { Button } from "@/components/ui/button";

type TStep = "idle" | "google_ok" | "backend_ok" | "validated" | "profile_ok" | "error";

export default function Page() {
  const setToken = useAuthStore((s) => s.setToken);
  const [step, setStep] = useState<TStep>("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [profileResult, setProfileResult] = useState<any>(null);

  const loginWithGoogleMutation = authHooks.useLoginWithGoogle();
  const validateTokenMutation = authHooks.useValidateTokenMutation();
  const profileQuery = usersHook.useQueryUserProfile(
    { queries: { timezoneOffset: String(new Date().getTimezoneOffset()) } },
    { enabled: false },
  );

  const addLog = (msg: string) => setLogs((l) => [msg, ...l]);

  const onGoogleSuccess = (credentialResponse: any) => {
    const token = credentialResponse?.credential;
    if (!token) {
      addLog("Google did not return a credential");
      setStep("error");
      return;
    }
    setGoogleToken(token);
    addLog("✅ Google credential received");
    setStep("google_ok");

    loginWithGoogleMutation.mutate(
      { token },
      {
        onSuccess: (res) => {
          addLog("✅ Backend /auth/google-login success");
          setJwtToken(res.token);
          setToken(res.token);
          setStep("backend_ok");
        },
        onError: (err: any) => {
          addLog(`❌ Backend login error: ${err?.message || "unknown"}`);
          setStep("error");
        },
      },
    );
  };

  const onGoogleError = () => {
    addLog("❌ Google login failed");
    setStep("error");
  };

  const handleValidate = () => {
    if (!jwtToken) return;
    validateTokenMutation.mutate(
      { token: jwtToken },
      {
        onSuccess: (res) => {
          addLog("✅ Token validated by backend");
          setValidationResult(res);
          setStep("validated");
        },
        onError: (err: any) => {
          addLog(`❌ Validate error: ${err?.message || "unknown"}`);
          setStep("error");
        },
      },
    );
  };

  const handleFetchProfile = async () => {
    try {
      const res = await profileQuery.refetch();
      setProfileResult(res.data);
      addLog("✅ Fetched protected /profile successfully");
      setStep("profile_ok");
    } catch (e: any) {
      addLog(`❌ Profile fetch error: ${e?.message || "unknown"}`);
      setStep("error");
    }
  };

  const handleReset = () => {
    setLogs([]);
    setGoogleToken(null);
    setJwtToken(null);
    setValidationResult(null);
    setProfileResult(null);
    setStep("idle");
  };

  return (
    <div className="mx-auto max-w-xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Auth Test (Google → Verify → Protected)</h1>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="text-sm text-muted-foreground">Step 1: Google Login</div>
        <GoogleLogin onSuccess={onGoogleSuccess} onError={onGoogleError} useOneTap={false} />
        {googleToken && (
          <div className="text-xs break-all">
            Google credential: {googleToken.substring(0, 30)}...
          </div>
        )}
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="text-sm text-muted-foreground">Step 2: Exchange for JWT</div>
        <div className="text-xs">Automatically calls /auth/google-login</div>
        {jwtToken && (
          <div className="text-xs break-all">
            JWT: {jwtToken.substring(0, 40)}...
          </div>
        )}
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="text-sm text-muted-foreground">Step 3: Validate token</div>
        <Button size="sm" onClick={handleValidate} disabled={!jwtToken || validateTokenMutation.isLoading}>
          {validateTokenMutation.isLoading ? "Validating..." : "Validate /auth/validate-token"}
        </Button>
        {validationResult && (
          <pre className="whitespace-pre-wrap break-all text-xs bg-muted p-2 rounded">
            {JSON.stringify(validationResult, null, 2)}
          </pre>
        )}
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="text-sm text-muted-foreground">Step 4: Call protected /profile</div>
        <Button size="sm" onClick={handleFetchProfile} disabled={!jwtToken || profileQuery.isFetching}>
          {profileQuery.isFetching ? "Fetching..." : "Fetch /profile"}
        </Button>
        {profileResult && (
          <pre className="whitespace-pre-wrap break-all text-xs bg-muted p-2 rounded">
            {JSON.stringify(profileResult, null, 2)}
          </pre>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={handleReset}>Reset</Button>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <div className="text-sm font-medium">Logs</div>
        <ul className="space-y-1 text-xs">
          {logs.map((l, i) => (
            <li key={i}>• {l}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}




