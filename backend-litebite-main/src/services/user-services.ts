import { BackendError } from "@/errors";
import {
  EatenFood,
  Food,
  Review,
  User,
  type IReviewDocumentType,
  type IUserDocumentType,
} from "../models/models";
import { Types } from "mongoose";

import jwt from "jsonwebtoken";
import { createVerification, createVerificationCheck } from "./twillo";
import consola from "consola";
import type { INutritionalInformation } from "@/models/dto";
import axios from "axios";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // Use a secure key from env vars

export const generateToken = ({
  phone,
  role,
  email,
}: {
  email: string | undefined;
  phone: string | undefined;
  role: string | undefined;
}): string => {
  const token = jwt.sign(
    { phone, role, email }, // Payload (you can include more data here if needed)
    JWT_SECRET // Secret key
  );
  return token;
};

/**
 * Google login function
 * @param googleToken - The Google ID token received from the frontend
 * @returns An object containing the user's JWT token and new user flag
 */
export const googleLogin = async (googleToken: string) => {
  // Verify Google token and retrieve user information from Google
  const response = await axios.get(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${googleToken}`
  );

  const { email, name, picture } = response.data;

  if (!email) {
    throw new BackendError("BAD_REQUEST", {
      message: "Invalid Google token.",
    });
  }

  // Find or create a user in the database
  let user: IUserDocumentType | null = await User.findOne({ email });

  if (!user) {
    // Create a new user if it doesn't exist
    user = new User({
      email,
      name,
      profilePicture: picture,
      createdAt: new Date(),
      // Add any other default fields here as needed
    });
    await user.save();
  }

  // Generate a JWT token for the user
  const token = generateToken({
    phone: user.phone,
    role: user.role,
    email: email,
  });

  return { token, newUser: !user.createdAt };
};

// Login or register by OTP via SMS
export const SendCodeByOTPViaSMS = async (phone: string) => {
  await User.findOneAndUpdate(
    { phone }, // Query to find the user
    {
      // Update fields (add your necessary fields here)
      $setOnInsert: {
        phone, // Set the phone if the document is being inserted
        createdAt: new Date(), // Set createdAt when inserting
        // Add other default fields for a new user if needed
      },
      // You can also add $set for other fields if you want to update them
      // $set: { someField: someValue } // Use this if you want to update existing fields
    },
    { new: true, upsert: true } // Return the new user document, and create if it doesn't exist
  );
  const status = await createVerification(phone);

  if (status === "error") {
    throw new BackendError("NOT_ACCEPTABLE");
  }

  if (status !== "pending") {
    throw new BackendError("INTERNAL_ERROR");
  }
};

// Request OTP login or registration via SMS
export const verifyCode = async (phone: string, code: string) => {
  const user = await User.findOne({ phone });

  if (!user) {
    throw new BackendError("UNAUTHORIZED", { message: "Invalid OTP" });
  }

  const isValid = await createVerificationCheck(phone, code);

  if (!isValid) {
    throw new BackendError("UNAUTHORIZED", { message: "Invalid OTP" });
  }

  if (!user.phoneVerifiedAt) {
    await User.findOneAndUpdate(
      { phone: phone },
      {
        phoneVerifiedAt: new Date(), // Set the current time as verification time
      }
    );
  }

  return {
    token: generateToken({
      phone: user.phone,
      role: user.role,
      email: user.email,
    }),
    newUser: !user.phoneVerifiedAt,
  };
};

interface GetEatenFoodOptions {
  userId: Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
}

export const getEatenFoodByUserId = async ({
  userId,
  startDate,
  endDate,
}: GetEatenFoodOptions) => {
  // Create a filter object
  const filter: {
    userId: Types.ObjectId;
    dateEaten?: { $gte?: Date; $lte?: Date };
  } = {
    userId,
  };

  // Add date range filter if specified
  if (startDate || endDate) {
    filter.dateEaten = {};
    if (startDate) {
      filter.dateEaten.$gte = startDate;
    }
    if (endDate) {
      filter.dateEaten.$lte = endDate;
    }
  }

  return await EatenFood.find(filter).populate({
    path: "food", // The virtual field to populate
  });
};

export const getUserByIdentifier = async (identifier: string | undefined) => {
  if (!identifier) {
    throw new BackendError("USER_NOT_FOUND");
  }
  return await User.findOne({
    $or: [{ phone: identifier }, { email: identifier }],
  });
};

interface PaginatedResult {
  data: IUserDocumentType[];
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
  };
}

export const getAllUsersWithPagination = async (
  page: number,
  limit: number
): Promise<PaginatedResult> => {
  const totalItems = await User.countDocuments();
  const data = await User.find()
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    data: data,
    meta: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: +page,
    },
  };
};

// Create a new user
export const createUser = async (
  userData: Partial<IUserDocumentType>
): Promise<IUserDocumentType> => {
  const user = new User(userData);
  return await user.save();
};

// Get a user by ID
export const getUserById = async (
  userId: Types.ObjectId
): Promise<IUserDocumentType | null> => {
  return await User.findById(userId).populate("foodsEaten reviews");
};

// Get a user by username
export const getUserByUsername = async (
  username: string
): Promise<IUserDocumentType | null> => {
  return await User.findOne({ username }).populate("foodsEaten reviews");
};

// Update a user by phone
export const updateUserByIdentifier = async (
  identifier: string | undefined,
  updateData: Partial<IUserDocumentType>
): Promise<IUserDocumentType | null> => {
  return await User.findOneAndUpdate(
    { $or: [{ phone: identifier }, { email: identifier }] },
    updateData,
    { new: true }
  );
};
// Update a user by ID
export const updateUserById = async (
  userId: Types.ObjectId,
  updateData: Partial<IUserDocumentType>
): Promise<IUserDocumentType | null> => {
  return await User.findByIdAndUpdate(userId, updateData, { new: true });
};

// Delete a user by ID
export const deleteUserById = async (
  userId: Types.ObjectId
): Promise<IUserDocumentType | null> => {
  return await User.findByIdAndDelete(userId);
};

// Add food to user's foodsEaten with portion and nutritional info
export const addRestaurantFoodToProfile = async (
  identifier: string | undefined,
  foodId: Types.ObjectId,
  portionSize: number
): Promise<IUserDocumentType | null> => {
  // Find user by phone
  const user = await getUserByIdentifier(identifier);
  const food = await Food.findById(foodId).select("nutritionalInformation");

  if (!user || !food) {
    return null;
  }

  // Create a new EatenFood record
  const newEatenFood = new EatenFood({
    userId: user.id,
    foodId: food.id,
    dateEaten: new Date(),
    portionSize,
    nutritionalInformation: food.nutritionalInformation,
    source: "Restaurant",
  });

  await newEatenFood.save();

  // Push the new eaten food ID to the user's foodsEaten array
  user.foodsEaten.push(newEatenFood.id);
  await user.save();

  return user;
};

// Add food to user's foodsEaten with portion and nutritional info
export const addAiFoodToProfile = async (
  identifier: string | undefined,
  nutritionalInformation: INutritionalInformation,
  portionSize: number,
  foodName: string
): Promise<IUserDocumentType | null> => {
  // Find user by phone
  const user = await getUserByIdentifier(identifier);

  if (!user) {
    return null;
  }

  // Create a new EatenFood record
  const newEatenFood = new EatenFood({
    userId: user.id,
    dateEaten: new Date(),
    foodName,
    portionSize,
    nutritionalInformation,
    source: "AI",
  });

  await newEatenFood.save();

  // Push the new eaten food ID to the user's foodsEaten array
  user.foodsEaten.push(newEatenFood.id);
  await user.save();

  return user;
};

export const deleteEatenFoodFromProfile = async (
  identifier: string | undefined,
  eatenFoodId: string
): Promise<IUserDocumentType | null> => {
  // Find user by phone
  const user = await getUserByIdentifier(identifier);

  if (!user) {
    return null;
  }

  // Find the EatenFood record by ID
  const eatenFood = await EatenFood.findById(eatenFoodId);

  if (!eatenFood || eatenFood.userId.toString() !== user.id.toString()) {
    throw new BackendError("BAD_REQUEST", { message: "eaten food not found" });
  }

  // Remove the EatenFood record
  await EatenFood.deleteOne({ _id: eatenFoodId });

  // Remove the eaten food ID from the user's foodsEaten array
  await User.updateOne(
    { _id: user.id },
    { $pull: { foodsEaten: eatenFoodId } }
  );

  return user;
};

// Add review to user's reviews
export const addReviewToUser = async (
  userId: Types.ObjectId,
  reviewId: Types.ObjectId
): Promise<IUserDocumentType | null> => {
  return await User.findByIdAndUpdate(
    userId,
    { $push: { reviews: reviewId } },
    { new: true }
  );
};

// Update botCustomization for a user
export const safeUpdateBotCustomizationByUserId = async (
  id: Types.ObjectId, // Identifier (phone number) of the user
  botCustomizationArray: string[] // Array of "key:value" strings
) => {
  try {
    // Convert the array to an object
    const botCustomizationObj = botCustomizationArray.reduce((acc, item) => {
      const [key, value] = item.split(":");
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>); // Ensure the object type is correct

    // Find the existing user
    const user = await User.findById(id);

    if (!user) {
      return { result: "User not found" };
    }

    const obj = Object.fromEntries(user.botCustomization || new Map());

    // Merge existing botCustomization with the new one
    const updatedBotCustomization = {
      ...obj, // Existing customizations
      ...botCustomizationObj, // New/updated customizations
    };

    // Update the user's botCustomization field with the merged data
    await User.findByIdAndUpdate(id, {
      $set: { botCustomization: updatedBotCustomization },
    });

    return { result: "Bot customization saved successfully" };
  } catch (error) {
    consola.error(error);

    return { result: "Something went wrong" };
  }
};

interface UpdateUserArraysInput {
  id: Types.ObjectId;
  preferences?: string[];
  allergies?: string[];
  dietaryPreferences?: string[];
  goals?: string[];
  reminders?: string[];
}
// Push arrays to user document if they don't already exist
export const safeUpdateUserPreferences = async ({
  id,
  preferences,
  allergies,
  dietaryPreferences,
  goals,
  reminders,
}: UpdateUserArraysInput) => {
  try {
    const updateFields: Record<string, any> = {};

    // Add fields to be updated only if they are provided
    if (preferences) {
      updateFields.preferences = { $each: preferences };
    }
    if (allergies) {
      updateFields.allergies = { $each: allergies };
    }
    if (dietaryPreferences) {
      updateFields.dietaryPreferences = { $each: dietaryPreferences };
    }
    if (goals) {
      updateFields.goals = { $each: goals };
    }
    if (reminders) {
      updateFields.reminders = { $each: reminders };
    }

    // Use $addToSet to ensure that only unique items are added to each array
    await User.findOneAndUpdate(
      { _id: id }, // Find user by phone
      { $addToSet: updateFields }, // Add to each array without duplicates
      { new: true } // Return the updated user document
    );

    return { result: "User Preferences saved successfully" };
  } catch (error) {
    consola.error(error);
    return { result: "Something went wrong" };
  }
};



















