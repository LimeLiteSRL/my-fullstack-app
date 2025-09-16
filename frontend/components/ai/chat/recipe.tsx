import { Button } from "@/components/ui/button";
import { usersHook } from "@/libs/endpoints/users/users-endpoints";
import { isAxiosError } from "axios";
import { toast } from "sonner";

type NutritionInfo = {
  caloriesKcal?: number;
  totalFatGrams?: number;
  saturatedFatGrams?: number;
  totalCarbsGrams?: number;
  sugarsGrams?: number;
  dietaryFiberGrams?: number;
  proteinGrams?: number;
  sodiumMg?: number;
  cholesterolMg?: number;
  potassiumMg?: number;
  vitaminAMg?: number;
  vitaminCMg?: number;
  calciumMg?: number;
  ironMg?: number;
  polyunsaturatedFatGrams?: number;
  transFatGrams?: number;
  monounsaturatedFatGrams?: number;
};

export default function RecipeInfo({
  nutritionInfo,
  foodItem,
}: {
  nutritionInfo: NutritionInfo | undefined;
  foodItem: string;
}) {
  const addToProfileMutation = usersHook.useAddToProfileAiMutation();

  const handleAddToProfile = () => {
    addToProfileMutation.mutate(
      {
        foodName: foodItem,
        portionSize: 1,
        nutritionalInformation: nutritionInfo,
      },
      {
        onError: (error: any) => {
          // Check if it's an Axios error
          if (isAxiosError(error)) {
            const statusCode = error.response?.status;

            if (statusCode === 401) {
              toast.error("Unauthorized: Please log in.");
            } else if (statusCode === 400) {
              toast.error("Bad request: Please check your input.");
            } else {
              toast.error(`Request failed with status code ${statusCode}`);
            }
          } else {
            toast.error("An unknown error occurred");
          }
        },
        onSuccess: () => {
          toast.success(
            "Meal added! 🍽️ Check your profile for an overview of your eating habits.",
          );
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-full overflow-hidden rounded-lg bg-white p-4 text-sm shadow-sm sm:max-w-sm">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100">
            <th
              colSpan={2}
              className="px-3 py-2 text-left text-base font-semibold text-gray-800"
            >
              Nutritional Info of {foodItem}
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(nutritionInfo || {}).map(([key, value]) => (
            <tr key={key} className="border-b border-gray-100 last:border-b-0">
              <td className="px-3 py-1.5 text-gray-600">{formatLabel(key)}</td>
              <td className="px-3 py-1.5 text-right font-medium text-gray-800">
                {formatValue(key, value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button
        isLoading={addToProfileMutation.isLoading}
        onClick={handleAddToProfile}
        size="sm"
        className="w-full"
      >
        Save To Profile
      </Button>
    </div>
  );
}

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/Kcal/i, "")
    .replace(/Mg/i, "")
    .replace(/Grams/i, "")
    .trim();
}

function formatValue(key: string, value: number): string {
  if (key.toLowerCase().includes("kcal")) {
    return `${value} kcal`;
  } else if (key.toLowerCase().includes("mg")) {
    return `${value} mg`;
  } else {
    return `${value} g`;
  }
}
