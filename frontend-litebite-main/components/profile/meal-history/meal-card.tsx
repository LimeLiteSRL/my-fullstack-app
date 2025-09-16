/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import React, { useState } from "react";
import { cn, shortenString } from "@/libs/utils";
import { Button } from "@/components/ui/button";
import {
  IMeal,
  INutritionalInformation,
} from "@/libs/endpoints/meals/meals-schema";
import DietaryPreferenceItems from "@/components/meals/dietary-preferences-items";
import Link from "next/link";
import { Routes } from "@/libs/routes";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Item } from "@radix-ui/react-dropdown-menu";
import { usersHook } from "@/libs/endpoints/users/users-endpoints";
import { toast } from "sonner";
import { queryClient } from "@/libs/query-client";
import { AiLineIcon, FoodIcon } from "@/components/icons/icons";

const MealCard = ({
  isApp = false,
  meal,
  eatenFoodId,
  foodName,
  nutritionalInformation,
}: {
  isApp?: boolean;
  meal?: IMeal | null;
  eatenFoodId: string;
  foodName?: string;
  nutritionalInformation?: INutritionalInformation;
}) => {
  const [selectedId, setSelectedId] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const handleOpenDialog = (id: string) => {
    setIsOpen(true);
    setSelectedId(id);
  };

  const mealDetails = [
    {
      title: "Kcal",
      value: (nutritionalInformation?.caloriesKcal || 0).toFixed(2),
    },
    {
      title: "Carb",
      value: (nutritionalInformation?.totalCarbsGrams || 0).toFixed(2),
    },
    {
      title: "Fat",
      value: (nutritionalInformation?.totalFatGrams || 0).toFixed(2),
    },
    {
      title: "Sugar",
      value: (nutritionalInformation?.sugarsGrams || 0).toFixed(2),
    },
  ];

  return (
    <>
      <div className="mx-auto flex min-h-[150px] w-full items-center justify-center rounded-3xl bg-white p-4 shadow-4xl">
        <div className="flex w-full gap-3">
          {isApp ? (
            <Link
              href={{
                pathname: Routes.Meals,
                query: { id: meal?._id },
              }}
              className="shrink-0S block"
            >
              <div className="flex h-[130px] w-[130px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-offWhite">
                {meal?.image ? (
                  <img
                    className="h-full max-w-full object-cover"
                    alt="food"
                    src={meal?.image || ""}
                  />
                ) : (
                  <FoodIcon className="size-8" />
                )}
              </div>
            </Link>
          ) : (
            <div className="flex size-[80px] items-center justify-center rounded-full bg-light">
              <AiLineIcon className="size-8" />
            </div>
          )}
          <div className="flex flex-1 flex-col justify-between">
            <div className="flex items-start gap-1">
              {isApp ? (
                <Link
                  href={{
                    pathname: Routes.Meals,
                    query: { id: meal?._id },
                  }}
                  className="text-base font-medium leading-snug"
                >
                  {shortenString(meal?.name || "", 35)}
                </Link>
              ) : (
                <div className="text-base font-medium leading-snug">
                  {shortenString(foodName || "", 35)}
                </div>
              )}
            </div>
            {!isApp && (
              <div className="my-3 flex items-center justify-center gap-2">
                {mealDetails.map((detail) => (
                  <div
                    key={detail.title}
                    className="flex-1 rounded-xl p-2 text-center shadow-4xl"
                  >
                    <div className="text-xs font-medium">{detail.value}</div>
                    <div className="text-xs">{detail.title}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-1 sm:flex-row">
              {meal?.dietaryPreferences && isApp && (
                <div className="flex items-center gap-2 text-softText">
                  <DietaryPreferenceItems
                    dietaryPreferences={meal?.dietaryPreferences}
                    iconSize={5}
                  />
                </div>
              )}
              {isApp && (
                <div className="flex items-center gap-1">
                  {mealDetails.slice(0, 3).map((detail, index) => (
                    <div key={detail.title} className="flex items-center gap-1">
                      <span
                        className={cn(
                          "text-xs !font-light text-heavy",
                          index === 0 && "hidden sm:block",
                        )}
                      >
                        |
                      </span>
                      <div className="shrink-0 text-xs text-heavy">
                        {(+detail.value).toFixed(0)} {detail?.title}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2">
              <Button
                className={cn("w-full")}
                variant="outline"
                onClick={() => handleOpenDialog(eatenFoodId)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
      <DeleteMealDialog
        isOpen={isOpen}
        mealId={selectedId}
        setIsOpen={setIsOpen}
      />
    </>
  );
};

export default MealCard;

const DeleteMealDialog = ({
  isOpen,
  setIsOpen,
  mealId,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  mealId: string;
}) => {
  const deleteFoodMutation = usersHook.useDeleteFoodMutation({
    params: {
      eatenFoodId: mealId,
    },
  });

  const handleDelete = () => {
    deleteFoodMutation.mutate(undefined, {
      onError: (e: any) => {
        toast.error("Somethings went wrong.");
      },
      onSuccess: (response) => {
        toast.success("The meal deleted successfully.");
        setIsOpen(false);
        queryClient.invalidateQueries(
          usersHook.getKeyByAlias("queryEatenMeals"),
        );
      },
    });
  };

  return (
    <ResponsiveDialog open={isOpen} setOpen={setIsOpen} title="Delete the meal">
      <div className="space-y-3">
        <div>Are you sure About this?</div>
        <div className="flex items-center justify-between gap-4">
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
};
