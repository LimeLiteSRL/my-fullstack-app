/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeftIcon, CameraIcon, CheckmarkCircleIcon } from "../icons/icons";
import { useRouter } from "next/navigation";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { cn, resizeImage } from "@/libs/utils";
import { usersHook } from "@/libs/endpoints/users/users-endpoints";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  IUserSettingsBody,
  UserSettingsBodySchema,
} from "@/libs/endpoints/users/users-schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import DateSelection from "./date-selection";
import { toast } from "sonner";
import Spinner from "../spinner";
import { isAxiosError } from "axios";
import { Routes } from "@/libs/routes";
import useAuthStore from "@/libs/store/auth-store";
import useProfileStore from "@/libs/store/profile-store";
import { Label } from "../ui/label";
import CustomSwitch from "../common/custom-switch";
import { queryClient } from "@/libs/query-client";
import { mainApiInstance } from "@/libs/api";
import { Progress } from "../ui/progress";
import { progress } from "framer-motion";
import { DotsLoading } from "../icons/three-dots-loading";

type IGender = "male" | "female" | "other";
type IActivity = "sedentary" | "light" | "moderate" | "active";
interface IActivities {
  label: string;
  description: string;
  value: string;
}
[];
interface IInformation {
  title: string;
  description: string;
  unit: string;
  value: string;
}
[];

type IFiled = "weight" | "height" | "targetWeight" | "targetDuration";

const activities = [
  {
    label: "Sedentary",
    description:
      "I have a desk job, and I rarely exercise and don’t usually do any physical activity.",
    value: "sedentary",
  },
  {
    label: "Lightly Active",
    description:
      "I walk the dog, do light exercise, or take casual walks 1-3 times a week.",
    value: "light",
  },
  {
    label: "Active",
    description: "I go to the gym, run, or do physical work 3-5 days a week.",
    value: "moderate",
  },
  {
    label: "Very Active",
    description:
      "I exercise intensely almost every day or have a very physically demanding job.",
    value: "active",
  },
];

const UserSettingsPage = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [gender, setGender] = useState<IGender>("male");
  const [birthdayDate, setBirthdayDate] = useState<Date>();

  const [heightUnit, setHeightUnit] = useState("cm");
  const [weightUnit, setWeightUnit] = useState("kg");
  const information = [
    {
      title: "Weight",
      description: "Enter your current weight for tailored statistics.",
      unit: weightUnit,
      value: "weight",
    },
    {
      title: "Height",
      description: "Enter your height to calculate your BMI ",
      unit: heightUnit,
      value: "height",
    },
    {
      title: "Target weight",
      description: "What is your target weight that you want to achieve.",
      unit: weightUnit,
      value: "targetWeight",
    },
    {
      title: "Target duration",
      description: "What is target duration for your goal weight?",
      unit: "Month",
      value: "targetDuration",
    },
  ];
  const [activityLevel, setActivityLevel] = useState<IActivity>("moderate");

  const timezoneOffsetInMinutes = new Date().getTimezoneOffset();
  const hours = Math.floor(Math.abs(timezoneOffsetInMinutes) / 60);
  const minutes = Math.abs(timezoneOffsetInMinutes) % 60;
  const sign = timezoneOffsetInMinutes <= 0 ? "+" : "-";

  // Format to "HH:MM" or "-HH:MM"
  const timezoneOffset = `${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

  const router = useRouter();

  const { data, isLoading, error } = usersHook.useQueryUserProfile({
    queries: {
      timezoneOffset: timezoneOffset,
    },
  });
  const user = data?.user;

  useEffect(() => {
    if (isAxiosError(error)) {
      const statusCode = error.response?.status;
      if (statusCode === 401) {
        toast.error("Unauthorized: Please log in.");
        router.push(Routes.Login);
      }
    }
  }, [error, router]);

  const editUserProfileMutation = usersHook.useEditUserProfileMutation();
  const isLoadingSubmit = editUserProfileMutation.isLoading;
  const form = useForm<IUserSettingsBody>({
    resolver: zodResolver(UserSettingsBodySchema),
    defaultValues: {
      phone: user?.phone,
      weight: 0,
    },
  });

  useEffect(() => {
    if (user) {
      form.setValue("phone", user?.phone);
      form.setValue("phoneVerifiedAt", user?.phoneVerifiedAt);
      form.setValue("createdAt", user?.createdAt);
      form.setValue("id", user?._id);
      form.setValue("activityLevel", user?.activityLevel);
      setActivityLevel(user?.activityLevel || "moderate");
      form.setValue("dateOfBirth", user?.dateOfBirth || "");
      form.setValue("gender", user?.gender);
      setGender(user?.gender || "male");
      form.setValue("height", user?.height || 0);
      form.setValue("name", user?.name);
      form.setValue("targetDuration", user?.targetDuration || 0);
      form.setValue("targetWeight", user?.targetWeight || 0);
      form.setValue("weight", user?.weight || 0);
      setHeightUnit(user.heightUnit || "cm");
      setWeightUnit(user?.weightUnit || "kg");
    }
  }, [user, form]);

  const onSubmit = (data: IUserSettingsBody) => {
    editUserProfileMutation.mutate(
      {
        ...data,
        dateOfBirth: birthdayDate?.toISOString(),
        gender: gender,
        heightUnit,
        weightUnit,
      },
      {
        onError: (e: any) => {
          toast.error("Somethings went wrong.");
        },
        onSuccess: (response) => {
          toast.success("Profile updated successfully!");
          router.push(Routes.Profile);
        },
      },
    );
  };

  const onError = (data: any) => {
    console.log(data);
  };
  const handleSelectActivity = (value: IActivity) => {
    setActivityLevel(value);
    form.setValue("activityLevel", value as IActivity);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <DotsLoading className="size-7" />
      </div>
    );
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const resizedFile =
        file.size > 1_000_000 ? await resizeImage(file, 200_000) : file;

      const formData = new FormData();
      formData.append("file", resizedFile);

      await mainApiInstance.post("/profile/update-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1),
          );
          setUploadProgress(progress);
        },
      });

      queryClient.invalidateQueries(
        usersHook.getKeyByAlias("queryUserProfile"),
      );

      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error("Image upload failed.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="relative flex h-full flex-col px-4 pb-4">
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-offWhite"
        >
          <ArrowLeftIcon className="size-5" />
        </button>
        <div className="w-full text-center text-xl font-semibold">
          Edit Your Profile
        </div>
      </div>
      <div className="mx-auto mt-20 flex w-full items-center justify-center rounded-[40px] p-8 shadow-3xl">
        <div className="flex items-center justify-center gap-3">
          <div className="size-24 overflow-hidden rounded-full bg-heavy/40">
            {user?.profilePicture && (
              <img
                src={user.profilePicture + "?id=" + Math.random()}
                className="h-full w-full object-cover"
                alt="profile"
              />
            )}
          </div>
          <div className="max-w-fit">
            <p className="w-fit text-lg font-medium">
              {form.watch("name") || user?.phone}
            </p>
            <div className="w-fit">
              <Label
                className="flex w-fit cursor-pointer items-center gap-1 font-light text-secondary"
                htmlFor="picture"
              >
                <CameraIcon className="size-5 text-heavy" />
                Change profile
              </Label>
              <Input
                className="m-0 hidden h-0 w-0 p-0 opacity-0"
                id="picture"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
            <Progress
              className={cn("mt-2 transition-opacity", {
                "opacity-0": !isUploading,
              })}
              value={uploadProgress}
            />
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onError)}>
          <div className="mt-8 space-y-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      className="rounded-full"
                      placeholder="Enter your full name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="mt-8 space-y-2">
            <FormLabel>Date of Birth</FormLabel>
            <DateSelection
              dateString={user?.dateOfBirth}
              setDate={setBirthdayDate}
            />
          </div>
          <div className="mt-8 space-y-2">
            <div className="text-sm font-medium">Change Gender</div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setGender("female")}
                type="button"
                className={cn(
                  "h-10 w-full rounded-full text-center text-sm text-heavy shadow-4xl",
                  gender === "female" && "bg-secondary text-offWhite",
                )}
              >
                Female
              </button>
              <button
                type="button"
                onClick={() => setGender("male")}
                className={cn(
                  "h-10 w-full rounded-full text-center text-sm text-heavy shadow-4xl",
                  gender === "male" && "bg-secondary text-offWhite",
                )}
              >
                Male
              </button>
            </div>
          </div>

          {/* <div className="mt-8 space-y-2">
            <div className="text-sm font-medium">Units of measurement</div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <UnitsMeasurement />
              </div>
              <div className="flex-1">
                <CurrencySelection />
              </div>
            </div>
          </div> */}

          <div className="mx-auto mt-8 grid gap-3 sm:grid-cols-2">
            {information.map((info, index) => (
              <div
                key={info.value}
                className="flex flex-col justify-between rounded-[30px] p-4 shadow-4xl"
              >
                <div>
                  <div className="mt-1 flex items-center justify-between">
                    <div className="font-medium">{info.title}</div>
                    {info.value === "weight" && (
                      <CustomSwitch
                        selected={weightUnit}
                        setSelected={setWeightUnit}
                        items={wUnits}
                      />
                    )}
                    {info.value === "height" && (
                      <CustomSwitch
                        selected={heightUnit}
                        setSelected={setHeightUnit}
                        items={hUnits}
                      />
                    )}
                  </div>
                  <div className="mt-1 text-xs text-heavy">
                    {info.description}
                  </div>
                </div>
                <Input
                  placeholder={info.unit}
                  type="number"
                  step="any"
                  min={0}
                  max={1000}
                  className="mt-2 h-8 rounded-full py-1"
                  {...form.register(info.value as IFiled, {
                    valueAsNumber: true,
                  })}
                />
              </div>
            ))}
          </div>
          <div className="mt-8 space-y-4">
            <div className="text-lg font-medium">
              Choose your level of activity
            </div>

            {activities.map((activity) => (
              <button
                type="button"
                key={activity.value}
                className={cn(
                  "relative block w-full space-y-1 rounded-[30px] border border-transparent p-4 text-start shadow-3xl",
                  activityLevel === activity.value && "border border-secondary",
                )}
                onClick={() =>
                  handleSelectActivity(activity.value as IActivity)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{activity.label}</div>
                  {activityLevel === activity.value && (
                    <CheckmarkCircleIcon className="size-5 text-secondary" />
                  )}
                </div>
                <div className="font text-xs text-heavy">
                  {activity.description}
                </div>
              </button>
            ))}
          </div>
          <Button
            disabled={isLoadingSubmit}
            type="submit"
            className="mt-4 w-full"
            variant="secondary"
          >
            Save changes
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default UserSettingsPage;

const hUnits = [
  {
    title: "cm",
    value: "cm",
  },
  {
    title: "ft",
    value: "in",
  },
];
const wUnits = [
  {
    title: "kg",
    value: "kg",
  },
  {
    title: "lb",
    value: "lb",
  },
];
