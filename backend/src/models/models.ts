import mongoose, { Document, Schema as MongooseSchema, Model } from "mongoose";

// User Interface
export interface IUserDocumentType extends Document {
  name?: string;
  phone: string;
  email: string;
  profilePicture?: string;
  age?: number;
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other";
  weight?: number;
  height?: number;
  targetWeight?: number;
  targetDuration?: number; // in days
  activityLevel?: "sedentary" | "light" | "moderate" | "active";
  foodsEaten: mongoose.Types.ObjectId[];
  reviews: mongoose.Types.ObjectId[];
  role?: string;

  phoneVerifiedAt: Date;
  createdAt: Date;

  botCustomization?: Map<string, string>;
  preferences?: string[];
  allergies?: string[];
  dietaryPreferences?: string[];
  goals?: string[];

  heightUnit?: "cm" | "in"; // Separate height unit
  weightUnit?: "kg" | "lb"; // Separate weight unit
}

// User Schema
const userSchema = new MongooseSchema<IUserDocumentType>(
  {
    name: String,
    phone: { type: String },
    email: { type: String },
    profilePicture: String,
    age: Number,
    dateOfBirth: Date,
    gender: { type: String, enum: ["male", "female", "other"] },
    weight: Number,
    height: Number,
    targetWeight: Number,
    targetDuration: Number, // in days
    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "active"],
    },
    role: String,
    phoneVerifiedAt: { type: Date, default: null },

    foodsEaten: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EatenFood",
      },
    ],
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    botCustomization: {
      type: Map,
      of: String, // Define the type for the values inside the object
    },
    preferences: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
    dietaryPreferences: { type: [String], default: [] },
    goals: { type: [String], default: [] },
    heightUnit: {
      type: String,
      enum: ["cm", "in"],
    },
    weightUnit: {
      type: String,
      enum: ["kg", "lb"],
    },
  },
  { timestamps: true }
);

// Unique index for phone when it exists
userSchema.index(
  { phone: 1 },
  {
    unique: true,
    partialFilterExpression: {
      phone: { $exists: true },
    },
  }
);

// Unique index for email when it exists
userSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: {
      email: { $exists: true },
    },
  }
);

export const User: Model<IUserDocumentType> = mongoose.model<IUserDocumentType>(
  "User",
  userSchema
);

export type IFoodNutritionalInformation = {
  caloriesKcal?: number;
  totalFatGrams?: number;
  saturatedFatGrams?: number;
  totalCarbsGrams?: number;
  sugarsGrams?: number;
  dietaryFiberGrams?: number;
  proteinGrams?: number;
  sodiumMg?: number;
  cholesterolMg?: number;
  potassiumMg?: number;
  vitaminAMg?: number;
  vitaminCMg?: number;
  calciumMg?: number;
  ironMg?: number;
  polyunsaturatedFatGrams?: number;
  transFatGrams?: number;
  monounsaturatedFatGrams?: number;
};
// Food Interface
export interface IFoodDocumentType extends Document {
  name: string;
  category?: string[];
  price?: number;
  description?: string;
  availability?: string;
  link?: string;
  image?: string;
  menuName?: string;
  gallery?: string[];
  allergies?: {
    milk?: boolean;
    egg?: boolean;
    wheat?: boolean;
    soy?: boolean;
    fish?: boolean;
    peanuts?: boolean;
    treeNuts?: boolean;
  };
  dietaryPreferences?: {
    glutenFree?: boolean;
    nutFree?: boolean;
    sesame?: boolean;
    vegan?: boolean;
    vegetarian?: boolean;
    halal?: boolean;
    kosher?: boolean;
    mediterranean?: boolean;
    carnivore?: boolean;
    keto?: boolean;
    lowCarb?: boolean;
    paleo?: boolean;
  };
  servingSize?: number;

  // Nutritional Information
  nutritionalInformation?: IFoodNutritionalInformation;

  healthRating?: number;
  tasteRating?: number;
  itemType?: string;
  modifier?: string;

  createdAt?: Date;

  // Review Summary
  reviewSummary?: {
    averageHealthRating: number;
    averageTasteRating: number;
    totalReviews: number;
    totalComments: number;
    votesSummary: {
      calories: number;
      carbs: number;
      protein: number;
    };
  };

  confidence?: {
    nutritionalValues?: number;
    allergies?: number;
    healthRating?: number;
    overall?: number;
  };
}

const foodNutritionalInformationSchema =
  new MongooseSchema<IFoodNutritionalInformation>({
    caloriesKcal: Number,
    totalFatGrams: Number,
    saturatedFatGrams: Number,
    totalCarbsGrams: Number,
    sugarsGrams: Number,
    dietaryFiberGrams: Number,
    proteinGrams: Number,
    sodiumMg: Number,
    cholesterolMg: Number,
    potassiumMg: Number,
    vitaminAMg: Number,
    vitaminCMg: Number,
    calciumMg: Number,
    ironMg: Number,
    polyunsaturatedFatGrams: Number,
    transFatGrams: Number,
    monounsaturatedFatGrams: Number,
  });

// Food Schema
const foodSchema = new MongooseSchema<IFoodDocumentType>({
  name: { type: String, required: true },

  category: [String],
  price: Number,
  description: String,
  availability: String,
  link: String,
  image: String,
  menuName: String,
  gallery: [String],
  allergies: {
    milk: { type: Boolean, default: false },
    egg: { type: Boolean, default: false },
    wheat: { type: Boolean, default: false },
    soy: { type: Boolean, default: false },
    fish: { type: Boolean, default: false },
    peanuts: { type: Boolean, default: false },
    treeNuts: { type: Boolean, default: false },
  },
  dietaryPreferences: {
    glutenFree: { type: Boolean, default: false },
    nutFree: { type: Boolean, default: false },
    sesame: { type: Boolean, default: false },
    vegan: { type: Boolean, default: false },
    vegetarian: { type: Boolean, default: false },
    halal: { type: Boolean, default: false },
    kosher: { type: Boolean, default: false },
    mediterranean: { type: Boolean, default: false },
    carnivore: { type: Boolean, default: false },
    keto: { type: Boolean, default: false },
    lowCarb: { type: Boolean, default: false },
    paleo: { type: Boolean, default: false },
  },
  servingSize: Number,

  // Nutritional Information
  nutritionalInformation: foodNutritionalInformationSchema,
  healthRating: Number,
  tasteRating: Number,
  itemType: String,
  modifier: String,

  reviewSummary: {
    averageHealthRating: { type: Number, default: 0 },
    averageTasteRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },
    votesSummary: {
      calories: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
    },
  },

  confidence: {
    nutritionalValues: Number,
    allergies: Number,
    healthRating: Number,
    overall: Number,
  },

  createdAt: { type: Date, default: Date.now },
});

// Indexes for Food Schema
foodSchema.index({ name: 1 });
foodSchema.index({ healthRating: 1 });
foodSchema.index({ tasteRating: 1 });

foodSchema.index({ "nutritionalInformation.caloriesKcal": 1 });

export const Food: Model<IFoodDocumentType> = mongoose.model<IFoodDocumentType>(
  "Food",
  foodSchema
);

export interface IEatenFood extends Document {
  userId: mongoose.Types.ObjectId;
  foodId: mongoose.Types.ObjectId;
  dateEaten: Date;
  portionSize: number; // in grams or another unit
  calories?: number;
  nutritionalInformation?: IFoodNutritionalInformation;
  foodName?: string;
  source: "AI" | "Restaurant";
}

const EatenFoodSchema = new MongooseSchema<IEatenFood>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food" },

  dateEaten: { type: Date, required: true },
  portionSize: { type: Number, required: true },
  nutritionalInformation: foodNutritionalInformationSchema,
  foodName: { type: String }, // New field for food name
  source: { type: String, enum: ["AI", "Restaurant"], required: true }, // New field for source
});

// Define a virtual field for eatenFoods
EatenFoodSchema.virtual("food", {
  ref: "Food", // The model to use
  localField: "foodId", // The field from the EatenFood schema
  foreignField: "_id", // The field from the Food model
  justOne: true, // Set to false if you expect multiple foods
});

// Enable virtuals to show in JSON output
EatenFoodSchema.set("toJSON", { virtuals: true });
EatenFoodSchema.set("toObject", { virtuals: true });

export const EatenFood = mongoose.model<IEatenFood>(
  "EatenFood",
  EatenFoodSchema
);

EatenFoodSchema.index({ userId: 1, dateEaten: -1 });

interface IOpeningHours {
  dayRange: string;
  sectionHours: {
    startTime: number;
    endTime: number;
    sectionTitle: string;
  }[];
}

// Restaurant Interface
export interface IRestaurantDocumentType extends Document {
  name: string;
  url?: string;
  cuisineType?: string[];
  serviceMode?: string[];
  priceRange?: string;
  locality?: string;
  region?: string;
  postalCode?: string;
  citySlug?: string;

  country?: string;
  street?: string;
  location: {
    type: "Point";
    coordinates: number[];
  };
  telephone?: string;
  rating?: number;
  reviewCount?: number;
  menu: mongoose.Types.ObjectId[];
  description?: string;
  openingHours?: IOpeningHours[]; // Array of opening hours
  status?: string;

  // Social Media Section
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
  };
  heroUrl?: string;
  logo?: string;
  confidence?: number;

  createdAt: Date;
}

const OpeningHoursSchema = new MongooseSchema<IOpeningHours>({
  dayRange: { type: String, required: true }, // Day(s) for the hours
  sectionHours: [
    {
      startTime: { type: Number, required: true }, // Start time in minutes
      endTime: { type: Number, required: true }, // End time in minutes
      sectionTitle: { type: String }, // Optional section title (e.g., "Lunch")
    },
  ],
});

// Restaurant Schema
const RestaurantSchema = new MongooseSchema<IRestaurantDocumentType>({
  name: { type: String, required: true },

  url: String,
  cuisineType: [String],
  priceRange: String,
  locality: String,
  region: String,
  postalCode: String,
  country: String,
  street: String,
  location: {
    type: { type: String, enum: ["Point"], required: true },
    coordinates: { type: [Number], required: true },
  },

  telephone: String,
  rating: Number,
  reviewCount: Number,
  menu: [{ type: mongoose.Schema.Types.ObjectId, ref: "Food" }],
  description: String,

  openingHours: [OpeningHoursSchema], // Store opening hours for each day
  serviceMode: [{ type: String }], // Modes like 'Delivery', 'Pickup'

  status: String,

  // Social Media Section
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    tiktok: String,
    youtube: String,
  },
  heroUrl: String,
  logo: String,

  confidence: Number,

  createdAt: { type: Date, default: Date.now },
});

RestaurantSchema.index({ location: "2dsphere" });
RestaurantSchema.index({ name: 1 });
RestaurantSchema.index({ cuisineType: 1 });
RestaurantSchema.index({ rating: -1 });
// RestaurantSchema.index({ region: 1, locality: 1 });
RestaurantSchema.index({ menu: 1 });

export const Restaurant: Model<IRestaurantDocumentType> =
  mongoose.model<IRestaurantDocumentType>("Restaurant", RestaurantSchema);

// Review Interface
export interface IReviewDocumentType extends Document {
  user: mongoose.Types.ObjectId;
  food: mongoose.Types.ObjectId;
  userName?: string;
  healthRating?: number;
  tasteRating?: number;
  comment?: string;
  images?: string[];
  votes?: {
    calories?: number;
    carbs?: number;
    protein?: number;
  };
  createdAt?: Date;
}

// Review Schema
const reviewSchema = new MongooseSchema<IReviewDocumentType>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  food: { type: mongoose.Schema.Types.ObjectId, ref: "Food" },
  userName: String,
  healthRating: { type: Number },
  tasteRating: { type: Number },
  comment: String,
  images: [String],
  votes: {
    calories: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
});

// Indexes for Review Schema
reviewSchema.index({ user: 1 });
reviewSchema.index({ food: 1 });
reviewSchema.index({ createdAt: 1 });

export const Review: Model<IReviewDocumentType> = mongoose.model(
  "Review",
  reviewSchema
);

// Notification Interface
export interface INotificationDocumentType extends Document {
  userId: mongoose.Types.ObjectId; // Reference to the user receiving the notification
  title?: string; // Title of the notification
  message?: string; // Body message of the notification
  type?: "info" | "warning" | "success" | "error" | "food-review"; // Type of notification
  meta?: string; // Optional link for further action
  link?: string; // Optional link for further action
  isRead: boolean; // Whether the notification has been read
  scheduledTime: Date; // When the notification was created
  createdAt: Date; // When the notification was created
  updatedAt: Date; // When the notification was last updated
}

// Notification Schema
const notificationSchema = new MongooseSchema<INotificationDocumentType>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String },
  message: { type: String },
  type: {
    type: String,
    enum: ["info", "warning", "success", "error", "food-review"],
    default: "info",
  },
  meta: { type: String },
  link: { type: String },
  isRead: { type: Boolean, default: false },
  scheduledTime: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes for Notification Schema
notificationSchema.index({ userId: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ createdAt: -1 });

// Pre-save hook to update `updatedAt` on modification
notificationSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const Notification: Model<INotificationDocumentType> =
  mongoose.model<INotificationDocumentType>("Notification", notificationSchema);

// Water Intake Interface
export interface IWaterIntakeDocumentType extends Document {
  userId: mongoose.Types.ObjectId; // Reference to the user
  date: Date; // Date of the water intake
  amountMl: number; // Amount of water in milliliters
  createdAt: Date; // When the record was created
}

// Water Intake Schema
const waterIntakeSchema = new MongooseSchema<IWaterIntakeDocumentType>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true, default: Date.now },
  amountMl: { type: Number, required: true }, // Amount in milliliters
  createdAt: { type: Date, default: Date.now },
});

// Indexes for Water Intake Schema
waterIntakeSchema.index({ userId: 1, date: -1 });

export const WaterIntake: Model<IWaterIntakeDocumentType> =
  mongoose.model<IWaterIntakeDocumentType>("WaterIntake", waterIntakeSchema);

// Configuration Interface
export interface IConfigurationDocumentType extends Document {
  key: string; // Unique key for the configuration setting
  value: any; // Value of the configuration setting
  description?: string; // Optional description of the setting
  updatedAt: Date; // When the configuration was last updated
}

// Configuration Schema
const configurationSchema = new MongooseSchema<IConfigurationDocumentType>({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  description: { type: String },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-save hook to update `updatedAt` on modification
configurationSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for Configuration Schema
configurationSchema.index({ key: 1 });

export const Configuration: Model<IConfigurationDocumentType> =
  mongoose.model<IConfigurationDocumentType>(
    "Configuration",
    configurationSchema
  );

const uberEatSchema = new MongooseSchema({
  uuid: { type: String, required: true }, // Unique identifier for the restaurant
  name: { type: String, required: true }, // Restaurant name
  slug: { type: String, required: true }, // Slug for the restaurant page
  logo: { type: String }, // URL for the restaurant's logo
  heroUrl: { type: String }, // URL for the restaurant's hero image
  cuisineType: [{ type: String }], // Array of cuisine types
  location: {
    address: { type: String }, // Full address
    streetAddress: { type: String }, // Street address
    city: { type: String }, // City name
    country: { type: String }, // Country code
    postalCode: { type: String }, // Postal/ZIP code
    region: { type: String }, // Region/State
    latitude: { type: Number }, // Latitude coordinate
    longitude: { type: Number }, // Longitude coordinate
    geo: {
      city: { type: String }, // Geo city slug
      country: { type: String }, // Geo country code
      region: { type: String }, // Geo region slug
    },
    locationType: { type: String, default: "DEFAULT" }, // Type of location
  },
  telephone: { type: String }, // Contact telephone number
  rating: {
    ratingValue: { type: Number, default: null }, // Rating value (null if not available)
    reviewCount: { type: String, default: null }, // Review count (null if not available)
  },
  serviceMode: [{ type: String }], // Modes like 'Delivery', 'Pickup'
  link: { type: String }, // Link to the restaurant's UberEats page
  hours: [OpeningHoursSchema],
  menu: [
    {
      title: { type: String, required: true }, // Meal title
      description: { type: String }, // Meal description
      price: { type: Number, required: true }, // Meal price in cents
      image: { type: String }, // Image URL for the meal
      priceTagline: { type: String }, // Price tagline (e.g., "$19.85, 860 - 1270 Cal.")
      link: { type: String }, // Link to the meal's page
    },
  ], // Array of menu items
  migrationStatus: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending", // Migration status: pending or completed
  },
  createdAt: { type: Date, default: Date.now }, // Timestamp of creation
});

export const UberEatsScrapingModel = mongoose.model(
  "scraping-restaurants-to-process",
  uberEatSchema,
  "scraping-restaurants-to-process"
);
