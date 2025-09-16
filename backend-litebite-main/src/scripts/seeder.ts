import mongoose, { Document } from "mongoose";
import csv from "csv-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import "../env";

const { DB_URL } = process.env;

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Convert import.meta.url to a file path and get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { User, Food, Restaurant } from "../models/models"; // Adjust the import path as necessary

interface NutritionalStats {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Allergies {
  milk: boolean;
  egg: boolean;
  wheat: boolean;
  soy: boolean;
  fish: boolean;
  peanuts: boolean;
  treeNuts: boolean;
}

interface DietaryPreferences {
  glutenFree: boolean;
  nutFree: boolean;
  sesame: boolean;
  vegan: boolean;
  vegetarian: boolean;
  halal: boolean;
  kosher: boolean;
  mediterranean: boolean;
  carnivore: boolean;
  keto: boolean;
  lowCarb: boolean;
  paleo: boolean;
}

interface NutritionalInformation {
  caloriesKcal: number;
  totalFatGrams: number;
  saturatedFatGrams: number;
  totalCarbsGrams: number;
  sugarsGrams: number;
  dietaryFiberGrams: number;
  proteinGrams: number;
  sodiumMg: number;
  cholesterolMg: number;
  potassiumMg: number;
  vitaminAMg: number;
  vitaminCMg: number;
  calciumMg: number;
  ironMg: number;
  polyunsaturatedFatGrams: number;
  transFatGrams: number;
  monounsaturatedFatGrams: number;
}

interface FoodData {
  name: string;
  category: string;
  price: number;
  description: string;
  availability: string;
  link: string;
  image: string;
  allergies: Allergies;
  dietaryPreferences: DietaryPreferences;
  servingSize: number;
  nutritionalInformation: NutritionalInformation;
  healthRating: number;
  tasteRating: number;
  itemType: string;
  modifier: string;
}

interface RestaurantData {
  name: string;
  url: string;
  cuisineType: string[];
  priceRange: string;
  locality: string;
  region: string;
  postalCode: string;
  country: string;
  street: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  telephone: string;
  rating: number;
  reviewCount: number;
  menu: mongoose.Types.ObjectId[];
  description: string;
}

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(DB_URL);
    console.log("MongoDB connected");
  } catch (err) {
    //@ts-expect-error

    console.error(err?.message);
    process.exit(1);
  }
};

const seedUsers = async (): Promise<void> => {
  const users = [
    // Example user
    {
      username: "user13333",
      phone: "123456783390",
      profilePicture: "user1.png",
      age: 25,
      nutritionalStats: {
        calories: 2000,
        protein: 150,
        carbs: 250,
        fat: 70,
      },
      foodsEaten: [],
      reviews: [],
    },
    // Add more users as needed
  ];

  await User.insertMany(users);
  console.log("Users seeded");
};

const foodIds: mongoose.Types.ObjectId[] = [];

const startSeedingByFoods = async (): Promise<void> => {
  const foods: FoodData[] = [];

  fs.createReadStream(path.resolve(__dirname, "../../temp/food.csv"))
    .pipe(csv())
    .on("data", (row) => {
      foods.push({
        name: row.item,
        category: row.itemType,
        price: parseFloat(row.price.replace("$", "").replace(",", "")),
        description: row.description,
        availability: row.availability,
        link: row.link,
        image: row.image,
        allergies: {
          milk: row.milk === "1",
          egg: row.egg === "1",
          wheat: row.wheat === "1",
          soy: row.soy === "1",
          fish: row.fish === "1",
          peanuts: row.peanuts === "1",
          treeNuts: row.treeNuts === "1",
        },
        dietaryPreferences: {
          glutenFree: row.glutenFree === "1",
          nutFree: row.nutFree === "1",
          sesame: row.sesame === "1",
          vegan: row.vegan === "1",
          vegetarian: row.vegetarian === "1",
          halal: row.halal === "1",
          kosher: row.kosher === "1",
          mediterranean: row.mediterranean === "1",
          carnivore: row.carnivore === "1",
          keto: row.keto === "1",
          lowCarb: row.lowCarb === "1",
          paleo: row.paleo === "1",
        },
        servingSize: row.servingSize ? parseFloat(row.servingSize) : 0,
        nutritionalInformation: {
          caloriesKcal: parseFloat(row.caloriesKcal),
          totalFatGrams: parseFloat(row.totalFatGrams),
          saturatedFatGrams: parseFloat(row.saturatedFatGrams),
          totalCarbsGrams: parseFloat(row.totalCarbsGrams),
          sugarsGrams: parseFloat(row.sugarsGrams),
          dietaryFiberGrams: parseFloat(row.dietaryFiberGrams),
          proteinGrams: parseFloat(row.proteinGrams),
          sodiumMg: parseFloat(row.sodiumMg),
          cholesterolMg: parseFloat(row.cholesterolMg),
          potassiumMg: parseFloat(row.potassiumMg),
          vitaminAMg: parseFloat(row.vitaminAMg),
          vitaminCMg: parseFloat(row.vitaminCMg),
          calciumMg: parseFloat(row.calciumMg),
          ironMg: parseFloat(row.ironMg),
          polyunsaturatedFatGrams: parseFloat(row.polyunsaturatedFatGrams),
          transFatGrams: parseFloat(row.transFatGrams),
          monounsaturatedFatGrams: parseFloat(row.monounsaturatedFatGrams),
        },
        healthRating: parseInt(row.healthRating, 10),
        tasteRating: parseInt(row.tasteRating, 10),
        itemType: row.itemType,
        modifier: row.modifier,
      });
    })
    .on("end", async () => {
      try {
        const insertedFoods = await Food.insertMany(foods);
        console.log("Foods seeded");

        // Create a map of restaurant names to their ObjectIds
        insertedFoods.forEach((food) => {
          //@ts-expect-error

          foodIds.push(food._id);
        });

        await seedRestaurants(); // Call to seed restaurants
      } catch (err) {
        console.error("Error seeding foods:", err);
      }
    });
};

const seedRestaurants = async (): Promise<void> => {
  const restaurants: RestaurantData[] = [];

  fs.createReadStream(path.resolve(__dirname, "../../temp/restaurant.csv"))
    .pipe(csv())
    .on("data", (row) => {
      const restaurant: RestaurantData = {
        name: row.name,
        url: row.link,
        cuisineType: row.cuisineType.split(","),
        priceRange: row.priceRange,
        locality: row.locality,
        region: row.region,
        postalCode: row.postalCode,
        country: row.country,
        street: row.street,
        location: {
          type: "Point",
          coordinates: [parseFloat(row.longitude), parseFloat(row.latitude)],
        },
        telephone: row.phone,
        rating: row.rating ? parseFloat(row.rating) : 0,
        reviewCount: parseInt(row.reviewCount || "0", 10),
        //@ts-expect-error
        menu: Array.from(
          { length: 5 },
          () => foodIds[getRandomNumber(0, foodIds.length - 1)]
        ), // Randomly pick 5 food IDs
        description: row.description,
      };

      restaurants.push(restaurant);
    })
    .on("end", async () => {
      try {
        await Restaurant.insertMany(restaurants);
        console.log("Restaurants seeded");
      } catch (err) {
        console.error("Error seeding restaurants:", err);
      } finally {
        await mongoose.disconnect(); // Ensure we disconnect from the database
      }
    })
    .on("error", (err) => {
      console.error("Error reading restaurant CSV:", err);
    });
};

const seedDatabase = async (): Promise<void> => {
  await connectDB();
  await startSeedingByFoods();
  // await seedUsers(); // Uncomment if user seeding is required
};

seedDatabase().catch((err) => {
  console.error("Database seeding error:", err);
  mongoose.disconnect();
});
