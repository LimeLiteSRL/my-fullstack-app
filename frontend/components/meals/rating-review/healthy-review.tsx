import { LeafIcon } from "@/components/icons/icons";
import { cn } from "@/libs/utils";

const HealthRate = ({
  rate,
  iconSize,
}: {
  rate: number;
  iconSize?: number;
}) => {
  return (
    <div className="flex items-center">
      <LeafIcon
        className={cn("size-6 text-[#4CAF50]", iconSize && `size-${iconSize}`)}
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

export default HealthRate;
