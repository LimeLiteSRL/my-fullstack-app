import { cn } from "@/libs/utils";
import React from "react";

interface IBage {
  text: string;
  className?: string;
}
const Badge = ({ text, className }: IBage) => {
  return (
    <span
      className={cn(
        "rounded-3xl bg-primary-1 px-2 py-px text-[10px] font-semibold text-black",
        className,
      )}
    >
      {text}
    </span>
  );
};

export default Badge;
