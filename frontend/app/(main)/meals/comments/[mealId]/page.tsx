"use client";

import { ArrowLeftIcon, SendFillIcon } from "@/components/icons/icons";
import MealCard from "@/components/meals/meal-card";
import CommentDetailsCard from "@/components/meals/rating-review/comment-details-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { mealsHook } from "@/libs/endpoints/meals/meals-endpoints";
import { IReviewDTO, ISingleMeal } from "@/libs/endpoints/meals/meals-schema";
import { usersHook } from "@/libs/endpoints/users/users-endpoints";
import { Routes } from "@/libs/routes";
import useProfileStore from "@/libs/store/profile-store";
import { cn, mapMealToISingleMeal, timezoneOffset } from "@/libs/utils";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";


export default function Page({ params }: { params: { mealId: string } }) {
  const { mealId } = params;
  const router = useRouter();
  const [singleMeal, setSingleMeal] = useState<ISingleMeal>();
  const [input, setInput] = useState("");
  const [comments, setComments] = useState<IReviewDTO[]>();
  const { user } = useProfileStore();
  const { data, isLoading } = mealsHook.useQuerySingleMeal({
    params: {
      id: mealId,
    },
  });
  const { data: restaurant } = mealsHook.useQueryRestaurantsOfMeal({
    params: {
      foodId: mealId,
    },
  });

  const { data: reviews, isLoading: reviewsLoading } =
    mealsHook.useQueryMealReview({
      params: {
        foodId: mealId,
      },
    });
  const { data: profile } = usersHook.useQueryUserProfile({
    queries: {
      timezoneOffset: timezoneOffset(),
    },
  });
  const ratingMutation = usersHook.useRatingMutation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const mealDetails = data?.data;
    if (mealDetails) {
      const result = mapMealToISingleMeal(mealDetails, restaurant?.data?.[0]);
      setSingleMeal(result);
    }
  }, [data?.data, restaurant?.data]);

  useEffect(() => {
    if (reviews?.data) {
      setComments(reviews?.data);
    }
  }, [reviews?.data]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  const handleSubmit = () => {
    if (!input) return;
    ratingMutation.mutate(
      {
        foodId: mealId,
        comment: input,
      },
      {
        onError: (error) => {
          toast.error("Somethings went wrong.");
        },
        onSuccess: () => {
          // toast.success("Your comment was successfully added.");
          setComments((prev) =>
            prev
              ? [
                  ...prev,
                  {
                    comment: input,
                    user: profile?.user._id,
                  },
                ]
              : undefined,
          );
          setInput("");
        },
      },
    );
  };

  return (
    <div className="relative min-h-full p-4 pb-20 pt-52">
      <div className="absolute start-1/2 top-0 w-[95%] -translate-x-1/2">
        <div className="m-3">
          <button
            onClick={() => router.back()}
            className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-white"
          >
            <ArrowLeftIcon className="size-5" />
          </button>
        </div>
        {!isLoading && singleMeal ? (
          <MealCard
            className="w-full"
            meal={singleMeal}
            handleMealClicked={() =>
              router.push(Routes.Meals + `?id=${mealId}`)
            }
          />
        ) : (
          <MealCard isLoading />
        )}
      </div>
      <div className="mt-6">
        <div className="flex items-center gap-2">
          <div className="hidden font-medium sm:block">What people say</div>
          <div className="text-xs text-heavy">
            {data?.data.reviewSummary?.totalComments || 0} comments
          </div>
        </div>
      </div>

      <div className="my-4 flex h-full w-full flex-col gap-4 overflow-auto">
        {reviewsLoading ? (
          <div className="flex w-full flex-col gap-4">
            <div className="w-full">
              <Skeleton className="h-[100px] w-[350px] rounded-lg"></Skeleton>
            </div>
            <div className="flex w-full justify-end">
              <Skeleton className="h-[100px] w-[350px] rounded-lg"></Skeleton>
            </div>
          </div>
        ) : (
          comments?.map((comment, index) => {
            return (
              comment.comment && (
                <div
                  className={cn(
                    "flex w-full",
                    comment.user === profile?.user?._id
                      ? "justify-end"
                      : "justify-start",
                  )}
                  key={comment._id || "" + index}
                >
                  <CommentDetailsCard
                    comment={{
                      comment: comment.comment,
                      healthRate: comment.healthRating,
                      tasteRate: comment.tasteRating,
                      userName: comment.userName,
                    }}
                    rtl={comment.user === profile?.user?._id}
                  />
                </div>
              )
            );
          })
        )}
      </div>
      <div className="absolute bottom-0 start-1/2 z-20 flex h-20 w-[90%] -translate-x-1/2 flex-col justify-center">
        <div className="flex items-end justify-between overflow-hidden rounded-2xl border bg-white p-2">
          <Textarea
            ref={textareaRef}
            placeholder="Add your comment"
            value={input}
            onChange={handleInput}
            className="min-h-[27px] resize-none border-none p-0 text-base font-light outline-none !ring-0"
            rows={1}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSubmit();
              }
            }}
          />

          <Button
            className="h-fit rounded-full bg-offWhite p-1.5"
            onClick={handleSubmit}
            disabled={input.length < 3}
          >
            <SendFillIcon className="size-5 text-secondary" />
          </Button>
        </div>
      </div>
    </div>
  );
}
