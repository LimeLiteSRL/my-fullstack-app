/* eslint-disable @next/next/no-img-element */
"use client";

import OTPStep from "@/components/auth/OTP-step";
import PhoneNumberForm from "@/components/auth/phone-number-input";
import { AppleIcon, ArrowLeftIcon, GoogleIcon } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import { authHooks } from "@/libs/endpoints/auth/auth-endpoints";
import { Routes } from "@/libs/routes";
import useAuthStore from "@/libs/store/auth-store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";
import { cn } from "@/libs/utils";
import IntroCarousel from "@/components/auth/intro-carousel";
import { GOOGLE_OAUTH_CLIENT_ID } from "@/config";

type ISteps = "SEND_CODE" | "CHECK_CODE";

export default function Page() {
  const [step, setStep] = useState<ISteps>("SEND_CODE");
  const [phoneNumber, setPhoneNumber] = useState("");
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setToken);

  const loginWithGoogleMutation = authHooks.useLoginWithGoogle();

  const handleLoginSuccess = (credentialResponse: any) => {
    console.log("🔐 Google Login Success:", credentialResponse);
    loginWithGoogleMutation.mutate(
      { token: credentialResponse.credential },
      {
        onSuccess: (res) => {
          console.log("🔐 Backend Login Success:", res);
          setToken(res.token);
          router.push(Routes.Home);
        },
        onError: (error) => {
          console.error("🔐 Backend Login Error:", error);
          toast.error("Authentication failed. Please try again.");
        },
      },
    );
  };

  const handleLoginError = () => {
    console.error("🔐 Google Login Error");
    toast.error("Google login failed. Please try OTP login instead.");
  };

  return (
    <>
      <div className="relative h-full">
        <div className="mb-1 w-full rounded-b-[25px] bg-white p-4">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="size-10 overflow-hidden rounded-lg">
                <img
                  src="./images/logo.png"
                  alt="logo"
                  className="h-full max-w-full object-contain"
                />
              </div>
              <div className="text-xl font-semibold">LiteBite</div>
            </div>
            <button
              onClick={() => router.push(Routes.Home)}
              className="flex items-center justify-center rounded-full bg-offWhite p-2 text-sm"
            >
              {/* <ArrowLeftIcon className="size-4 text-heavy" /> */}
              Back
            </button>
          </div>
          <IntroCarousel currentStep={step} />
        </div>

        <div className="p-4">
          {step === "SEND_CODE" ? (
            <>
              <div className="space-y-4">
                <PhoneNumberForm
                  setPhoneNumber={setPhoneNumber}
                  setStep={setStep}
                />
              </div>
              <div className="my-9 flex items-center gap-1">
                <div className="h-px w-full bg-heavy/80"></div>
                <div className="text-xs text-heavy">or</div>
                <div className="h-px w-full bg-heavy/80"></div>
              </div>
              <div className="mx-auto flex w-full items-center justify-center space-y-4">
                {GOOGLE_OAUTH_CLIENT_ID && GOOGLE_OAUTH_CLIENT_ID.includes('.apps.googleusercontent.com') ? (
                  <GoogleLogin
                    shape="pill"
                    logo_alignment="center"
                    useOneTap={false} // Disable oneTap for debugging
                    width="100%"
                    containerProps={{ className: "w-full" }}
                    onSuccess={handleLoginSuccess}
                    onError={handleLoginError}
                  />
                ) : (
                  <div className="w-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                    <p className="text-sm text-yellow-800">
                      Google login is not configured. Please use OTP login above.
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      Contact admin to configure Google OAuth client ID.
                    </p>
                  </div>
                )}
                {/* <Button variant="ghost" className="w-full space-x-1 rounded-full">
                  <GoogleIcon className="size-5" />
                  <span className="text-heavy">Continue with Google</span>
                </Button> */}
                {/* <Button variant="ghost" className="w-full space-x-1 rounded-full">
                  <AppleIcon className="size-5" />
                  <span className="text-heavy">Continue with Apple</span>
                </Button> */}
              </div>
            </>
          ) : (
            <OTPStep phoneNumber={phoneNumber} setStep={setStep} />
          )}
        </div>
      </div>
    </>
  );
}

const stepItems = [
  {
    step: "SEND_CODE",
  },
  {
    step: "CHECK_CODE",
  },
];
