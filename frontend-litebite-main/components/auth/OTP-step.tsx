import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PhoneInput } from "@/components/ui/phone-input";
import { authHooks } from "@/libs/endpoints/auth/auth-endpoints";
import { Routes } from "@/libs/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { isValidPhoneNumber } from "react-phone-number-input";
import { toast } from "sonner";
import { z } from "zod";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../ui/input-otp";
import { PencilEditIcon, ArrowLeftIcon } from "../icons/icons";
import useAuthStore from "@/libs/store/auth-store";
import useAddToProfileStore from "@/libs/store/add-to-profile-store";
import useAddToProfile from "@/libs/hooks/use-add-to-profile";
import { useEffect, useState } from "react";

const FormSchema = z.object({
  code: z.string().min(6, {
    message: "Your code must be 6 characters.",
  }),
});

type ISteps = "SEND_CODE" | "CHECK_CODE";

export default function OTPStep({
  setStep,
  phoneNumber,
}: {
  setStep: (value: ISteps) => void;
  phoneNumber: string;
}) {
  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      code: "",
    },
  });
  const { setToken } = useAuthStore();

  const verifyCodeMutation = authHooks.useVerifyCodeMutation();
  const { selectedMeal, setSelectedMeal } = useAddToProfileStore();
  const { handleAddToProfile } = useAddToProfile();
  const [resendTimes, setResendTimes] = useState(0);
  const onSuccess = () => {
    console.log("selected meal test", selectedMeal);
    setSelectedMeal("");
    toast.success("Welcome back!");
  };
  function onSubmit(data: z.infer<typeof FormSchema>) {
    verifyCodeMutation.mutate(
      {
        code: data.code,
        phoneNumber: phoneNumber,
      },
      {
        onError: (e: any) => {
          toast.error("Somethings went wrong.");
        },
        onSuccess: (response) => {
          router.push(Routes.Profile);
          setToken(response.token);
          if (!!selectedMeal) {
            handleAddToProfile(selectedMeal, 1);
            setSelectedMeal("");
          }
        },
      },
    );
  }
  const sendCodeMutation = authHooks.useSendCodeMutation();

  function onResendCode() {
    if (resendTimes === 2) {
      return toast.error("Please try a few minutes later.");
    }
    sendCodeMutation.mutate(
      {
        phoneNumber: phoneNumber,
      },
      {
        onError: (e: any) => {
          toast.error("Somethings went wrong.");
        },
        onSuccess: (response: any) => {
          setResendTimes((prv) => prv + 1);
          toast.success("Code sent to your phone number.");
        },
      },
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem className="text-center">
              <FormLabel>Enter Code</FormLabel>
              <FormControl>
                <InputOTP className="justify-center" maxLength={6} {...field}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                  </InputOTPGroup>
                  <InputOTPGroup>
                    <InputOTPSlot index={1} />
                  </InputOTPGroup>
                  <InputOTPGroup>
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                  <InputOTPGroup>
                    <InputOTPSlot index={4} />
                  </InputOTPGroup>
                  <InputOTPGroup>
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              {/* <FormDescription>
                Please enter the code sent to your phone.
              </FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          isLoading={verifyCodeMutation.isLoading || sendCodeMutation.isLoading}
          variant="secondary"
          className="w-full"
          type="submit"
        >
          Login
        </Button>

        <div className="flex flex-col items-center justify-center gap-6">
          <button
            className="flex items-center gap-2 rounded-full bg-offWhite px-6 py-2 text-sm text-heavy"
            onClick={() => setStep("SEND_CODE")}
            type="button"
          >
            <ArrowLeftIcon />
            Edit phone number
          </button>
          <div className="text-xs text-heavy">
            Didn’t receive the code?{" "}
            <button
              type="button"
              onClick={onResendCode}
              className="text-blue-600"
            >
              Click to resend
            </button>
          </div>
        </div>
      </form>
    </Form>
  );
}
