import { Restaurant } from "@/models/models";
import mongoose from "mongoose";
import "../env";

const random = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const { DB_URL } = process.env;

const getRandomCoordinates = (i: number): number[] => {
  const list = [
    [34.054897, -118.255274],
    [34.06023055376921, -118.23733537974728],
    [34.046790384276655, -118.26523035201463],
    [34.04280770264193, -118.25209825737802],
    [34.058808414425705, -118.22025507365129],
  ];

  return list[i]?.reverse() || [];
};

const updateRestaurantCoordinates = async () => {
  try {
    await mongoose.connect(DB_URL);

    const restaurants = await Restaurant.find({});

    for (const restaurant of restaurants) {
      // Update the restaurant with new random coordinates
      //   restaurant.location = null
      restaurant.location.coordinates = getRandomCoordinates(random(0, 4));

      await restaurant.save();
      console.log(`Updated coordinates for restaurant: ${restaurant.name}`);
    }

    console.log("Coordinates updated for all restaurants.");
  } catch (error) {
    console.error("Error updating coordinates:", error);
  } finally {
    mongoose.connection.close();
  }
};

updateRestaurantCoordinates();
