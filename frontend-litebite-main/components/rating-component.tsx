import React from "react";
import { StarIcon } from "./icons/icons";
import { cn } from "@/libs/utils";

const RatingComponent = ({
  rate,
  className,
}: {
  rate: string;
  className?: string;
}) => {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <span className="text-xs">{rate}</span>
      <StarIcon />
    </div>
  );
};

export default RatingComponent;
