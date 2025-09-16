"use client";

import { cn, getLast30Days } from "@/libs/utils";
import { getDaysInMonth } from "date-fns";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface IDate {
  label: string;
  day: string;
  month: string;
  year: string;
}

const DateSelection = ({
  setStartDate,
  setEndDate,
}: {
  setStartDate: (val: string) => void;
  setEndDate: (val: string) => void;
}) => {
  const today = useMemo(() => new Date(), []);
  const daysInMonth = getDaysInMonth(today);
  const lastIndex = daysInMonth == 31 ? daysInMonth - 2 : daysInMonth - 1;
  const [selectedDate, setSelectedDate] = useState(lastIndex);
  const dateArray = getLast30Days();
  const lastDateRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (lastDateRef.current) {
      lastDateRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
      });
    }
  }, []);

  const handleSelectDay = useCallback((date: IDate, index: number) => {
    setSelectedDate(index);
    const selectedDateStr = `${date.year}-${date.month}-${date.day}`;
    const selectedDateObj = new Date(selectedDateStr);

    const startDateObj = new Date(selectedDateObj);
    startDateObj.setHours(0, 0, 0, 0);

    const endDateObj = new Date(selectedDateObj);
    endDateObj.setHours(23, 59, 59, 999);

    const startISO = startDateObj.toISOString();
    const endISO = endDateObj.toISOString();
    setStartDate(startISO);
    setEndDate(endISO);
  }, [setStartDate, setEndDate]);

  useEffect(() => {
    handleSelectDay(
      {
        label: "Today",
        day: today.getDate().toString().padStart(2, "0"),
        month: (today.getMonth() + 1).toString().padStart(2, "0"),
        year: today.getFullYear().toString(),
      },
      selectedDate,
    );
  }, [selectedDate, today, handleSelectDay]);

  

  return (
    <div>
      <div className="my-6 flex items-center justify-between">
        <div className="text-lg font-medium">Week Days</div>
        {/* <div className="flex items-center gap-2 rounded-full border border-heavy p-2 text-sm text-heavy">
          <CalendarIcon className="size-5 shrink-0" /> {currentMonth}
        </div> */}
      </div>
      <div className="no-scrollbar flex items-center gap-2 overflow-auto py-2">
        {dateArray.map((date, index) => (
          <button
            key={index}
            ref={index === dateArray.length - 1 ? lastDateRef : null}
            className={cn(
              "flex h-[90px] flex-col items-center justify-between gap-1 rounded-full bg-neutral-200 p-1",
              selectedDate === index && "bg-secondary",
            )}
            onClick={() => handleSelectDay(date, index)}
          >
            <div
              className={cn(
                "mt-2 text-sm text-heavy",
                selectedDate === index && "text-white",
              )}
            >
              {date.label}
            </div>
            <div className="flex size-9 items-center justify-center gap-1 rounded-full bg-white text-sm font-semibold">
              <div
                className={cn(
                  "text-sm font-medium text-heavy",
                  selectedDate === index && "text-secondary",
                )}
              >
                {date.day}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DateSelection;
