"use client";

import BottomNavigation from "@/components/bottom-navigation";
import CookiesConsent from "@/components/common/cookies-consent";
import OnboardingPopup from "@/components/common/onboarding-popup";
import { cn } from "@/libs/utils";
import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathName = usePathname();

  const showBottomNavigation =
    (["/ai", "/profile"].includes(pathName) ||
      !pathName.split("/").join("").trim() ||
      !pathName.startsWith("/meals/comments")) &&
    !pathName.startsWith("/products");

  const hasFullHeight =
    ["/ai"].includes(pathName) ||
    pathName.startsWith("/meals/comments") ||
    ["/ai/search"].includes(pathName);

  return (
    <div
      className={cn(
        "",
        showBottomNavigation && "pb-24",
        hasFullHeight ? "h-full" : "min-h-full",
      )}
    >
      {children}
      {showBottomNavigation && <BottomNavigation />}
      {/* <OnboardingPopup /> */}
      {/* <CookiesConsent /> */}
    </div>
  );
}
