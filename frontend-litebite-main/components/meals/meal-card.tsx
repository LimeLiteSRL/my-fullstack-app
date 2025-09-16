/* eslint-disable @next/next/no-img-element */
import React, { memo } from "react";
import { cn, shortenString } from "@/libs/utils";
import { ISingleMeal } from "@/libs/endpoints/meals/meals-schema";
import DietaryPreferenceItems from "./dietary-preferences-items";
import { BookmarkCheckIcon, FoodIcon } from "../icons/icons";
import TasteRate from "./rating-review/taste-rate";
import HealthRate from "./rating-review/healthy-review";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { Routes } from "@/libs/routes";
import Spinner from "../spinner";
import { queryClient } from "@/libs/query-client";
import { usersHook } from "@/libs/endpoints/users/users-endpoints";
import useAddToProfile from "@/libs/hooks/use-add-to-profile";
import { Skeleton } from "../ui/skeleton";
import { UBER_EATS_URL } from "@/config";
import { toast } from "sonner";

interface ICommonProps {
  handleMealClicked?: () => void;
  isMarked?: boolean;
  className?: string;
}
interface IMealRequired extends ICommonProps {
  meal: ISingleMeal;
  isLoading?: boolean;
}
interface IMealLoading extends ICommonProps {
  meal?: ISingleMeal;
  isLoading: boolean;
}

type IProps = IMealRequired | IMealLoading;

interface IVariant {
  variant?: "vertical" | "small" | "fullDetails" | "default";
}

interface IActions {
  verticalButtonText?: string;
  verticalButtonAction?: (mealId: string) => void;
  actionButtonText?: string;
  actionButton?: (mealId: string) => void;
}

const MealCard = memo(function MealCard({
  handleMealClicked,
  meal,
  isMarked,
  verticalButtonText,
  verticalButtonAction,
  actionButton,
  actionButtonText,
  className,
  variant = "default",
  isLoading,
}: IProps & IVariant & IActions) {
  const small = variant === "small";
  const vertical = variant === "vertical";
  const fullDetails = variant === "fullDetails";
  const mealDetails = [
    {
      title: "Kcal",
      value: (meal?.nutritionalInformation?.caloriesKcal || 0).toFixed(2),
    },
    {
      title: "Carb",
      value: (meal?.nutritionalInformation?.totalCarbsGrams || 0).toFixed(2),
    },
    {
      title: "Port",
      value: (meal?.nutritionalInformation?.proteinGrams || 0).toFixed(2),
    },
    {
      title: "Fat",
      value: (meal?.nutritionalInformation?.totalFatGrams || 0).toFixed(2),
    },
  ];

  if (isLoading)
    return (
      <LoadingSkeleton
        small={small}
        vertical={vertical}
        fullDetails={fullDetails}
        className={className}
      />
    );

  return (
    <ButtonWrapper
      type={fullDetails || vertical || actionButton ? "div" : "button"}
      handleMealClicked={handleMealClicked}
      className={className}
    >
      <div
        className={cn(
          "mx-auto flex h-[140px] items-center justify-center overflow-hidden rounded-3xl bg-white p-3",
          small && "h-[100px] shadow-4xl",
          vertical && "h-[290px]",
          fullDetails && "min-h-[200px] flex-col",
        )}
      >
        <div
          className={cn(
            "flex w-full gap-3",
            vertical && "h-full flex-col justify-between",
          )}
        >
          <ButtonWrapper
            mealId={meal?.id}
            type={fullDetails || vertical || actionButton ? "link" : "fragment"}
          >
            <div
              className={cn(
                "relative my-auto h-[110px] w-[110px] shrink-0 overflow-hidden rounded-xl",
                small && "size-[70px]",
                vertical && "h-[130px] w-full",
                !meal?.image && "flex items-center justify-center bg-offWhite",
              )}
            >
              {isMarked && (
                <div className="absolute end-0 top-0 flex size-5 items-center justify-center rounded-full bg-secondary text-white">
                  <BookmarkCheckIcon />
                </div>
              )}
              {!meal?.image ? (
                <FoodIcon className="size-7" />
              ) : (
                <img
                  className="h-full w-full object-cover"
                  alt="food"
                  src={meal?.image || ""}
                />
              )}
            </div>
          </ButtonWrapper>

          <div className="flex w-full flex-col gap-1">
            <div className="flex w-full items-start justify-between gap-1">
              <ButtonWrapper
                mealId={meal?.id}
                type={
                  fullDetails || vertical || actionButton ? "link" : "fragment"
                }
              >
                <span className="overflow-hidden text-sm font-medium leading-snug">
                  {shortenString(meal?.name || "", 35)}
                </span>
              </ButtonWrapper>
              {!vertical && !actionButton && (
                <div className="rounded-full px-1 py-px text-xs font-semibold">
                  ${meal?.price}
                </div>
              )}
            </div>

            {!small && !actionButton && !fullDetails && (
              <div className="text-xs font-light text-heavy">
                {shortenString(meal?.restaurant.name || "", 25)}
              </div>
            )}

            <div
              className={cn(
                "flex w-full flex-col gap-1",
                (fullDetails || small) &&
                  "flex-row-reverse items-center justify-end",
              )}
            >
              <div className="flex items-center gap-1 text-xs text-heavy">
                {!fullDetails && (
                  <>
                    <div className="shrink-0 text-xs text-heavy">
                      {meal?.calories} Kcal
                    </div>{" "}
                    <span className="!font-light">|</span>
                  </>
                )}
                {meal?.dietaryPreferences && (
                  <div className="w-full overflow-auto">
                    <DietaryPreferenceItems
                      dietaryPreferences={meal.dietaryPreferences}
                      iconSize={4}
                      className="gap-1"
                    />
                  </div>
                )}
              </div>
              {(small || fullDetails) && (
                <span className="text-xs !font-light text-heavy">|</span>
              )}

              {!vertical && !actionButton && (
                <div className="flex items-center gap-2">
                  <TasteRate iconSize={4} rate={meal?.tasteRating || 0} />
                  <HealthRate iconSize={4} rate={meal?.healthRating || 0} />
                </div>
              )}
            </div>
            {fullDetails && (
              <div className="mt-1 flex items-center justify-center gap-1 font-light">
                {mealDetails.map((detail) => (
                  <div
                    key={detail.title}
                    className="flex-1 rounded-xl p-2 text-center shadow-4xl"
                  >
                    <div className="text-xs">
                      {(+detail.value || 0).toFixed(0)}
                    </div>
                    <div className="text-xs">{detail.title}</div>
                  </div>
                ))}
              </div>
            )}
            {actionButton && actionButtonText && (
              <Button
                onClick={() => actionButton(meal?.id || "")}
                size="sm"
                variant="outline"
              >
                {actionButtonText}
              </Button>
            )}
            {vertical && verticalButtonAction && (
              <Button
                onClick={() => verticalButtonAction(meal?.id || "")}
                size="sm"
                variant="outline"
              >
                {verticalButtonText}
              </Button>
            )}
          </div>
        </div>
        {fullDetails && (
          <FullDetailActions
            mealLink={meal?.link || ""}
            isMarked={isMarked}
            mealId={meal?.id || ""}
          />
        )}
      </div>
    </ButtonWrapper>
  );
});

export default MealCard;

const ButtonWrapper = ({
  children,
  type,
  handleMealClicked,
  mealId,
  className,
}: {
  children: React.ReactNode;
  type: "div" | "button" | "link" | "fragment";
  handleMealClicked?: () => void;
  mealId?: string;
  className?: string;
}) => {
  if (type === "div")
    return (
      <div className={cn("w-[370px] text-start", className)}>{children}</div>
    );
  if (type === "fragment") return <>{children}</>;
  if (type === "link")
    return (
      <Link
        href={{
          pathname: Routes.Meals,
          query: `id=${mealId}`,
        }}
      >
        {children}
      </Link>
    );
  if (type === "button")
    return (
      <button
        onClick={handleMealClicked}
        className={cn("w-[370px] text-start", className)}
      >
        {children}
      </button>
    );
};

const FullDetailActions = ({
  isMarked,
  mealId,
  mealLink,
}: {
  isMarked?: boolean;
  mealId: string;
  mealLink: string;
}) => {
  const { handleAddToProfile, isLoading, isSuccess } = useAddToProfile();

  const handleSuccessAddToProfile = () => {
    queryClient.invalidateQueries(usersHook.getKeyByAlias("queryEatenMeals"));
  };

  return (
    <div className="mt-2 flex w-full items-center justify-between gap-2">
      {isMarked ? (
        <motion.div
          className="flex-1"
          key="order"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -25 }}
          transition={{ duration: 0.5 }}
        >
          <Button asChild className="w-full text-xs" variant="pale">
            <Link href={UBER_EATS_URL + mealLink} target="_blank">
              Order on
              <span className="ms-2 flex flex-col items-start font-semibold leading-tight">
                <span className="text-black">Uber</span>
                <span className="text-[#00C444]">Eats</span>
              </span>
            </Link>
          </Button>
        </motion.div>
      ) : (
        <motion.div
          className="flex-1"
          key="compare"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -25 }}
          transition={{ duration: 0.5 }}
        >
          <Button asChild className="w-full text-xs" variant="outline">
            <Link
              href={{
                pathname: Routes.Compare,
                query: { id: mealId },
              }}
            >
              Compare
            </Link>
          </Button>
        </motion.div>
      )}
      <Button
        onClick={() =>
          handleAddToProfile(mealId || "", 1, handleSuccessAddToProfile)
        }
        variant="secondary"
        className="flex-1 !text-xs"
        disabled={isLoading}
      >
        {isLoading ? (
          <Spinner className="size-6 fill-neutral-100/70 text-neutral-100/30" />
        ) : (
          "Add to profile"
        )}
      </Button>
    </div>
  );
};

const LoadingSkeleton = ({
  small,
  vertical,
  fullDetails,
  className,
}: {
  small: boolean;
  vertical: boolean;
  fullDetails: boolean;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "mx-auto flex h-[150px] items-center gap-3 overflow-hidden rounded-3xl bg-white p-3 shadow-4xl",
        small && "h-[100px] shadow-4xl",
        vertical && "h-[290px] w-[190px] flex-col",
        className,
      )}
    >
      <Skeleton
        className={cn(
          "relative my-auto size-[120px] shrink-0 overflow-hidden rounded-xl",
          small && "size-[70px]",
          vertical && "my-0 w-full",
        )}
      />
      <div className={cn("flex-1 space-y-2", vertical && "w-full")}>
        <Skeleton className={cn("h-7 w-[165px] rounded-lg")} />
        {<Skeleton className="h-3 w-[120px] rounded-xl" />}
        {!small && (
          <>
            <div className="flex items-center gap-2">
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="size-5 rounded-full" />
            </div>
            <Skeleton
              className={cn("h-8 w-full rounded-full", vertical && "!mt-7")}
            />
          </>
        )}
      </div>
    </div>
  );
};
