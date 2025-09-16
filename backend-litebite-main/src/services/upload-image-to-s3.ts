import { uuid } from "@/utils";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import axios from "axios";
import consola from "consola";
import { MongoClient, ObjectId } from "mongodb";
import * as path from "path";

// MongoDB Configuration
const mongoUri = process.env.DB_URL; // Replace with your MongoDB URI
const dbName = "diet"; // Replace with your database name
const restaurantCollection = "restaurants"; // Replace with your restaurant collection name
const foodCollection = "foods"; // Replace with your food collection name

// S3 Configuration
const bucketName = "litebite.cloud";
const s3 = new S3Client({ region: "eu-north-1" });

// Retry Function
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      consola.warn(`Attempt ${attempt} failed. Retrying in ${delayMs}ms...`);
      if (attempt === retries) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error("Exceeded retry limit");
}

// Batch Processing Function
async function processBatch(
  batch: any[],
  collection: any,
  field: string,
  collectionName: string
) {
  const promises = batch.map(async (doc) => {
    const imageUrl = doc[field];
    if (!imageUrl) {
      consola.log(
        `Skipping document ID ${doc._id} - no URL found in field "${field}".`
      );
      return;
    }

    if (imageUrl.startsWith("https://litebite.cloud")) {
      consola.log(
        `Skipping document ID ${doc._id} - URL starts with restricted prefix.`
      );
      return;
    }

    const fileName = `${process.env.ENV}/static/${collectionName}/${
      doc._id
    }/${path.basename(imageUrl)}`; // Unique filename using the document ID

    // Download the image
    consola.log(`Downloading ${imageUrl}...`);
    const imageBuffer = await withRetry(
      async () => {
        const response = await axios.get(imageUrl, {
          responseType: "arraybuffer",
        });
        return Buffer.from(response.data);
      },
      3,
      2000 // 2-second retry delay
    );

    // Upload to S3
    consola.log(`Uploading ${fileName} to S3...`);
    await withRetry(
      () =>
        s3.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: fileName,
            Body: imageBuffer,
            ContentType: "image/jpeg", // Adjust based on expected content type
          })
        ),
      3,
      2000
    );

    const newS3Url = `https://litebite.cloud/${fileName}`;
    consola.log(
      `Uploaded ${fileName} to S3 successfully. New URL: ${newS3Url}`
    );

    // Update MongoDB with the new S3 URL
    consola.log(`Updating database for document ID ${doc._id}...`);
    await withRetry(() =>
      collection.updateOne(
        { _id: new ObjectId(doc._id) },
        { $set: { [field]: newS3Url } }
      )
    );

    consola.log(`Database updated for document ID ${doc._id}.`);
  });

  await Promise.all(promises); // Process batch in parallel
}

// Main Function
async function processImages() {
  const mongoClient = new MongoClient(mongoUri);

  try {
    // Connect to MongoDB
    await mongoClient.connect();
    const db = mongoClient.db(dbName);
    const restaurantCol = db.collection(restaurantCollection);
    const foodCol = db.collection(foodCollection);

    const batchSize = 10; // Number of images to process in a batch

    // Process Restaurant heroUrl and logo
    consola.log("Processing Restaurant heroUrl and logo...");
    const restaurantCursor = restaurantCol.find({
      $or: [
        {
          heroUrl: {
            $exists: true,
            $not: { $regex: "^https://litebite.cloud" },
          },
        },
        {
          logo: { $exists: true, $not: { $regex: "^https://litebite.cloud" } },
        },
      ],
    });
    let restaurantBatch = [];
    while (await restaurantCursor.hasNext()) {
      const doc = await restaurantCursor.next();
      restaurantBatch.push(doc);

      if (restaurantBatch.length === batchSize) {
        consola.log(
          `Processing batch of ${restaurantBatch.length} Restaurant documents...`
        );
        // Process heroUrl
        await processBatch(
          restaurantBatch,
          restaurantCol,
          "heroUrl",
          "restaurant"
        );
        // Process logo
        await processBatch(
          restaurantBatch,
          restaurantCol,
          "logo",
          "restaurant"
        );
        restaurantBatch = []; // Reset batch
      }
    }
    if (restaurantBatch.length > 0) {
      consola.log(
        `Processing final batch of ${restaurantBatch.length} Restaurant documents...`
      );
      // Process heroUrl
      await processBatch(
        restaurantBatch,
        restaurantCol,
        "heroUrl",
        "restaurant"
      );
      // Process logo
      await processBatch(restaurantBatch, restaurantCol, "logo", "restaurant");
    }

    // Process Food image
    consola.log("Processing Food image...");
    const foodCursor = foodCol.find({
      image: { $exists: true, $not: { $regex: "^https://litebite.cloud" } },
    });
    let foodBatch = [];
    while (await foodCursor.hasNext()) {
      const doc = await foodCursor.next();
      foodBatch.push(doc);

      if (foodBatch.length === batchSize) {
        consola.log(
          `Processing batch of ${foodBatch.length} Food documents...`
        );
        await processBatch(foodBatch, foodCol, "image", "food");
        foodBatch = []; // Reset batch
      }
    }
    if (foodBatch.length > 0) {
      consola.log(
        `Processing final batch of ${foodBatch.length} Food documents...`
      );
      await processBatch(foodBatch, foodCol, "image", "food");
    }

    consola.log("All images processed and database updated successfully.");
  } catch (err) {
    consola.error("Error processing images:", err);
  } finally {
    await mongoClient.close();
  }
}
// Run the script

if (process.env.ENV === "production") {
  processImages().catch((err) => consola.error("Unexpected error:", err));
}
