/* eslint-disable @next/next/no-img-element */
import CaloriesChart from "@/components/compare/calories-chart";
import DietaryPreferenceItems from "@/components/meals/dietary-preferences-items";
import HealthRate from "@/components/meals/rating-review/healthy-review";
import TasteRate from "@/components/meals/rating-review/taste-rate";
import { Button } from "@/components/ui/button";
import { mealsHook } from "@/libs/endpoints/meals/meals-endpoints";
import { IMeal } from "@/libs/endpoints/meals/meals-schema";
import useAddToProfile from "@/libs/hooks/use-add-to-profile";
import { Routes } from "@/libs/routes";
import { fixPrice, removeParentheses, shortenString } from "@/libs/utils";
import Link from "next/link";

const CompareDetailsMeal = ({
  data,
  isTargetMeal = false,
}: {
  data: IMeal | undefined;
  isTargetMeal?: boolean;
}) => {
  const { handleAddToProfile } = useAddToProfile();
  const { data: restaurant } = mealsHook.useQueryRestaurantsOfMeal({
    params: {
      foodId: data?._id || "",
    },
  });
  const mealRestaurant = restaurant?.data?.[0];

  return (
    <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-2">
      <Link
        href={{
          pathname: Routes.Restaurants,
          query: `id=${mealRestaurant?._id}`,
        }}
        className="flex items-center gap-1"
      >
        <div className="size-7 overflow-hidden rounded-full border border-neutral-800">
          <img
            alt="logo"
            src={
              mealRestaurant?.logo
                ? mealRestaurant?.logo
                : "/images/restaurant.jpg"
            }
            className="h-full max-w-full object-cover"
          />
        </div>
        <div className="text-sm text-heavy">
          {shortenString(
            removeParentheses(mealRestaurant?.name || "") || "",
            20,
          )}
        </div>
      </Link>
      <div className="my-auto h-[122px] w-[122px] shrink-0 overflow-hidden rounded-xl">
        <img
          className="h-full w-full object-cover"
          alt="food"
          src={data?.image ? data?.image : "/images/food2.jpg"}
          width={150}
          height={150}
        />
      </div>

      <div className="flex items-center gap-2">
        <TasteRate iconSize={4} rate={data?.tasteRating || 0} />
        <HealthRate iconSize={4} rate={data?.healthRating || 0} />
      </div>

      {data?.dietaryPreferences && (
        <DietaryPreferenceItems
          dietaryPreferences={data?.dietaryPreferences}
          className="max-w-[170px] flex-wrap justify-center"
          iconSize={5}
        />
      )}
      <div className="min-h-[50px] text-center font-medium text-titleColor">
        {shortenString(data?.name || "", 40)}
      </div>
      <div>
        <div className="text-center text-base font-bold">
          ${fixPrice(data?.price)}
        </div>
        <Button
          onClick={() => handleAddToProfile(data?._id || "")}
          className="mt-2"
          variant={isTargetMeal ? "pale" : "secondary"}
        >
          Add to profile
        </Button>
      </div>
      <CaloriesChart
        calories={data?.nutritionalInformation?.caloriesKcal}
        color={isTargetMeal ? "#D1D4FF" : "#4E56D3"}
      />
    </div>
  );
};

export default CompareDetailsMeal;
