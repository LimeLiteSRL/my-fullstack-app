import { createController } from "@/create-controller";
import { BackendError } from "@/errors";
import { UserDTOSchema } from "@/models/dto";

import * as UserService from "@/services/user-services";
import { ObjectIdSchema } from "@/types";
import { Types } from "mongoose";

import { z } from "zod";

// Define the request schema
const GetAllUsersWithPaginationRequestSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .refine((val) => !isNaN(Number(val)), {
        message: "Page must be a number",
      })
      .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z
      .string()
      .optional()
      .refine((val) => !isNaN(Number(val)), {
        message: "Limit must be a number",
      })
      .transform((val) => (val ? parseInt(val, 10) : 10)),
  }),
});

// Create the controller
export const getAllUsersWithPaginationController = createController(
  GetAllUsersWithPaginationRequestSchema,
  async (req, res) => {
    const { page, limit } = req.query;
    const result = await UserService.getAllUsersWithPagination(page, limit);
    res.json(result);
  }
);

// Create a new user
const NewUserRequestSchema = z.object({
  body: UserDTOSchema.partial(),
});

export const createUserController = createController(
  NewUserRequestSchema,
  async (req, res) => {
    const { dateOfBirth, ...rest } = req.body;

    const result = await UserService.createUser({
      ...rest,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    });
    res.json({ data: result });
  }
);

// Get a user by ID
const GetUserByIdRequestSchema = z.object({
  params: z.object({
    id: ObjectIdSchema,
  }),
});

export const getUserByIdController = createController(
  GetUserByIdRequestSchema,
  async (req, res) => {
    const result = await UserService.getUserById(
      new Types.ObjectId(new Types.ObjectId(req.params.id))
    );

    if (!result) {
      res.json(new BackendError("NOT_FOUND", { message: "User not found" }));
      return;
    }
    res.json({ data: result });
  }
);

// Get a user by username
const GetUserByUsernameRequestSchema = z.object({
  params: z.object({
    username: z.string(),
  }),
});

export const getUserByUsernameController = createController(
  GetUserByUsernameRequestSchema,
  async (req, res) => {
    const result = await UserService.getUserByUsername(req.params.username);

    if (!result) {
      res.json(new BackendError("NOT_FOUND", { message: "User not found" }));
      return;
    }
    res.json({ data: result });
  }
);

// Update a user by ID
const UpdateUserByIdRequestSchema = z.object({
  params: z.object({
    id: ObjectIdSchema,
  }),
  body: UserDTOSchema,
});

export const updateUserByIdController = createController(
  UpdateUserByIdRequestSchema,
  async (req, res) => {
    const { dateOfBirth, ...rest } = req.body;

    const result = await UserService.updateUserById(
      new Types.ObjectId(req.params.id),
      {
        ...rest,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      }
    );

    if (!result) {
      res.json(new BackendError("NOT_FOUND", { message: "User not found" }));
      return;
    }
    res.json({ data: result });
  }
);

// Delete a user by ID
const DeleteUserByIdRequestSchema = z.object({
  params: z.object({
    id: ObjectIdSchema,
  }),
});

export const deleteUserByIdController = createController(
  DeleteUserByIdRequestSchema,
  async (req, res) => {
    const result = await UserService.deleteUserById(
      new Types.ObjectId(req.params.id)
    );

    if (!result) {
      res.json(new BackendError("NOT_FOUND", { message: "User not found" }));
      return;
    }
    res.json({ data: result });
  }
);

// Add review to user's reviews
const AddReviewToUserRequestSchema = z.object({
  params: z.object({
    userId: ObjectIdSchema,
    reviewId: ObjectIdSchema,
  }),
});

export const addReviewToUserController = createController(
  AddReviewToUserRequestSchema,
  async (req, res) => {
    const result = await UserService.addReviewToUser(
      new Types.ObjectId(req.params.userId),
      new Types.ObjectId(req.params.reviewId)
    );

    if (!result) {
      res.json(
        new BackendError("NOT_FOUND", { message: "User or Review not found" })
      );
      return;
    }
    res.json({ data: result });
  }
);

// Define request schema
const LoginWithGoogleRequestSchema = z.object({
  body: z.object({
    token: z.string(), // Expect Google token from client
  }),
});

// Google login controller
export const loginUserWithGoogleController = createController(
  LoginWithGoogleRequestSchema,
  async (req, res) => {
    const user = await UserService.googleLogin(req.body.token);

    if (!user) {
      res.json(
        new BackendError("NOT_ACCEPTABLE", { message: "Invalid Google token" })
      );
      return;
    }

    res.json({ data: user });
  }
);
