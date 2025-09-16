import { BASE_API_URL } from "@/config";
import { mainApiInstance } from "@/libs/api";
import { makeApi, Zodios } from "@zodios/core";
import { ZodiosHooks } from "@zodios/react";
import { z } from "zod";
import { AllMealsSchema } from "../meals/meals-schema";
import { RestaurantSchema } from "./reastaurants-schema";

const endpoints = makeApi([
  {
    method: "get",
    path: "/restaurants/:id",
    requestFormat: "json",
    alias: "querySingleRestaurant",
    parameters: [],
    response: z.object({
      data: AllMealsSchema,
    }),
  },
  {
    method: "get",
    path: "/restaurants/find-nearby",
    requestFormat: "json",
    alias: "queryNearByRestaurants",
    parameters: [
      {
        name: "latitude",
        type: "Query",
        schema: z.number(),
      },
      {
        name: "longitude",
        type: "Query",
        schema: z.number(),
      },
      {
        name: "maxDistance",
        type: "Query",
        schema: z.number(),
      },
      {
        name: "name",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: z.object({
      data: z.array(RestaurantSchema),
    }),
  },
]);

export const api = new Zodios(endpoints);

const client = new Zodios(BASE_API_URL, endpoints, {
  axiosInstance: mainApiInstance,
});

export const restaurantsHook = new ZodiosHooks("restaurants", client);
