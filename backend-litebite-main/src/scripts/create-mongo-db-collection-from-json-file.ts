import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";
import "../env";


import { fileURLToPath } from "url";
import consola from "consola";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// MongoDB connection URI and database/collection names
const MONGO_URI = process.env.DB_URL
const DATABASE_NAME = "diet";
const COLLECTION_NAME = "scraping-restaurant-ids";

// JSON file path
const JSON_FILE_PATH = path.join(__dirname, "../../temp/restaurants-in-new-york-unique-ID.json");

async function main() {
    try {
        // Read and parse the JSON file
        const fileContent = fs.readFileSync(JSON_FILE_PATH, "utf-8");
        const jsonData = JSON.parse(fileContent);


        // Validate the structure of the JSON file
        if (!Array.isArray(jsonData.data)) {
            throw new Error("Invalid JSON structure: 'data' field is not an array.");
        }

        consola.info('here')


        // Connect to MongoDB
        const client = new MongoClient(MONGO_URI);
        await client.connect();
        console.log("Connected to MongoDB");

        const db = client.db(DATABASE_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // Prepare documents for insertion
        const documents = jsonData.data.map((id: string) => ({ id }));

        // Insert documents into the collection
        const result = await collection.insertMany(documents);
        console.log(`${result.insertedCount} documents inserted successfully.`);

        // Close the MongoDB connection
        await client.close();
        console.log("MongoDB connection closed.");
    } catch (error) {
        //@ts-ignore
        console.error("Error:", error.message);
    }
}

main();
