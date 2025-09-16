import { createController } from "@/create-controller";
import { BackendError } from "@/errors";
import { ReviewDTOSchema } from "@/models/dto";

import * as ReviewService from "@/services/review-service";
import { ObjectIdSchema } from "@/types";

import { z } from "zod";

// Create a new review
const NewReviewRequestSchema = z.object({
  body: ReviewDTOSchema.omit({ id: true }),
});
``;
export const createReviewController = createController(
  NewReviewRequestSchema,
  async (req, res) => {
    const result = await ReviewService.createReview(req.body);
    res.json({ data: result });
  }
);

// Get a review by its ID
const GetReviewByIdRequestSchema = z.object({
  params: z.object({
    id: ObjectIdSchema,
  }),
});

export const getReviewByIdController = createController(
  GetReviewByIdRequestSchema,
  async (req, res) => {
    const result = await ReviewService.getReviewById(req.params.id);

    if (!result) {
      res.json(new BackendError("NOT_FOUND", { message: "Review not found" }));
      return;
    }
    res.json({ data: result });
  }
);

// Get all reviews for a specific user
const GetReviewsByUserRequestSchema = z.object({
  params: z.object({
    userId: ObjectIdSchema,
  }),
});

export const getReviewsByUserController = createController(
  GetReviewsByUserRequestSchema,
  async (req, res) => {
    const result = await ReviewService.getReviewsByUser(req.params.userId);
    res.json({ data: result });
  }
);

// Get all reviews for a specific food item
const GetReviewsByFoodRequestSchema = z.object({
  params: z.object({
    foodId: ObjectIdSchema,
  }),
});

export const getReviewsByFoodController = createController(
  GetReviewsByFoodRequestSchema,
  async (req, res) => {
    const result = await ReviewService.getReviewsByFood(req.params.foodId);
    res.json({ data: result });
  }
);

// Update a review by its ID
const UpdateReviewRequestSchema = z.object({
  params: z.object({
    id: ObjectIdSchema,
  }),
  body: ReviewDTOSchema.partial(),
});

export const updateReviewController = createController(
  UpdateReviewRequestSchema,
  async (req, res) => {
    const result = await ReviewService.updateReview(req.params.id, req.body);

    if (!result) {
      res.json(new BackendError("NOT_FOUND", { message: "Review not found" }));
      return;
    }
    res.json({ data: result });
  }
);

// Delete a review by its ID
const DeleteReviewRequestSchema = z.object({
  params: z.object({
    id: ObjectIdSchema,
  }),
});

export const deleteReviewController = createController(
  DeleteReviewRequestSchema,
  async (req, res) => {
    const result = await ReviewService.deleteReview(req.params.id);

    if (!result) {
      res.json(new BackendError("NOT_FOUND", { message: "Review not found" }));
      return;
    }
    res.json({ data: result });
  }
);
