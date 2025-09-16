import "dotenv/config";
import consola from "consola";
import cors from "cors";
import compression from "compression";
import express, { type Request, type Response, type NextFunction } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import "./env";
import Redoc from "redoc-express";

import { errorHandler, handle404Error } from "./errors";
import router from "./router";
import connectDB from "./db";
import { Restaurant } from "./models/models";
import mongoose from "mongoose";
// import "@/services/get-restaurant-details-from-ubereat-using-ids"
import "@/services/upload-image-to-s3";
import "@/services/process-scraping-data";
// import "@/scripts/atlas-migration";

const { PORT } = process.env;

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
connectDB();
// Ensure critical indexes exist for geospatial queries to prevent 500 errors on $near
mongoose.connection.on("open", async () => {
  try {
    await Restaurant.collection.createIndex({ location: "2dsphere" });
    consola.info("MongoDB: ensured 2dsphere index on restaurants.location");
  } catch (e) {
    consola.warn("MongoDB: failed to ensure 2dsphere index on restaurants.location", e);
  }
});

// Enable strong ETags for conditional GET (saves bandwidth)
app.set("etag", "strong");

// Enable gzip compression for all text responses
// Note: Brotli is recommended at the reverse proxy (e.g., Nginx/Cloudflare)
app.use(
  compression({
    level: 6, // balance CPU vs ratio
    threshold: 1024, // compress responses >1KB
    filter: (req: Request, res: Response) => {
      if (req.headers["x-no-compression"]) return false;
      return compression.filter(req, res);
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure CORS (fix policy for credentials/headers and specific origins)
const allowedOrigins = ("http://localhost:3000,http://localhost:5173,http://5.161.254.199:3000,https://litebite.ai,https://www.litebite.ai,https://panel.litebite.ai,https://api.litebite.ai").split(",").map((s) => s.trim());

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    
    if (!origin) {
      return callback(null, true); // allow non-browser or same-origin
    }
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"],
  credentials: true,
  maxAge: 86400,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Set caching headers for GET responses by default (can be overridden per route)
app.use(function setDefaultCachingHeaders(req: Request, res: Response, next: NextFunction) {
  if (req.method === "GET") {
    // Short TTL for API responses; adjust per endpoint if needed
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=60");
  }
  next();
});

app.use("/v1", router);

app.get("/health-check", function (_req, res) {
  res.json({
    message: "Server is running",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

// Test database connection and Restaurant model
app.get("/test-db", async function (_req, res) {
  try {
    
    // Get database info
    const db = Restaurant.db;
    
    // List all collections
    const collections = await db.listCollections();
    
    // Check document count for each collection
    const collectionInfo = [];
    for (const collection of collections) {
      try {
        const count = await db.collection(collection.name).countDocuments();
        collectionInfo.push({
          name: collection.name,
          count: count
        });
      } catch (err) {
        console.log(`❌ Error checking collection '${collection.name}':`, err);
      }
    }
    
    // Test Restaurant model
    const totalRestaurants = await Restaurant.countDocuments();
    
    // Test with different collection names
    const possibleCollectionNames = ['restaurants', 'Restaurant', 'restaurant', 'Restaurants'];
    
    for (const collectionName of possibleCollectionNames) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        
        if (count > 0) {
          const sample = await collection.findOne();
        }
      } catch (err) {
        console.log(`❌ Collection '${collectionName}' not found`);
      }
    }
    
    if (totalRestaurants > 0) {
      const sampleRestaurant = await Restaurant.findOne();
    }
    
    res.json({
      success: true,
      databaseName: db.name,
      collections: collectionInfo,
      totalRestaurants,
      sampleRestaurant: totalRestaurants > 0 ? {
        name: (await Restaurant.findOne())?.name,
        location: (await Restaurant.findOne())?.location,
        menuCount: (await Restaurant.findOne())?.menu?.length
      } : null
    });
  } catch (error) {
    console.error("❌ Database test error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Debug endpoint to check environment variables
app.get("/debug-env", function (_req, res) {
  res.json({
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? "✅ Set" : "❌ Missing",
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? "✅ Set" : "❌ Missing",
    TWILIO_SERVICE_ID: process.env.TWILIO_SERVICE_ID ? "✅ Set" : "❌ Missing",
    DB_URL: process.env.DB_URL ? "✅ Set" : "❌ Missing",
    DB_URL_VALUE: process.env.DB_URL ? process.env.DB_URL.substring(0, 50) + "..." : "❌ Missing",
    JWT_SECRET: process.env.JWT_SECRET ? "✅ Set" : "❌ Missing",
    PORT: process.env.PORT || "❌ Missing",
  });
});

app.get("/swagger.yaml", (_req, res) => {
  // Try multiple locations to support local/dev/prod environments
  const candidates = [
    path.join(__dirname, "swagger.yaml"),
    path.resolve(process.cwd(), "src", "swagger.yaml"),
    path.resolve(process.cwd(), "backend-litebite", "src", "swagger.yaml"),
    "/app/src/swagger.yaml",
  ];

  const existingPath = candidates.find((p) => {
    try {
      return fs.existsSync(p);
    } catch {
      return false;
    }
  });

  if (existingPath) {
    return res.sendFile(existingPath, (err) => {
      if (err) {
        res.status(500).send("Error serving the file.");
      }
    });
  }

  res.status(500).send("swagger.yaml not found in known locations.");
});

app.get(
  "/doc",
  Redoc({
    title: "API Docs",
    specUrl: "/swagger.yaml",
  })
);

app.all("*", handle404Error);
app.use(errorHandler);

app.listen(PORT, async () => {
  consola.info(`Server running at http://localhost:${PORT}`);
});

export default app;
