/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useRef, useState } from "react";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "../ui/carousel";
import { cn } from "@/libs/utils";

type ISteps = "SEND_CODE" | "CHECK_CODE";

const IntroCarousel = ({ currentStep }: { currentStep: ISteps }) => {
  const [api, setApi] = React.useState<CarouselApi>();

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  useEffect(() => {
    const stepIndex = stepItems.findIndex((item) => item.step === currentStep);
    if (stepIndex !== -1 && api) {
      api.scrollTo(stepIndex);
    }
  }, [currentStep, api]);

  return (
    <div>
      <div className="my-4 overflow-hidden rounded-2xl bg-thirdColor p-4 pb-0">
        <Carousel
          setApi={setApi}
          //   plugins={[plugin.current]}
          opts={{
            align: "center",
            loop: false,
          }}
        >
          <CarouselContent>
            {stepItems.map((item, index) => {
              return <CarouselItem key={index}>{item.content}</CarouselItem>;
            })}
          </CarouselContent>
        </Carousel>
      </div>
      <div className="flex items-center justify-center gap-2">
        {stepItems.map((_, index) => (
          <button
            key={index}
            onClick={() => api && api.scrollTo(index)}
            className={cn(
              "size-3 rounded-full",
              current === index + 1 ? "bg-primary" : "bg-offWhite",
            )}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default IntroCarousel;

const stepItems = [
  {
    step: "SEND_CODE",
    content: (
      <div className="flex h-full w-full flex-col justify-between">
        <p className="text-sm font-semibold">
          Use your AI assistant to get personalized recipes and nutrient
        </p>
        <div className="mt-2 flex w-full items-center justify-center gap-4">
          <div>
            <img
              src="./images/ai-chat-intro.svg"
              alt="ai-chat-intro"
              className="max-w-full"
            />
          </div>
          <div>
            <img
              src="./images/ai-chat-intro2.svg"
              alt="ai-chat-intro"
              className="max-w-full"
            />
          </div>
        </div>
      </div>
    ),
  },
  {
    step: "CHECK_CODE",
    content: (
      <div className="flex h-full w-full flex-col justify-between">
        <p className="text-sm font-semibold">
          Track your nutrients daily, weekly, monthly!
        </p>
        <div className="mt-2 flex w-full items-center justify-center gap-4">
          <div>
            <img
              src="./images/profile.svg"
              alt="ai-chat-intro"
              className="max-w-full"
            />
          </div>
          <div>
            <img
              src="./images/profile2.svg"
              alt="ai-chat-intro"
              className="max-w-full"
            />
          </div>
        </div>
      </div>
    ),
  },
];
