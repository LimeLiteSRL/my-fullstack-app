"use client";

import { useFullWidth } from "@/libs/hooks/use-full-width";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use the custom hook to manage full width
  useFullWidth(true);

  return (
    <div className="w-full h-full min-h-screen bg-white overflow-x-hidden">
      {children}
    </div>
  );
}
