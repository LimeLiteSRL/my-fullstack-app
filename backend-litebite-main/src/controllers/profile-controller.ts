import { createController } from "@/create-controller";
import { BackendError } from "@/errors";
import { calculateNutritionIntake } from "@/helpers/calculate-nutrition-intake";
// import { calculateNutritionIntake } from "@/helpers/calculate-nutrition-intake";
import { NutritionalInformationSchema, UserDTOSchema } from "@/models/dto";

import * as ReviewService from "@/services/review-service";
import * as UserService from "@/services/user-services";
import * as NotificationService from "@/services/notification-service";
import * as WaterIntakeService from "@/services/water-intake-service";
import { uploadToS3 } from "@/services/storage-service";
import formidable from "formidable";

import fs from "fs";
import * as path from "path";

import { ObjectIdSchema } from "@/types";
import { Types } from "mongoose";

import { z } from "zod";
import { subMonths } from "date-fns";

// Function to check if a number is a valid hour (0-23) or minute (0-59)
const isValidHour = (hour: number) => hour >= -23 && hour <= 23;
const isValidMinute = (minute: number) => minute >= 0 && minute <= 59;

const offsetSchema = z.string().refine(
  (offset) => {
    const parts = offset.split(":");
    if (parts.length !== 2) return false;

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    return isValidHour(hours) && isValidMinute(minutes);
  },
  {
    message:
      "Offset must be in the format HH:MM or -HH:MM, with valid hours and minutes",
  }
);

const GetUserProfileRequestSchema = z.object({
  query: z.object({
    timezoneOffset: offsetSchema,
  }),
  user: z.object({
    phone: z.string().optional(),
    email: z.string().optional(),
  }),
});

export const getProfileController = createController(
  GetUserProfileRequestSchema,
  async (req, res) => {
    const phone = req.user?.phone;
    const email = req.user?.email;

    const user = await UserService.getUserByIdentifier(phone || email);

    const startDate = subMonths(new Date(), 1);
    const eatenFoods = await UserService.getEatenFoodByUserId({
      userId: user?.id,
      startDate,
    });

    const nutritionalInformation = calculateNutritionIntake(
      eatenFoods || [],
      [
        "caloriesKcal",
        "totalFatGrams",
        "saturatedFatGrams",
        "totalCarbsGrams",
        "sugarsGrams",
        "dietaryFiberGrams",
        "proteinGrams",
        "sodiumMg",
        "cholesterolMg",
        "potassiumMg",
        "vitaminAMg",
        "vitaminCMg",
        "calciumMg",
        "ironMg",
        "polyunsaturatedFatGrams",
        "transFatGrams",
        "monounsaturatedFatGrams",
      ],
      req.query.timezoneOffset
    );

    if (!user) {
      res.json(new BackendError("USER_NOT_FOUND"));
      return;
    }
    res.json({ user, nutritionalInformation });
  }
);

// Get a user by mobile number
const GetEatenFoodsRequestSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  user: z.object({
    phone: z.string().optional(),
    email: z.string().optional(),
  }),
});

export const getProfileEatenFoodsController = createController(
  GetEatenFoodsRequestSchema,
  async (req, res) => {
    const phone = req.user?.phone;
    const email = req.user?.email;

    const { startDate, endDate } = req.query;

    const user = await UserService.getUserByIdentifier(phone || email);

    // Convert startDate and endDate to Date objects if provided
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const eatenFoods = await UserService.getEatenFoodByUserId({
      userId: user?.id,
      endDate: end,
      startDate: start,
    });

    res.json({ eatenFoods });
  }
);

const UpdateUserProfileSchema = z.object({
  body: UserDTOSchema.omit({ email: true, phone: true }).partial(),
  user: z.object({
    phone: z.string().optional(),
    email: z.string().optional(),
  }),
});

export const updateUserProfileController = createController(
  UpdateUserProfileSchema,
  async (req, res) => {
    // @ts-ignore
    const phone = req.user?.phone;
    // @ts-ignore
    const email = req.user?.email;

    const { dateOfBirth, ...rest } = req.body;

    const result = await UserService.updateUserByIdentifier(phone || email, {
      ...rest,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    });

    if (!result) {
      res.json(new BackendError("NOT_FOUND", { message: "User not found" }));
      return;
    }
    res.json({ data: result });
  }
);

// Add food to user's foodsEaten
const AddRestaurantFoodToProfileRequestSchema = z.object({
  body: z.object({
    foodId: ObjectIdSchema,
    portionSize: z.number(),
  }),
  user: z.object({
    phone: z.string().optional(),
    email: z.string().optional(),
  }),
});

export const addRestaurantFoodToProfileController = createController(
  AddRestaurantFoodToProfileRequestSchema,
  async (req, res) => {
    const phone = req.user?.phone;
    const email = req.user?.email;

    const result = await UserService.addRestaurantFoodToProfile(
      phone || email,
      new Types.ObjectId(req.body.foodId),
      req.body.portionSize
    );

    const oneHourLater = new Date(Date.now() + 3600000); // 1 hour in milliseconds

    await NotificationService.createNotification({
      userId: result?.id,
      scheduledTime: oneHourLater,
      type: "food-review",
      meta: req.body.foodId.toString(),
      isRead: false,
    });

    if (!result) {
      res.json(
        new BackendError("NOT_FOUND", { message: "User or Food not found" })
      );
      return;
    }
    res.json({ data: result });
  }
);

// Add food to user's foodsEaten
const AddAiFoodToProfileRequestSchema = z.object({
  body: z.object({
    nutritionalInformation: NutritionalInformationSchema.partial(),
    portionSize: z.number(),
    foodName: z.string(),
  }),
  user: z.object({
    phone: z.string().optional(),
    email: z.string().optional(),
  }),
});

export const addAiFoodToProfileController = createController(
  AddAiFoodToProfileRequestSchema,
  async (req, res) => {
    const phone = req.user?.phone;
    const email = req.user?.email;

    const result = await UserService.addAiFoodToProfile(
      phone || email,
      req.body.nutritionalInformation,
      req.body.portionSize,
      req.body.foodName
    );

    if (!result) {
      res.json(
        new BackendError("NOT_FOUND", { message: "User or Food not found" })
      );
      return;
    }
    res.json({ data: result });
  }
);

// Define the request schema
const DeleteEatenFoodFromProfileRequestSchema = z.object({
  params: z.object({
    eatenFoodId: z.string(),
  }),
  user: z.object({
    phone: z.string().optional(),
    email: z.string().optional(),
  }),
});

// Create the controller
export const deleteEatenFoodFromProfileController = createController(
  DeleteEatenFoodFromProfileRequestSchema,
  async (req, res) => {
    const phone = req.user?.phone;
    const email = req.user?.email;
    const { eatenFoodId } = req.params;

    const result = await UserService.deleteEatenFoodFromProfile(
      phone || email,
      eatenFoodId
    );

    if (!result) {
      res.json(
        new BackendError("NOT_FOUND", { message: "User or Food not found" })
      );
      return;
    }

    res.json({ data: result });
  }
);

// Request schema for writing a review
const WriteReviewRequestSchema = z.object({
  body: z.object({
    foodId: ObjectIdSchema,
    healthRating: z.number().optional(),
    tasteRating: z.number().optional(),
    comment: z.string().optional(),
    images: z.array(z.string()).optional(),
    votes: z
      .object({
        calories: z.number(),
        carbs: z.number(),
        protein: z.number(),
      })
      .optional(),
  }),
  user: z.object({
    phone: z.string().optional(),
    email: z.string().optional(),
  }),
});

export const writeReviewController = createController(
  WriteReviewRequestSchema,
  async (req, res) => {
    const phone = req.user?.phone;
    const email = req.user?.email;

    const user = await UserService.getUserByIdentifier(phone || email);

    if (!user?.id) {
      res.json(new BackendError("USER_NOT_FOUND"));
      return;
    }

    const result = await ReviewService.createUserReview(
      new Types.ObjectId(user?.id),
      new Types.ObjectId(req.body.foodId),
      req.body.healthRating,
      req.body.tasteRating,
      req.body.comment,

      req.body.images || [],
      req.body.votes || { calories: 0, carbs: 0, protein: 0 },
      user.name
    );

    if (!result) {
      res.json(
        new BackendError("NOT_FOUND", { message: "Review creation failed" })
      );
      return;
    }

    res.json({ data: result });
  }
);

// Get all notifications for the authenticated user
export const getAllNotificationsController = createController(
  z.object({
    user: z.object({
      phone: z.string().optional(),
      email: z.string().optional(),
    }),
  }),
  async (req, res) => {
    // @ts-ignore
    const phone = req.user?.phone;
    const email = req.user?.email;

    const user = await UserService.getUserByIdentifier(phone || email || "");

    if (!user?.id) {
      res.json(new BackendError("USER_NOT_FOUND"));
      return;
    }

    // Fetch all notifications for the user
    const notifications = await NotificationService.getNotifications(
      new Types.ObjectId(user.id)
    );

    // If no notifications are found
    if (!notifications || notifications.length === 0) {
      res.json({ message: "No notifications found", data: [] });
      return;
    }

    // Return the notifications
    res.json({ data: notifications });
  }
);

// Mark all notifications as read
export const markAllNotificationsAsReadController = createController(
  z.object({
    user: z.object({
      phone: z.string().optional(),
      email: z.string().optional(),
    }),
  }),
  async (req, res) => {
    const phone = req.user?.phone;
    const email = req.user?.email;

    const user = await UserService.getUserByIdentifier(phone || email);

    if (!user?.id) {
      res.json(new BackendError("USER_NOT_FOUND"));
      return;
    }

    await NotificationService.markAllNotificationsAsRead(
      new Types.ObjectId(user.id)
    );
    res.json({ message: "All notifications marked as read" });
  }
);

// Mark a specific notification as read by ID
const MarkNotificationAsReadByIdRequestSchema = z.object({
  params: z.object({
    notificationId: ObjectIdSchema,
  }),
  user: z.object({
    phone: z.string().optional(),
    email: z.string().optional(),
  }),
});

export const markNotificationAsReadByIdController = createController(
  MarkNotificationAsReadByIdRequestSchema,
  async (req, res) => {
    const { notificationId } = req.params;

    const phone = req.user?.phone;
    const email = req.user?.email;

    const user = await UserService.getUserByIdentifier(phone || email || "");

    const result = await NotificationService.markNotificationAsReadById(
      new Types.ObjectId(notificationId)
    );

    if (!result) {
      res.json(
        new BackendError("NOT_FOUND", { message: "Notification not found" })
      );
      return;
    }

    res.json({ message: "Notification marked as read" });
  }
);

const AddWaterIntakeRequestSchema = z.object({
  body: z.object({
    date: z.string(), // Date in ISO format
    amountMl: z.number(), // Amount in milliliters
  }),
  user: z.object({
    phone: z.string().optional(),
    email: z.string().optional(),
  }),
});

export const addWaterIntakeController = createController(
  AddWaterIntakeRequestSchema,
  async (req, res) => {
    const phone = req.user?.phone;
    const email = req.user?.email;

    const user = await UserService.getUserByIdentifier(phone || email);

    if (!user?.id) {
      res.json(new BackendError("USER_NOT_FOUND"));
      return;
    }

    const result = await WaterIntakeService.addWaterIntake(
      new Types.ObjectId(user.id),
      new Date(req.body.date),
      req.body.amountMl
    );

    res.json({ data: result });
  }
);

// Get water intake for a user
const GetWaterIntakeRequestSchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
  user: z.object({
    phone: z.string().optional(),
    email: z.string().optional(),
  }),
});

export const getWaterIntakeController = createController(
  GetWaterIntakeRequestSchema,
  async (req, res) => {
    const phone = req.user?.phone;
    const email = req.user?.email;

    const user = await UserService.getUserByIdentifier(phone || email);

    if (!user?.id) {
      res.json(new BackendError("USER_NOT_FOUND"));
      return;
    }

    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const waterIntake = await WaterIntakeService.getWaterIntakeByUserId(
      new Types.ObjectId(user.id),
      start,
      end
    );

    res.json(waterIntake);
  }
);

const UploadProfileImageRequestSchema = z.object({
  file: z.any(),
  // file: z.custom<File>((val) => val instanceof Object && val.originalname), // File validation
  user: z.object({
    phone: z.string().optional(),
    email: z.string().optional(),
  }),
});

export const uploadProfileImageController = createController(
  UploadProfileImageRequestSchema,
  async (req, res) => {
    const phone = req.user?.phone;
    const email = req.user?.email;

    const form = formidable({
      keepExtensions: true,
      maxFileSize: 2 * 1024 * 1024,
      filter(part) {
        return Boolean(part.mimetype && part.mimetype.includes("image"));
      },
      maxFiles: 1,
    });

    const user = await UserService.getUserByIdentifier(phone || email);

    if (!user?.id) {
      res.json(new BackendError("USER_NOT_FOUND"));
      return;
    }

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing form data:", err);

        throw new BackendError("BAD_REQUEST");
      }

      // Access the uploaded file
      const uploadedFile = files.file?.[0];
      if (!uploadedFile) {
        throw new BackendError("BAD_REQUEST");
      }

      const fileStream = fs.createReadStream(uploadedFile.filepath); // Create a file stream

      const newUrl = await uploadToS3(
        `user/${user?._id}/profile${path.extname(
          uploadedFile.originalFilename || "jpg"
        )}`,
        fileStream,
        uploadedFile.mimetype || "application/octet-stream"
      );

      // Clean up the temporary file after successful upload
      fs.unlinkSync(uploadedFile.filepath);

      await UserService.updateUserById(user.id, { profilePicture: newUrl });

      // Respond with the S3 file URL
      res.status(200).send({
        message: "File uploaded successfully!",
      });
    });
  }
);
