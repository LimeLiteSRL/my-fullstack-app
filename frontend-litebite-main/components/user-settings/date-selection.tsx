"use client";

import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";

const DateSelection = ({
  setDate,
  dateString,
}: {
  setDate: (val: Date) => void;
  dateString: string | undefined;
}) => {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (dateString) {
      const date = new Date(dateString);
      setDay(date.getUTCDate() + "");
      setMonth(date.getUTCMonth() + "");
      setYear(date.getUTCFullYear() + "");
    }
  }, [dateString]);

  const years = Array.from({ length: 100 }, (_, i) => currentYear - i); // Last 100 years
  const days = Array.from({ length: 31 }, (_, i) => i + 1); // Days 1-31
  const monthsIndex = Array.from({ length: 12 }, (_, i) => i); // Days 1-31
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    if (year && month && day) {
      const dateOfBirth = new Date(Number(year), Number(month), Number(day));
      setDate(dateOfBirth);
    }
  }, [year, month, day, setDate]);

  return (
    <div className="flex space-x-4">
      {/* Day Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex-1 border-neutral-200 bg-white text-heavy"
          >
            {day || "Day"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-[200px] overflow-auto">
          {days.map((d) => (
            <DropdownMenuItem key={d} onClick={() => setDay(d.toString())}>
              {d}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Month Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex-1 border-neutral-200 bg-white text-heavy"
          >
            {months[+month] || "Month"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-[200px] overflow-auto">
          {monthsIndex.map((m, index) => (
            <DropdownMenuItem key={m} onClick={() => setMonth(m + "")}>
              {months[m]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Year Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex-1 border-neutral-200 bg-white text-heavy"
          >
            {year || "Year"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-[200px] overflow-auto">
          {years.map((y) => (
            <DropdownMenuItem key={y} onClick={() => setYear(y.toString())}>
              {y}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default DateSelection;
