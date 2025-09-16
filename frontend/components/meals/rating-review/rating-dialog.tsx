"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Slider } from "../../ui/slider";
import { Button } from "../../ui/button";
import TasteRate from "./taste-rate";
import HealthRate from "./healthy-review";
import MealReviewComponents from "./review-comments-carousel";
import { usersHook } from "@/libs/endpoints/users/users-endpoints";
import { mealsHook } from "@/libs/endpoints/meals/meals-endpoints";
import { toast } from "sonner";

import { queryClient } from "@/libs/query-client";
import { useRouter } from "next/navigation";
import { Routes } from "@/libs/routes";

const RatingDialog = ({
  isOpen,
  setIsOpen,
  foodId,
  refetch,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  foodId: string;
  refetch?: () => void;
}) => {
  const router = useRouter();
  const { data } = mealsHook.useQuerySingleMeal({
    params: {
      id: foodId || "",
    },
  });
  const meal = data?.data;
  const [healthRate, setHealthRate] = useState(
    meal?.reviewSummary?.averageHealthRating || 0,
  );
  const [tasteRate, setTasteRate] = useState(meal?.tasteRating || 0);
  const ratingMutation = usersHook.useRatingMutation();

  const handleSubmit = () => {
    ratingMutation.mutate(
      {
        foodId,
        healthRating: healthRate,
        tasteRating: tasteRate,
      },
      {
        onError: (error) => {
          setIsOpen(false);
          toast.error("Somethings went wrong.");
        },
        onSuccess: () => {
          setIsOpen(false);
          toast.success("Your rate was successfully added.");
          refetch && refetch();
        },
      },
    );
  };

  useEffect(() => {
    if (meal) {
      setHealthRate(meal?.reviewSummary?.averageHealthRating || 0);
      setTasteRate(meal?.reviewSummary?.averageTasteRating || 0);
    }
  }, [meal, isOpen]);
  const totalReview = (meal?.reviewSummary?.totalReviews || 0).toFixed(0);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="block w-[95%] overflow-hidden rounded-3xl">
        <DialogHeader>
          <div className="mb-6 text-start">
            <DialogTitle className="text-lg font-bold">
              Ratings and Reviews
            </DialogTitle>
          </div>
        </DialogHeader>
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="font-medium">All ratings </span>
              <span className="text-heavy">({totalReview})</span>
            </div>
            <div className="flex items-center gap-2 text-heavy">
              <TasteRate rate={meal?.reviewSummary?.averageTasteRating || 0} />
              <HealthRate
                rate={meal?.reviewSummary?.averageHealthRating || 0}
              />
            </div>
          </div>
          <div className="rounded-2xl border border-offWhite p-4">
            <div>
              <div>How did it taste?</div>
              <div className="text-xs text-heavy">
                Rate how much you enjoyed this meal’s flavor.
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <Slider
                  defaultValue={[tasteRate]}
                  max={5}
                  min={0}
                  step={1}
                  className="w-full"
                  onValueChange={(val) => setTasteRate(+val)}
                />
                <TasteRate rate={tasteRate} />
              </div>
            </div>

            <div className="mt-4">
              <div>How healthy is it?</div>
              <div className="text-xs text-heavy">
                Rate how healthy you believe this meal is.
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <Slider
                  defaultValue={[healthRate]}
                  max={5}
                  min={0}
                  step={1}
                  className="w-full"
                  onValueChange={(val) => setHealthRate(+val)}
                />
                <HealthRate rate={healthRate} />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              variant="secondary"
              className="mt-4 w-full"
            >
              Submit your vote
            </Button>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="hidden font-medium sm:block">
                  What people say
                </div>
                <div className="text-xs text-heavy">
                  {meal?.reviewSummary?.totalComments || 0} comments
                </div>
              </div>
              <Button
                variant="pale"
                onClick={() =>
                  router.push(Routes.Meals + Routes.Comments + `/${meal?._id}`)
                }
              >
                View Comments
              </Button>
            </div>
            {/* <MealReviewComponents /> */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RatingDialog;
