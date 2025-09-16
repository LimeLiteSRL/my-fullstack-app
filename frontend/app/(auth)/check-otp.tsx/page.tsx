"use client";

import { AppleIcon, GoogleIcon } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Routes } from "@/libs/routes";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const handleSendOTP = () => {
    router.push(Routes.Login);
  };
  return (
    <div className="px-4">
      <div className="mb-[183px] mt-[115px] text-center">
        <div className="text-4xl font-semibold">LiteBite</div>
        <div>Your Path To Healthy Eating</div>
      </div>
      <div className="space-y-4">
        <Input placeholder="full name" className="rounded-full" />
        <Input placeholder="phone number" className="rounded-full" />
        <Button onClick={handleSendOTP} variant="secondary" className="w-full">
          Continue
        </Button>
      </div>
      <div className="my-9 flex items-center gap-1">
        <div className="h-px w-full bg-heavy/80"></div>
        <div className="text-xs text-heavy">or</div>
        <div className="h-px w-full bg-heavy/80"></div>
      </div>
      <div className="space-y-4">
        <Button variant="ghost" className="w-full space-x-1 rounded-full">
          <GoogleIcon className="size-5" />
          <span className="text-heavy">Continue with Google</span>
        </Button>
        <Button variant="ghost" className="w-full space-x-1 rounded-full">
          <AppleIcon className="size-5" />
          <span className="text-heavy">Continue with Apple</span>
        </Button>
      </div>
    </div>
  );
}
