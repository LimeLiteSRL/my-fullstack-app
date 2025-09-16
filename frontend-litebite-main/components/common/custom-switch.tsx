import { cn } from "@/libs/utils";
import React from "react";

interface IItems {
  title: string;
  value: string;
}
const CustomSwitch = ({
  items,
  selected,
  setSelected,
}: {
  items: IItems[];
  selected: string;
  setSelected: (val: string) => void;
}) => {
  return (
    <div className="flex h-7 items-center gap-2 rounded-full bg-offWhite">
      {items.map((item) => (
        <button
          className={cn(
            "flex h-full w-9 flex-1 items-center justify-center rounded-full border-[#E2E8F0] p-2 text-xs text-heavy",
            selected === item.value && "border bg-white",
          )}
          key={item.value}
          onClick={() => setSelected(item.value)}
          type="button"
        >
          {item.title}
        </button>
      ))}
    </div>
  );
};

export default CustomSwitch;
