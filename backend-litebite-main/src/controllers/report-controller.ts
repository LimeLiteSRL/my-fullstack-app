import { createController } from "@/create-controller";
import * as ReportService from "@/services/report-service";
import { z } from "zod";

// Get users added over time
const GetUsersAddedOverTimeRequestSchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export const getUsersAddedOverTimeController = createController(
  GetUsersAddedOverTimeRequestSchema,
  async (req, res) => {
    const { startDate, endDate } = req.query;
    const result = await ReportService.getUsersAddedOverTime(startDate, endDate);
    res.json({ data: result });
  }
);

// Get foods added over time
const GetFoodsAddedOverTimeRequestSchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export const getFoodsAddedOverTimeController = createController(
  GetFoodsAddedOverTimeRequestSchema,
  async (req, res) => {
    const { startDate, endDate } = req.query;
    const result = await ReportService.getFoodsAddedOverTime(startDate, endDate);
    res.json({ data: result });
  }
);

// Get eaten foods added over time
const GetEatenFoodsAddedOverTimeRequestSchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export const getEatenFoodsAddedOverTimeController = createController(
  GetEatenFoodsAddedOverTimeRequestSchema,
  async (req, res) => {
    const { startDate, endDate } = req.query;
    const result = await ReportService.getEatenFoodsOverTime(startDate, endDate);
    res.json({ data: result });
  }
);

// Get restaurants added over time
const GetRestaurantsAddedOverTimeRequestSchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export const getRestaurantsAddedOverTimeController = createController(
  GetRestaurantsAddedOverTimeRequestSchema,
  async (req, res) => {
    const { startDate, endDate } = req.query;
    const result = await ReportService.getRestaurantsAddedOverTime(startDate, endDate);
    res.json({ data: result });
  }
);

// Get reviews over time
const GetReviewsAddedOverTimeRequestSchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export const getReviewsAddedOverTimeController = createController(
  GetReviewsAddedOverTimeRequestSchema,
  async (req, res) => {
    const { startDate, endDate } = req.query;
    const result = await ReportService.getReviewsOverTime(startDate, endDate);
    res.json({ data: result });
  }
);
