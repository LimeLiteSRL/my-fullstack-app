"use client";

import useFilterStore from "@/libs/store/filters-store";
import { Button } from "../ui/button";
import { ALLERGIES } from "@/libs/constants/allergies";
import { useEffect, useRef, useState } from "react";

const AllergyFilters = () => {
  const { allergyFilters, setAllergyFilters } = useFilterStore();

  const handleSelecting = (value: string) => {
    if (allergyFilters.includes(value)) {
      setAllergyFilters(allergyFilters.filter((item) => item !== value));
    } else {
      setAllergyFilters([...allergyFilters, value]);
    }
  };
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeScrollDot, setActiveScrollDot] = useState(0);

  const scrollToDot = (dotIndex: number) => {
    const container = containerRef.current;
    if (!container) return;

    if (dotIndex === 0) {
      // Scroll to start
      container.scrollTo({
        left: 0,
        behavior: "smooth",
      });
    } else {
      // Scroll to end
      container.scrollTo({
        left: container.scrollWidth - container.clientWidth,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isAtEnd =
        container.scrollWidth - container.scrollLeft <=
        container.clientWidth + 1;

      const isAtStart = container.scrollLeft === 0;

      if (isAtEnd) {
        setActiveScrollDot(1);
      } else if (isAtStart) {
        setActiveScrollDot(0);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div>
      <span className="text-xs font-medium">Allergies you want to avoid</span>
      <div
        ref={containerRef}
        className="no-scrollbar mt-3 flex w-full gap-2 overflow-x-auto py-2"
      >
        {ALLERGIES.map((allergy) => (
          <Button
            className={`text-xs font-normal ${allergyFilters.includes(allergy.key) ? "mx-px" : ""}`}
            onClick={() => handleSelecting(allergy.key)}
            size="sm"
            variant={allergyFilters.includes(allergy.key) ? "default" : "light"}
            key={allergy.value}
          >
            {allergy.value}
          </Button>
        ))}
      </div>
      <div className="mb-3 mt-1 flex justify-center space-x-2">
        <div
          onClick={() => scrollToDot(0)}
          className={`h-2 w-2 rounded-full transition-colors ${
            activeScrollDot === 0 ? "bg-secondary" : "bg-gray-300"
          }`}
        />
        <div
          onClick={() => scrollToDot(1)}
          className={`h-2 w-2 rounded-full transition-colors ${
            activeScrollDot === 1 ? "bg-secondary" : "bg-gray-300"
          }`}
        />
      </div>
    </div>
  );
};

export default AllergyFilters;
