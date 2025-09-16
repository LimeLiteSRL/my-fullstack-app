/* eslint-disable @next/next/no-img-element */
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { InformationCircleIcon } from "../icons/icons";

const AppInfo = () => {
  return (
    <Popover>
      <PopoverTrigger>
        <InformationCircleIcon className="size-7 text-neutral-800" />
      </PopoverTrigger>
      <PopoverContent className="rounded-2xl" align="end">
        <p className="text-justify text-xs font-light leading-relaxed">
          The information you see here is calculated using the
          <b> Harris-Benedict </b>
          formula, a reliable method for determining daily nutrition needs based
          on your height, weight, age and activity level.
        </p>
        <div className="mt-2 flex flex-col border-t border-offWhite pt-2 text-xs leading-relaxed">
          <span>Have feedback or questions?</span>
          <a
            href="mailto:hello@litebite.ai"
            target="_blank"
            className="text-secondary"
          >
            ✉️ hello@litebite.ai
          </a>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AppInfo;
