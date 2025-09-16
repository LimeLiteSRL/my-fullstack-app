// swapCoordinates.js
import { Restaurant } from "@/models/models";
import mongoose from "mongoose";
import "../env";


const { DB_URL } = process.env||""

async function swapCoordinates() {
  try {
    // Connect to the database
    await mongoose.connect(DB_URL);

    // Fetch all restaurants
    const restaurants = await Restaurant.find();

    // Iterate through each restaurant and swap coordinates
    for (const restaurant of restaurants) {
      if (restaurant.location && restaurant.location.coordinates) {
        const { coordinates } = restaurant.location;

        // Swap the coordinates (longitude, latitude)
        if (coordinates[1] && coordinates[0]) {
          restaurant.location.coordinates = [coordinates[1], coordinates[0]];
        }

        // Save the updated restaurant document
        await restaurant.save();
      }
    }

    console.log("Coordinates swapped successfully!");
  } catch (error) {
    console.error("Error swapping coordinates:", error);
  } finally {
    // Close the database connection
    await mongoose.disconnect();
  }
}

// Execute the function
swapCoordinates();
