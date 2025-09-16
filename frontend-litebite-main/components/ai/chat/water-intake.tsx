import { PlusSignIcon } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import { usersHook } from "@/libs/endpoints/users/users-endpoints";
import { toast } from "sonner";

export default function WaterIntake({ amountMl }: { amountMl: number }) {
  const addWaterIntakeMutation = usersHook.useAddWaterIntakeMutation();
  const date = new Date();

  const handleAddWater = (value: number) => {
    addWaterIntakeMutation.mutate(
      {
        amountMl,
        date: date.toISOString(),
      },
      {
        onError: (error) => {
          toast.error("Failed to add water intake");
        },
        onSuccess: () => {
          toast.success("Water 💧 intake added successfully!");
        },
      },
    );
  };
  return (
    <div className="mx-auto max-w-full overflow-hidden rounded-lg bg-white p-4 text-sm shadow-sm sm:max-w-sm">
      <div>Save {amountMl} Ml of water into your profile?</div>
      <Button
        onClick={() => handleAddWater(amountMl)}
        size="sm"
        className="mt-3 w-full"
        variant="outline"
        isLoading={addWaterIntakeMutation.isLoading}
      >
        <PlusSignIcon className="size-5" />
        Add water intake
      </Button>
    </div>
  );
}
