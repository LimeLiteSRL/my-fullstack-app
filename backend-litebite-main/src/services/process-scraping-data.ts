import {
  Food,
  Restaurant,
  UberEatsScrapingModel,
  type IFoodDocumentType,
  type IRestaurantDocumentType,
} from "../models/models";
import consola from "consola";

import { openai } from "@ai-sdk/openai";

import { generateObject } from "ai";
import { z } from "zod";
import {
  AllergiesSchema,
  DietaryPreferencesSchema,
  NutritionalInformationSchema,
} from "@/models/dto";

import * as ConfigurationService from "@/services/configuration-service";

const model = openai("gpt-4o-mini");

async function getRestaurantDescriptionFromAi(restaurant: string) {
  const configResult = await ConfigurationService.getAllConfigurations();

  const config: Record<string, string> = {};

  configResult.forEach((c) => {
    config[c.key] = c.value;
  });

  try {
    if (!restaurant || typeof restaurant !== "string") {
      throw new Error("Invalid data");
    }

    const prompt = ` ${config["PROCESS_SCRAPING_RESTAURANT_PART1__PROMPT"]}
      
Restaurant Data:
${JSON.stringify(restaurant, null, 2)}


`;

    console.log("getRestaurantDescriptionFromAi", prompt);

    const response = await generateObject({
      model,
      schema: z.object({
        description: z
          .string()
          .describe(config["PROCESS_SCRAPING_RESTAURANT_DESC__DESCRIBE"] || ""),
        confidence: z
          .number()
          .min(0)
          .max(1)
          .describe("Confidence score for the generated description"),
      }),
      prompt,
    });

    const { object } = response;

    return object;
  } catch (error) {
    console.error("Error fetching food data:", error);
    return { description: undefined, confidence: undefined };
  }
}

async function getFoodDataFromAi(food: any, restaurantDesc: string) {
  const configResult = await ConfigurationService.getAllConfigurations();

  const config: Record<string, string> = {};

  configResult.forEach((c) => {
    config[c.key] = c.value;
  });

  try {
    consola.log(`Processing food ${food.title}`);

    const prompt = `${config["PROCESS_SCRAPING_FOOD_PART1__PROMPT"]}
      
Food Item Data:
${JSON.stringify(food, null, 2)}

Restaurant Description:
${restaurantDesc}

`;

    consola.log("getFoodDataFromAi ", prompt);

    const response = await generateObject({
      model,
      schema: z.object({
        allergies: AllergiesSchema.partial().describe(
          config["PROCESS_SCRAPING_FOOD_ALLERGIES__DESCRIBE"] || ""
        ),
        nutritionalInformation: NutritionalInformationSchema.partial().describe(
          config["PROCESS_SCRAPING_FOOD_NUTRITION__DESCRIBE"] || ""
        ),
        dietaryPreferences: DietaryPreferencesSchema.partial(),
        healthRating: z.number().min(0).max(5),
        tasteRating: z.number().min(0).max(5),
        itemType: z.enum(["Dessert", "Drink", "Main Meal"]).or(z.string()),
        category: z.array(z.string()),
        description: z.string(),
        confidence: z.object({
          nutritionalValues: z.number().min(0).max(1),
          allergies: z.number().min(0).max(1),
          healthRating: z.number().min(0).max(1),
          overall: z.number().min(0).max(1),
        }),
      }),
      prompt,
    });

    const { object } = response;

    return object;
  } catch (error) {
    console.error("Error fetching food data:", error);
    return {};
  }
}

async function migrateUberEatsData(): Promise<void> {
  try {
    // Fetch UberEats data that hasn't been migrated yet
    const uberEatsData = await UberEatsScrapingModel.find({
      $or: [
        { migrationStatus: { $exists: false } },
        { migrationStatus: { $ne: "completed" } },
      ],
    })
      .sort({ _id: 1 })
      .limit(200)
      .lean();

    consola.log(`Restaurants to process: ${uberEatsData.length}`);

    for (const restaurant of uberEatsData) {
      // Ensure required fields are present for Restaurant
      if (
        typeof restaurant.name !== "string" ||
        !restaurant.location?.longitude ||
        !restaurant.location?.latitude
      ) {
        consola.warn(
          "Skipping restaurant due to missing or invalid fields:",
          restaurant.name
        );
        continue;
      }

      let savedRestaurant = await Restaurant.findOne({
        url: restaurant.link,
      });

      const aiResult = await getRestaurantDescriptionFromAi(
        JSON.stringify(restaurant)
      );

      const _reviewCount = Number(
        restaurant.rating?.reviewCount.replace("+", "")
      );
      const reviewCount = isNaN(_reviewCount) ? undefined : _reviewCount;

      const restaurantData: Partial<IRestaurantDocumentType> = {
        name: restaurant.name,
        url: restaurant.link || undefined,
        cuisineType: restaurant.cuisineType,
        locality: restaurant?.location?.city || undefined,
        region: restaurant?.location?.region || undefined,
        postalCode: restaurant?.location?.postalCode || undefined,
        country: restaurant?.location?.country || undefined,
        street: restaurant?.location?.streetAddress || undefined,
        heroUrl: restaurant.heroUrl ? restaurant.heroUrl : undefined,
        location: {
          type: "Point",
          coordinates: [
            restaurant.location.longitude,
            restaurant.location.latitude,
          ],
        },
        rating: restaurant.rating?.ratingValue,
        reviewCount: reviewCount,
        createdAt: new Date(),
        openingHours: restaurant.hours,
        description: aiResult.description,
        confidence: aiResult.confidence,
        serviceMode: restaurant.serviceMode,
        logo: restaurant.logo || undefined,
        telephone: restaurant.telephone || undefined,
      };

      if (!savedRestaurant) {
        savedRestaurant = await Restaurant.create(restaurantData);
        consola.log(`Saved restaurant: ${savedRestaurant.name}`);
      } else {
        consola.log(`Was already saved. restaurant: ${savedRestaurant.name}`);
      }

      if (!Array.isArray(restaurant.menu)) {
        consola.warn(
          "Skipping meals for restaurant due to invalid format:",
          restaurant
        );
        continue;
      }

      for (const meal of restaurant.menu) {
        if (typeof meal.title !== "string") {
          consola.warn(
            "Skipping meal due to missing or invalid fields:",
            meal.title
          );
          continue;
        }

        const listOfMatchedFoods = await Food.find({ link: meal.link });

        const hasSavedAlready = listOfMatchedFoods.length > 0;

        if (hasSavedAlready) {
          consola.warn("Skipping meal due to its already saved", meal.title);
          continue;
        }

        const aiFoodResult = await getFoodDataFromAi(
          meal,
          restaurantData.description || ""
        );

        const foodData: Partial<IFoodDocumentType> = {
          name: meal.title,
          price: meal.price || undefined,
          image: meal.image || undefined,
          link: meal.link || undefined,
          // tasteRating:meal.rateing
          // menuName: restaurant.title,
          // category: restaurant.cuisineType || undefined,
          createdAt: new Date(),
          ...aiFoodResult,
        };

        const savedFood: IFoodDocumentType = await Food.create(foodData);

        await Restaurant.updateOne(
          { _id: savedRestaurant._id },
          { $push: { menu: savedFood._id } }
        );
      }

      // Mark the restaurant as migrated
      await UberEatsScrapingModel.updateOne(
        { _id: restaurant._id },
        { migrationStatus: "completed" }
      );
    }

    consola.log("Data migration completed successfully.");
  } catch (error) {
    consola.error("Error migrating Uber Eats data:", error);
  }
}

if (process.env.ENV === "production") {
  setTimeout(migrateUberEatsData, 5000);
}
