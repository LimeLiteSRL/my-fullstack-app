import { makeApi, Zodios } from "@zodios/core";
import { ZodiosHooks } from "@zodios/react";
import { mainApiInstance } from "@/libs/api";
import { z } from "zod";
import { BASE_API_URL } from "@/config";

const endpoints = makeApi([
  {
    method: "post",
    path: "/auth/send-code",
    alias: "sendCodeMutation",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({
          phoneNumber: z.string(),
        }),
      },
    ],
    response: z.any(),
  },
  {
    method: "post",
    path: "/auth/verify-code",
    alias: "verifyCodeMutation",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({
          phoneNumber: z.string(),
          code: z.string(),
        }),
      },
    ],
    response: z.object({
      token: z.string(),
    }),
  },
  {
    method: "post",
    path: "/auth/google-login",
    alias: "loginWithGoogle",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({
          token: z.string(),
        }),
      },
    ],
    response: z.object({
      token: z.string(),
    }),
  },
  {
    method: "post",
    path: "/auth/validate-token",
    alias: "validateTokenMutation",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({
          token: z.string(),
        }),
      },
    ],
    response: z.object({
      valid: z.boolean(),
      user: z.any().optional(),
      message: z.string(),
    }),
  },
]);

const client = new Zodios(BASE_API_URL, endpoints, {
  axiosInstance: mainApiInstance,
});

export const authHooks = new ZodiosHooks("auth", client);
