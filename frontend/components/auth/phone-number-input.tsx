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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { isValidPhoneNumber } from "react-phone-number-input";
import { toast } from "sonner";
import { z } from "zod";
import { Checkbox } from "../ui/checkbox";
import { useState } from "react";
import Link from "next/link";
import { Routes } from "@/libs/routes";

const FormSchema = z.object({
  phone: z
    .string()
    .refine(isValidPhoneNumber, { message: "Invalid phone number" }),
});

type ISteps = "SEND_CODE" | "CHECK_CODE";

export default function PhoneNumberForm({
  setStep,
  setPhoneNumber,
}: {
  setStep: (value: ISteps) => void;
  setPhoneNumber: (value: string) => void;
}) {
  const [acceptTermsCheck, setAcceptTermsCheck] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      phone: "",
    },
  });

  const sendCodeMutation = authHooks.useSendCodeMutation();

  function onSubmit(data: z.infer<typeof FormSchema>) {
    sendCodeMutation.mutate(
      {
        phoneNumber: data.phone,
      },
      {
        onError: (e: any) => {
          toast.error("Somethings went wrong.");
        },
        onSuccess: (response: any) => {
          setStep("CHECK_CODE");
          setPhoneNumber(data.phone);
          toast.success("Code sent to your phone number.");
        },
      },
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col items-start"
        // autoComplete="off"
      >
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col items-start">
              <FormLabel className="text-left">Phone Number</FormLabel>
              <FormControl className="w-full">
                <PhoneInput
                  className="w-full"
                  placeholder="Enter a phone number"
                  {...field}
                  defaultCountry="US"
                  autoComplete="off"
                />
              </FormControl>
              {/* <FormDescription className="text-left">
                Enter a phone number
              </FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="my-5 flex items-center gap-2">
          <Checkbox
            onCheckedChange={(val: boolean) => setAcceptTermsCheck(val)}
            id="terms"
          />
          <label
            htmlFor="terms"
            className="text-xs leading-none text-heavy peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I agree to the{" "}
            <Link href={Routes.Privacy} className="text-blue-600">
              terms and conditions
            </Link>
          </label>
        </div>
        <Button
          isLoading={sendCodeMutation.isLoading}
          variant="secondary"
          className="w-full"
          type="submit"
          disabled={!acceptTermsCheck}
        >
          Continue
        </Button>
      </form>
    </Form>
  );
}
