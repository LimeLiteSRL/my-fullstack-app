import { User } from "../models/models";
import { Review } from "../models/models";
import { Food } from "../models/models";
import { Restaurant } from "../models/models";

interface TimeSeriesResult {
  date: string;
  count: number;
}

export const getUsersAddedOverTime = async (
  startDate?: string,
  endDate?: string
): Promise<TimeSeriesResult[]> => {
  const matchStage: any = {};
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) {
      matchStage.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      matchStage.createdAt.$lte = new Date(endDate);
    }
  }

  return await User.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } }, // Sort by date
  ]).exec();
};

export const getFoodsAddedOverTime = async (
  startDate?: string,
  endDate?: string
): Promise<TimeSeriesResult[]> => {
  const matchStage: any = {};
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) {
      matchStage.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      matchStage.createdAt.$lte = new Date(endDate);
    }
  }

  return await Food.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]).exec();
};

export const getEatenFoodsOverTime = async (
  startDate?: string,
  endDate?: string
): Promise<TimeSeriesResult[]> => {
  const matchStage: any = {
    foodsEaten: {
      data: {},
    },
  };
  if (startDate || endDate) {
    matchStage.foodsEaten.date = {};
    if (startDate) {
      matchStage.foodsEaten.date.$gte = new Date(startDate);
    }
    if (endDate) {
      matchStage.foodsEaten.date.$lte = new Date(endDate);
    }
  }

  return await User.aggregate([
    { $unwind: "$foodsEaten" },
    { $match: matchStage },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$foodsEaten.date" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]).exec();
};

export const getRestaurantsAddedOverTime = async (
  startDate?: string,
  endDate?: string
): Promise<TimeSeriesResult[]> => {
  const matchStage: any = {};
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) {
      matchStage.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      matchStage.createdAt.$lte = new Date(endDate);
    }
  }

  return await Restaurant.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]).exec();
};

export const getReviewsOverTime = async (
  startDate?: string,
  endDate?: string
): Promise<TimeSeriesResult[]> => {
  const matchStage: any = {};
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) {
      matchStage.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      matchStage.createdAt.$lte = new Date(endDate);
    }
  }

  return await Review.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]).exec();
};
