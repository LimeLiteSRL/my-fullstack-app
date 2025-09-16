import { BASE_API_URL } from "@/config";
import { mainApiInstance } from "@/libs/api";
import { makeApi, Zodios } from "@zodios/core";
import { ZodiosHooks } from "@zodios/react";
import { z } from "zod";
import {
  EatenFoodSchema,
  NotificationSchema,
  NutritionSchema,
  ProfileSchema,
  UserSettingsBodySchema,
  WaterIntakeSchema,
} from "./users-schema";
import { NutritionalInformationSchema } from "../meals/meals-schema";

const endpoints = makeApi([
  {
    method: "get",
    path: "/profile",
    requestFormat: "json",
    alias: "queryUserProfile",
    parameters: [
      {
        name: "timezoneOffset",
        type: "Query",
        schema: z.string(),
      },
    ],
    response: z.object({
      nutritionalInformation: z.any(),
      user: ProfileSchema,
    }),
  },
  {
    method: "put",
    path: "/profile",
    requestFormat: "json",
    alias: "editUserProfileMutation",
    parameters: [
      {
        name: "body",
        schema: UserSettingsBodySchema,
        type: "Body",
      },
    ],
    response: z.any(),
  },
  {
    method: "post",
    path: "/profile/food",
    requestFormat: "json",
    alias: "addToProfileMutation",
    parameters: [
      {
        name: "body",
        schema: z.object({
          foodId: z.string(),
          portionSize: z.number(),
        }),
        type: "Body",
      },
    ],
    response: z.any(),
  },
  {
    method: "delete",
    path: "/profile/eaten/:eatenFoodId",
    requestFormat: "json",
    alias: "deleteFoodMutation",
    parameters: [],
    response: z.any(),
  },
  {
    method: "post",
    path: "/profile/ai-food",
    requestFormat: "json",
    alias: "addToProfileAiMutation",
    parameters: [
      {
        name: "body",
        schema: z.object({
          foodName: z.string(),
          nutritionalInformation:
            NutritionalInformationSchema.partial().optional(),
          portionSize: z.number(),
        }),
        type: "Body",
      },
    ],
    response: z.any(),
  },
  {
    method: "get",
    path: "/profile/notifications",
    requestFormat: "json",
    alias: "queryNotifications",
    parameters: [],
    response: z.object({
      data: z.array(NotificationSchema),
    }),
  },
  {
    method: "put",
    path: "/profile/notifications/:notificationId/read",
    requestFormat: "json",
    alias: "readNotificationsMutation",
    parameters: [],
    response: z.any(),
  },
  {
    method: "put",
    path: "/profile/notifications/read",
    requestFormat: "json",
    alias: "readAllNotificationsMutation",
    parameters: [],
    response: z.any(),
  },
  {
    method: "get",
    path: "/profile/eaten",
    requestFormat: "json",
    alias: "queryEatenMeals",
    parameters: [
      {
        name: "startDate",
        schema: z.string().optional(),
        type: "Query",
      },
      {
        name: "endDate",
        schema: z.string().optional(),
        type: "Query",
      },
    ],
    response: z.object({
      eatenFoods: z.array(EatenFoodSchema),
    }),
  },
  {
    method: "get",
    path: "/profile/water-intake",
    requestFormat: "json",
    alias: "queryWaterIntake",
    parameters: [
      {
        name: "startDate",
        schema: z.string().optional(),
        type: "Query",
      },
      {
        name: "endDate",
        schema: z.string().optional(),
        type: "Query",
      },
    ],
    response: WaterIntakeSchema,
  },
  {
    method: "post",
    path: "/profile/water-intake",
    requestFormat: "json",
    alias: "addWaterIntakeMutation",
    parameters: [
      {
        name: "body",
        schema: z.object({
          amountMl: z.number(),
          date: z.string(),
        }),
        type: "Body",
      },
    ],
    response: z.any(),
  },
  {
    method: "post",
    path: "/profile/review",
    requestFormat: "json",
    alias: "ratingMutation",
    parameters: [
      {
        name: "body",
        schema: z.object({
          foodId: z.string(),
          healthRating: z.number().optional(),
          tasteRating: z.number().optional(),
          comment: z.string().optional(),
        }),
        type: "Body",
      },
    ],
    response: z.any(),
  },
]);

export const api = new Zodios(endpoints);

const client = new Zodios(BASE_API_URL, endpoints, {
  axiosInstance: mainApiInstance,
});

export const usersHook = new ZodiosHooks("users", client);
