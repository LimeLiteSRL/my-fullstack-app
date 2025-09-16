import { toast } from "sonner";
import { usersHook } from "../endpoints/users/users-endpoints";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { Routes } from "../routes";
import useAddToProfileStore from "../store/add-to-profile-store";
import Link from "next/link";

const useAddToProfile = () => {
  const addToProfileMutation = usersHook.useAddToProfileMutation();
  const { setSelectedMeal } = useAddToProfileStore();
  const router = useRouter();

  const handleAddToProfile = (
    foodId: string,
    portionSize = 1,
    onSuccessCallback?: () => void,
  ) => {
    addToProfileMutation.mutate(
      {
        foodId: foodId,
        portionSize,
      },
      {
        onError: (error: any) => {
          // Check if it's an Axios error
          if (isAxiosError(error)) {
            const statusCode = error.response?.status;

            if (statusCode === 401) {
              toast.error("Unauthorized: Please log in.");
              setSelectedMeal(foodId);
              router.push(Routes.Login);
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
          onSuccessCallback && onSuccessCallback();
          toast(
            <div>
              Meal added! 🍽️ Check your profile for an overview of your eating
              habits.
              <Link
                href={Routes.Profile}
                className="mx-2 text-xs text-blue-500"
              >
                Show on profile
              </Link>
            </div>,
          );
        },
      },
    );
  };
  return {
    handleAddToProfile,
    isLoading: addToProfileMutation.isLoading,
    isSuccess: addToProfileMutation.isSuccess,
  };
};

export default useAddToProfile;
