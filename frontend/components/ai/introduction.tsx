/* eslint-disable @next/next/no-img-element */
"use router";

import {
  AiLineIcon,
  ChartHistogramIcon,
  DishIcon,
  WaterOutlineIcon,
} from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import { Routes } from "@/libs/routes";
import useProfileStore from "@/libs/store/profile-store";
import useUiStore from "@/libs/store/ui-store";
import { useRouter } from "next/navigation";
import { TypeAnimation } from "react-type-animation";

const Introduction = () => {
  const router = useRouter();
  const { setHasSeenAiFirstPage } = useUiStore();
  const { username } = useProfileStore();
  return (
    <div className="p-4 pb-24">
      <div>
        <div className="text-lg font-medium">Hi, {username}</div>
        <div className="font-light">Welcome to your AI Assistant.</div>
      </div>

      <div className="mt-8 flex">
        <div className="relative w-full">
          <img src="/images/subtract-primary.svg" alt="" className="w-full" />
          <div className="absolute left-1 top-1 z-30 flex size-10 items-center justify-center rounded-full bg-offWhite text-heavy min-[500px]:left-4 min-[500px]:top-4">
            <ChartHistogramIcon className="size-6" />
          </div>
          <div className="absolute bottom-8 start-1/2 w-full -translate-x-1/2 space-y-2 p-4 text-heavy min-[600px]:p-8">
            <h2 className="font-semibold min-[600px]:text-2xl">
              Track your meals
            </h2>
            <p className="text-xs font-light min-[600px]:text-sm">
              “I had a grilled salmon with veggies for dinner.”
            </p>
          </div>
        </div>

        <div className="w-full space-y-2 p-3">
          <div className="relative w-full">
            <img src="/images/subtract.svg" alt="" className="w-full" />
            <div className="absolute left-1 top-1 z-30 flex size-9 items-center justify-center rounded-full bg-offWhite text-heavy min-[500px]:left-4 min-[500px]:top-4">
              <DishIcon className="size-6" />
            </div>
            <div className="absolute bottom-2 start-1/2 w-full -translate-x-1/2 p-4 pb-2 text-white min-[600px]:space-y-2 min-[600px]:p-8">
              <h2 className="font-semibold min-[600px]:text-2xl">
                Get recipes
              </h2>
              <p className="text-xs font-light min-[600px]:text-sm">
                “Give me a keto recipe with chicken breast.”
              </p>
            </div>
          </div>
          <div className="relative w-full">
            <img src="/images/subtract-third.svg" alt="" className="w-full" />
            <div className="absolute left-1 top-1 z-30 flex size-9 items-center justify-center rounded-full bg-offWhite text-heavy min-[500px]:left-4 min-[500px]:top-4">
              <WaterOutlineIcon className="size-6" />
            </div>
            <div className="absolute bottom-2 start-1/2 w-full -translate-x-1/2 p-4 pb-1 text-heavy min-[600px]:space-y-2 min-[600px]:p-8">
              <h2 className="text-sm font-semibold min-[600px]:text-2xl">
                Log your water intake
              </h2>
              <p className="text-xs font-light min-[600px]:text-sm">
                “I drank 2 glasses of water today.”
              </p>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="mt-4 text-center text-heavy">
          <TypeAnimation
            sequence={[
              "Just tell me what meals you’ve eaten \nhow much water you’ve had \nand I’ll help you track your nutrients and diet",
            ]}
            speed={75}
            omitDeletionAnimation={true}
            style={{
              fontSize: "1em",
              whiteSpace: "pre-line",
              display: "block",
              minHeight: "120px",
            }}
            repeat={1}
          />

          <Button
            variant="secondary"
            className="mx-auto flex h-12 items-center gap-1 p-5 text-xl shadow-lg"
            onClick={() => setHasSeenAiFirstPage(true)}
          >
            <AiLineIcon className="size-5 shrink-0" />
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Introduction;

const introData = [
  {
    icon: <DishIcon className="size-7" />,
    text: "Get recipes based on your ingredients & add nutrients to your profile",
    color: "secondary",
    griSpan: "1",
  },
  {
    icon: <ChartHistogramIcon className="size-7" />,
    text: "Get nutrients of the meals you’ve had & add it to your profile",
    color: "primary",
    griSpan: "1",
  },
  {
    icon: <WaterOutlineIcon className="size-7" />,
    text: "log your daily water intake and stay on top of your hydration goals",
    color: "thirdColor",
    griSpan: "2",
  },
];
