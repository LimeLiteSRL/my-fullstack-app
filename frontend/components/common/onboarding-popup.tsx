/* eslint-disable @next/next/no-img-element */
import React, { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import useUiStore from "@/libs/store/ui-store";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "../ui/carousel";
import { cn } from "@/libs/utils";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import useFilterStore from "@/libs/store/filters-store";
import { Routes } from "@/libs/routes";
import Link from "next/link";
import { toast } from "sonner";

const OnboardingPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [showCookiesPopupC, setShowCookiesPopup] = useState(false);
  const { isFirstVisit, setIsFirstVisit, isCookieConsent, setIsCookieConsent } =
    useUiStore();
  const [currentStep, setCurrentStep] = useState<ISteps>("first");
  const { setIsFilterVisible } = useFilterStore();

  useEffect(() => {
    if (isFirstVisit) {
      setShowPopup(true);
    }
  }, [isFirstVisit]);

  const handleAccept = useCallback(() => {
    setIsCookieConsent(true);
    setIsFirstVisit(false);
    setIsFilterVisible(true);
    toast.dismiss();
  }, [setIsCookieConsent, setIsFirstVisit, setIsFilterVisible]);

  useEffect(() => {
    if (isFirstVisit && !isCookieConsent && showCookiesPopupC) {
      toast(
        <div className="space-y-1">
          <p>
            By clicking &ldquo;Accept&ldquo;, you agree to our use of cookies
            for analytics and personalization. You can learn more in our
            <Link href={Routes.Privacy} className="text-blue-600">
              {" "}
              Privacy Policy.
            </Link>
          </p>
          <div className="mt-3 flex w-full flex-col items-center gap-2">
            <button
              className="w-full shrink-0 rounded border border-neutral-500 p-2 text-neutral-900"
              onClick={handleAccept}
            >
              Only Necessary Cookies
            </button>
            <button
              onClick={handleAccept}
              className="w-full shrink-0 rounded bg-neutral-900 p-2 text-offWhite"
            >
              Accept All Cookies
            </button>
          </div>
        </div>,
        {
          closeButton: false,
          position: "bottom-center",
          duration: Infinity,
          id: 1,
        },
      );
    }
  }, [showCookiesPopupC, isCookieConsent, isFirstVisit, handleAccept]);

  const handleClose = () => {
    setShowCookiesPopup(true);
    setShowPopup(false);
    // setIsFilterVisible(true);
  };
  const handleClick = () => {
    if (currentStep === "first") {
      setCurrentStep("second");
    } else {
      handleClose();
    }
  };
  return (
    <Dialog open={showPopup}>
      <DialogContent
        className="max-w-[370px] !rounded-3xl p-0"
        closeClassName="hidden"
      >
        <button
          onClick={handleClose}
          className="text-gray absolute right-4 top-4 z-50 cursor-pointer rounded-full bg-white p-2 opacity-100 shadow-md"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        <div>
          <IntroCarousel
            setCurrentStep={setCurrentStep}
            currentStep={currentStep}
          />
          <div className="p-4">
            {stepItems.find((step) => step.step === currentStep)?.description}
            <Button
              onClick={handleClick}
              variant="secondary"
              className="mt-3 w-full"
            >
              {currentStep === "first" ? "Next" : "Get Started"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingPopup;

type ISteps = "first" | "second";

const IntroCarousel = ({
  currentStep,
  setCurrentStep,
}: {
  currentStep: ISteps;
  setCurrentStep: (val: ISteps) => void;
}) => {
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
    setCurrentStep(
      current === 1 ? "first" : current === 2 ? "second" : "first",
    );
  }, [current, setCurrentStep]);

  useEffect(() => {
    const stepIndex = stepItems.findIndex((item) => item.step === currentStep);
    if (stepIndex !== -1 && api) {
      api.scrollTo(stepIndex);
    }
  }, [currentStep, api]);

  return (
    <div>
      <div className="mb-3 overflow-hidden rounded-3xl pb-0">
        <Carousel
          setApi={setApi}
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
      <div>{}</div>
    </div>
  );
};

const stepItems = [
  {
    step: "first",
    content: (
      <div className="flex h-full w-full flex-col justify-between">
        <div>
          <img
            src="./images/onboarding.svg"
            alt="ai-chat-intro"
            className="max-w-full"
          />
        </div>
      </div>
    ),
    description: (
      <div className="space-y-2 text-center">
        <h2 className="min-h-12 font-semibold">
          Discover meals in restaurants nearby made for you
        </h2>
        <p className="text-sm font-light">
          Filter meals by diet, allergies, and calories that suit your unique
          needs.
        </p>
      </div>
    ),
  },
  {
    step: "second",
    content: (
      <div className="flex h-full w-full flex-col justify-between bg-thirdColor p-6 pb-0">
        <p className="text-xl font-semibold">AI assistant </p>
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
    description: (
      <div className="text-center">
        <h2 className="min-h-12 font-semibold">Your AI nutrition buddy</h2>
        <p className="text-sm font-light">
          Log your meals, get personalized recipes, and track your water intake
          effortlessly.
        </p>
      </div>
    ),
  },
];
