import { BASE_API_URL } from "@/config";
import { mainApiInstance } from "@/libs/api";
import { makeApi, Zodios } from "@zodios/core";
import { ZodiosHooks } from "@zodios/react";
import { z } from "zod";
import { AllMealsSchema, MealSchema, ReviewDTOSchema } from "./meals-schema";
import { RestaurantSchema } from "../restaurants/reastaurants-schema";

const endpoints = makeApi([
  {
    method: "get",
    path: "/foods/find-nearby",
    requestFormat: "json",
    alias: "queryMealsNearBy",
    parameters: [
      {
        name: "longitude",
        type: "Query",
        schema: z.number(),
      },
      {
        name: "latitude",
        type: "Query",
        schema: z.number(),
      },
      {
        name: "maxDistance",
        type: "Query",
        schema: z.number(),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().optional(),
      },
      // filters
      {
        name: "typePreferences",
        type: "Query",
        schema: z.record(z.string(), z.boolean()).optional(),
      },
      {
        name: "allergies",
        type: "Query",
        schema: z.record(z.string(), z.boolean()).optional(),
      },
      {
        name: "dietaryPreferences",
        type: "Query",
        schema: z.record(z.string(), z.boolean()).optional(),
      },
      {
        name: "name",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: z.object({
      data: z.array(AllMealsSchema.passthrough()),
    }),
  },
  {
    method: "get",
    path: "/foods/search",
    requestFormat: "json",
    alias: "queryMealSearchByAi",
    parameters: [
      {
        name: "longitude",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "latitude",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "maxDistance",
        type: "Query",
        schema: z.number().optional(),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().optional(),
      },
      // filters
      {
        name: "typePreferences",
        type: "Query",
        schema: z.record(z.string(), z.boolean()).optional(),
      },
      {
        name: "allergies",
        type: "Query",
        schema: z.record(z.string(), z.boolean()).optional(),
      },
      {
        name: "dietaryPreferences",
        type: "Query",
        schema: z.record(z.string(), z.boolean()).optional(),
      },
      {
        name: "prompt",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: z.object({
      data: z.array(AllMealsSchema.passthrough()),
    }),
  },
  {
    method: "get",
    path: "/foods/:id",
    requestFormat: "json",
    alias: "querySingleMeal",
    parameters: [],
    response: z.object({
      data: MealSchema.passthrough(),
    }),
  },

  {
    method: "get",
    path: "/foods/compare",
    requestFormat: "json",
    alias: "queryCompareMeals",
    parameters: [
      {
        name: "foodIds",
        type: "Query",
        schema: z.string(),
      },
    ],
    response: z.object({
      data: z.array(MealSchema.passthrough()),
    }),
  },
  {
    method: "get",
    path: "/foods/:foodId/restaurants",
    requestFormat: "json",
    alias: "queryRestaurantsOfMeal",
    parameters: [],
    response: z.object({
      data: z.array(RestaurantSchema.passthrough()),
    }),
  },
  {
    method: "get",
    path: "/reviews/food/:foodId",
    requestFormat: "json",
    alias: "queryMealReview",
    parameters: [],
    response: z.object({
      data: z.array(ReviewDTOSchema),
    }),
  },
]);

export const api = new Zodios(endpoints);

const client = new Zodios(BASE_API_URL, endpoints, {
  axiosInstance: mainApiInstance,
});

export const mealsHook = new ZodiosHooks("meals", client);
