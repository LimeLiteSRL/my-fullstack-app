import mongoose from "mongoose";

const { DB_URL } = process.env;
import "../env";
import { Restaurant, UberEatsScrapingModel } from "@/models/models";

(async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(DB_URL);

    console.log("Connected to MongoDB");

    // Fetch restaurants where URL does not start with "/store"
    const restaurants = await Restaurant.find({ url: { $not: /^\/store/ } });

    console.log(`Found ${restaurants.length} restaurants to update.`);

    // Iterate through restaurants and update the URL
    for (const restaurant of restaurants) {
      console.log(restaurant.url);
      
      const uberData = await UberEatsScrapingModel.findOne({
        slug: restaurant.url,
      });

      // console.log(uberData)

      if (uberData && uberData.link) {
        restaurant.url = uberData.link;
        await restaurant.save(); // Save changes to the database
        console.log(
          `Updated restaurant ID: ${restaurant._id} with URL: ${uberData.link}`
        );
      } else {
        console.warn(
          `Restaurant ID: ${restaurant._id} does not have a valid link in uberEatSchema.`
        );
      }
    }

    console.log("URL updates completed.");
  } catch (error) {
    console.error("Error occurred:", error);
  } finally {
    // Disconnect from MongoDB
    mongoose.connection.close();
    console.log("Disconnected from MongoDB");
  }
})();
