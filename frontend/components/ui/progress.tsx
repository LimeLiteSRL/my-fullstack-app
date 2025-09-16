"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/libs/utils";

type ProgressProps = React.ComponentPropsWithoutRef<
  typeof ProgressPrimitive.Root
> & {
  orientation?: "horizontal" | "vertical";
  color?: string;
};

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, color, orientation = "horizontal", ...props }, ref) => {
  const isVertical = orientation === "vertical";

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800",
        isVertical ? "h-full w-4" : "h-4 w-full",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 bg-neutral-900 transition-all dark:bg-neutral-50",
          color,
        )}
        style={
          isVertical
            ? { transform: `translateY(${100 - (value || 0)}%)` }
            : { transform: `translateX(-${100 - (value || 0)}%)` }
        }
      />
    </ProgressPrimitive.Root>
  );
});

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
