import express, { type Request, type Response } from "express";

import { openai } from "@ai-sdk/openai";
import {
  convertToCoreMessages,
  generateObject,
  StreamData,
  streamText,
  tool,
} from "ai";
import { withProfileIfAvailableMiddleware } from "@/middlewares/with-profile-if-available-middleware";
import type { IUserDocumentType } from "@/models/models";
import { z } from "zod";

import { NutritionalInformationSchema } from "@/models/dto";
import * as UserService from "@/services/user-services";
import * as ConfigurationService from "@/services/configuration-service";
import consola from "consola";

const router = express.Router();

router.post(
  "/ai",
  withProfileIfAvailableMiddleware,
  async (req: Request, res: Response) => {
    const configResult = await ConfigurationService.getAllConfigurations();

    const config: Record<string, string> = {};

    configResult.forEach((c) => {
      config[c.key] = c.value;
    });

    //@ts-ignore
    const profile: IUserDocumentType | null = req.profile;

    const payload = {
      activityLevel: profile?.activityLevel,
      gender: profile?.gender,
      height: profile?.height,
      name: profile?.name,
      targetDuration: profile?.targetDuration,
      targetWeight: profile?.targetWeight,
      weight: profile?.weight,
      dateOfBirth: profile?.dateOfBirth,
    };

    let systemPrompt = "";

    systemPrompt += profile
      ? `${config["BEFORE_BOT_CUSTOMIZATION_OBJECT"]} ${JSON.stringify(
          profile.botCustomization
        )}`
      : "";

    systemPrompt += ` ${config["SYSTEM_ROLE"]} `;

    systemPrompt += profile
      ? ` ${config["BEFORE_USER_PROFILE"]} ${JSON.stringify({
          profile: payload,
          preferences: profile.preferences,
          allergies: profile.allergies,
          dietaryPreferences: profile.dietaryPreferences,
          goals: profile.goals,
        })} `
      : "";

    systemPrompt += profile ? ` ${config["AFTER_BOT_CUSTOMIZATION"]} ` : "";

    consola.warn(systemPrompt);

    const data = new StreamData();
    data.append("initialized call");

    const result = await streamText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      tools: {
        getWeather: tool({
          description: "Get the current weather at a location",
          parameters: z.object({
            latitude: z.number(),
            longitude: z.number(),
          }),
          execute: async ({ latitude, longitude }) => {
            const response = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`
            );

            // consola.warn({ latitude, longitude });

            const weatherData = await response.json();
            return weatherData;
          },
        }),
        learnAboutUser: tool({
          description: config["LEARN_ABOUT_USER_METHOD_DESC"],
          parameters: z.object({
            name: z.string().describe("Name of the user").optional(),
            dateOfBirth: z
              .string()
              .describe("User's birth date in YYYY-MM-DD format")
              .optional(),
            gender: z
              .enum(["male", "female", "other"])
              .describe("User's gender")
              .optional(),
            weight: z
              .number()
              .describe("User's current weight in kilograms")
              .optional(),
            height: z
              .number()
              .describe("User's height in centimeters")
              .optional(),
            targetWeight: z
              .number()
              .describe("User's target weight in kilograms")
              .optional(),
            targetDuration: z
              .number()
              .describe("Duration (in days) to reach the target weight")
              .optional(),
            activityLevel: z
              .enum(["sedentary", "light", "moderate", "active"])
              .describe("User's typical daily activity level")
              .optional(),
          }),
          execute: async ({ dateOfBirth, ...rest }) => {
            await UserService.updateUserById(profile?.id, {
              dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
              ...rest,
            });

            return { result: "saved in db successfully" };
          },
        }),
        learnUserPreferences: tool({
          description: config["LEARN_USER_PREFERENCES_METHOD_DESC"],
          parameters: z.object({
            preferences: z
              .array(z.string())
              .describe("An array of user preferences")

              .optional(),
            dietaryPreferences: z
              .array(z.string())
              .describe("An array of dietary Preferences ")

              .optional(),
            goals: z
              .array(z.string())
              .describe("An array of user goals")

              .optional(),
            allergies: z
              .array(z.string())
              .describe("An array of user allergies ")

              .optional(),
            reminders: z
              .array(z.string())
              .describe(
                "An array of reminders for user save like cronjob format (cronjob:title)"
              )

              .optional(),
          }),
          execute: async ({
            preferences,
            allergies,
            dietaryPreferences,
            goals,
            reminders,
          }) => {
            const data = UserService.safeUpdateUserPreferences({
              id: profile?.id,
              allergies,
              dietaryPreferences,
              goals,
              preferences,
              reminders,
            });

            // consola.log({
            //   preferences,
            //   allergies,
            //   dietaryPreferences,
            //   goals,
            //   reminders,
            // });

            return data;
          },
        }),
        customizeBot: tool({
          description: config["CUSTOMIZE_BOT_METHOD_DESC"],
          parameters: z.object({
            customizations: z
              .array(z.string())
              .describe(
                "An array containing the bot's name and personality traits, such as tone, energy level, or formality"
              )
              .optional(),
          }),
          execute: async ({ customizations }) => {
            const data = await UserService.safeUpdateBotCustomizationByUserId(
              profile?.id,
              customizations || []
            );

            return data;
          },
        }),
        getFoodRecipe: tool({
          description: config["GET_FOOD_RECIPE_METHOD_DESC"],
          parameters: z.object({
            foodItem: z.string().describe("The name of the food item"),
          }),

          execute: async ({ foodItem }) => {
            try {
              const { object } = await generateObject({
                model: openai("gpt-4o"),
                schema: z.object({
                  nutrition: NutritionalInformationSchema,
                }),
                prompt: "Give me nutrition of  " + foodItem,
              });

              return {
                result: "OK",
                nutrition: object.nutrition,
                foodItem,
              };
            } catch (error) {
              return { result: "Something went wrong" };
            }

            // return data;
          },
        }),
        getFoodNutrition: tool({
          description: config["GET_FOOD_NUTRITIONS_METHOD_DESC"],
          parameters: z.object({
            foodItem: z.string().describe("The name of the food item"),
          }),

          execute: async ({ foodItem }) => {
            try {
              // Generate nutritional information using OpenAI's model
              const { object } = await generateObject({
                model: openai("gpt-4o"),
                schema: z.object({
                  nutrition: NutritionalInformationSchema,
                }),
                prompt: `Provide the nutritional information for: ${foodItem}`,
              });

              consola.info(
                "GET_FOOD_NUTRITIONS_METHOD_DESC:",
                config["GET_FOOD_NUTRITIONS_METHOD_DESC"]
              );

              // Return the result object directly
              return {
                result:
                  "Data has sent to user, just tell them that what else they need ,in max 5 words",
                // result: `Here is the nutritional information for ${foodItem}:`,

                nutrition: object.nutrition,
                foodItem,
              };
            } catch (error) {
              consola.error("Error in getFoodNutrition:", error);

              // Return an error response in case of failure
              return {
                result:
                  "Something went wrong while fetching nutrition data. Please try again.",
                nutrition: null,
                foodItem,
              };
            }
          },
        }),
        calculateWaterIntake: tool({
          description: config["CALCULATE_WATER_INTAKE_METHOD_DESC"],
          parameters: z.object({
            amountMl: z
              .number()
              .describe("The amount of water the user drank in Ml"),
          }),

          execute: async ({ amountMl }) => {
            try {
              // consola.log({amountMl})
              return {
                result: "Water intake data has been successfully processed",
                amountMl: amountMl,
              };
            } catch (error) {
              return { result: "Something went wrong" };
            }
          },
        }),
      },
      maxSteps: 5,
      messages: convertToCoreMessages(req.body.messages),
      // onStepFinish({ text, toolCalls, toolResults, finishReason, usage }) {
      //   consola.log({
      //     text,
      //     toolCalls,
      //     toolResults,
      //     finishReason,
      //     usage,
      //   });
      // },
      onFinish() {
        // consola.log("call completed");

        data.append("call completed");
        data.close();
      },
    });

    result.pipeDataStreamToResponse(res, { data });
  }
);

export default router;
