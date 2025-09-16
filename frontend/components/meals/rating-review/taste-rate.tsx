import { HeartFillIcon } from "@/components/icons/icons";
import { cn } from "@/libs/utils";

const TasteRate = ({ rate, iconSize }: { rate: number; iconSize?: number }) => {
  return (
    <div className="flex items-center">
      <HeartFillIcon
        className={cn("size-6 text-[#C30000]", iconSize && `size-${iconSize}`)}
      />
      <span
        className={cn(
          "min-w-[13px] text-end font-semibold",
          (iconSize || 6) <= 5 && "text-xs",
        )}
      >
        {rate}
      </span>
    </div>
  );
};

export default TasteRate;
