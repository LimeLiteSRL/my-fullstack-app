"use client";

import { useEffect } from "react";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Override the root layout constraints for landing page
    const body = document.body;
    const main = document.querySelector("main");
    
    if (body) {
      body.style.maxWidth = "none";
      body.style.margin = "0";
      body.style.padding = "0";
    }
    
    if (main) {
      main.style.maxWidth = "none";
      main.style.margin = "0";
      main.style.padding = "0";
    }
    
    // Cleanup function to restore original styles when leaving
    return () => {
      if (body) {
        body.style.maxWidth = "";
        body.style.margin = "";
        body.style.padding = "";
      }
      if (main) {
        main.style.maxWidth = "";
        main.style.margin = "";
        main.style.padding = "";
      }
    };
  }, []);

  return (
    <div className="w-full h-full min-h-screen bg-white overflow-x-hidden">
      {children}
    </div>
  );
}
