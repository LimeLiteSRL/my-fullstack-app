import React, { useState, useEffect } from "react";
import { type CarouselApi } from "@/components/ui/carousel";
import { cn } from "@/libs/utils";

interface CarouselDotsProps {
  api?: CarouselApi;
  totalItems: number;
  className?: string;
}

const CarouselDots = ({ api, totalItems, className }: CarouselDotsProps) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  if (!api || totalItems <= 1) {
    return null;
  }

  const maxDots = 3;
  let dotsToShow: number[] = [];

  if (totalItems <= maxDots) {
    dotsToShow = Array.from({ length: totalItems }, (_, i) => i);
  } else {
    const start = Math.max(
      0,
      Math.min(current - Math.floor(maxDots / 2), totalItems - maxDots),
    );
    dotsToShow = Array.from({ length: maxDots }, (_, i) => start + i);
  }

  return (
    <div
      className={cn("flex items-center justify-center space-x-2", className)}
    >
      {dotsToShow.map((dotIndex) => (
        <button
          key={dotIndex}
          className={`h-[6px] w-[6px] rounded-full transition-all duration-300 ${
            current === dotIndex
              ? "h-2 w-2 scale-125 bg-secondary"
              : "bg-black/70 hover:bg-black"
          } `}
          onClick={() => api.scrollTo(dotIndex)}
        />
      ))}
    </div>
  );
};

export default CarouselDots;
