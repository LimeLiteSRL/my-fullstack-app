import type { Types } from "mongoose";
import { WaterIntake, type IWaterIntakeDocumentType } from "../models/models";

// Add water intake for a user
export const addWaterIntake = async (
  userId: Types.ObjectId,
  date: Date,
  amountMl: number
): Promise<IWaterIntakeDocumentType> => {
  const waterIntake = new WaterIntake({
    userId,
    date,
    amountMl,
  });

  return await waterIntake.save();
};

export interface IWaterIntakeSummary {
  dailyThisWeek: { [day: string]: number };
  monthly: { [month: string]: number };
  today: number;
  data: IWaterIntakeDocumentType[];
}

export const getWaterIntakeByUserId = async (
  userId: Types.ObjectId,
  startDate?: Date,
  endDate?: Date
): Promise<IWaterIntakeSummary> => {
  const filter: {
    userId: Types.ObjectId;
    date?: { $gte?: Date; $lte?: Date };
  } = { userId };

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = startDate;
    if (endDate) filter.date.$lte = endDate;
  }

  // Get water intake records within the specified range
  const records = await WaterIntake.find(filter).sort({ date: -1 });

  // Get today's UTC date range
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setUTCHours(23, 59, 59, 999);

  // Calculate water intake for today
  const todayIntake = await WaterIntake.aggregate([
    {
      $match: {
        userId,
        date: { $gte: todayStart, $lte: todayEnd },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amountMl" },
      },
    },
  ]);

  // Get the start of the current week (UTC)
  const weekStart = new Date();
  weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay());
  weekStart.setUTCHours(0, 0, 0, 0);

  // Prepopulate weekly placeholders
  const weeklyPlaceholders = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ].reduce((acc, day) => ({ ...acc, [day]: 0 }), {});

  // Calculate daily water intake for the current week
  const weeklyIntake = await WaterIntake.aggregate([
    {
      $match: {
        userId,
        date: { $gte: weekStart },
      },
    },
    {
      $group: {
        _id: { $dayOfWeek: "$date" }, // MongoDB dayOfWeek (1=Sunday, 7=Saturday)
        total: { $sum: "$amountMl" },
      },
    },
  ]);

  // Map weekly results to placeholders
  for (const day of weeklyIntake) {
    const dayIndex = day._id - 1; // Convert MongoDB dayOfWeek to JS index
    //@ts-ignore
    weeklyPlaceholders[Object.keys(weeklyPlaceholders)[dayIndex]] = day.total;
  }

  // Get the start of the last 12 months (UTC)
  const yearStart = new Date();
  yearStart.setUTCMonth(yearStart.getUTCMonth() - 11);
  yearStart.setUTCDate(1);
  yearStart.setUTCHours(0, 0, 0, 0);

  // Prepopulate monthly placeholders
  const monthlyPlaceholders = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ].reduce((acc, month) => ({ ...acc, [month]: 0 }), {});

  // Calculate monthly water intake for the last 12 months
  const monthlyIntake = await WaterIntake.aggregate([
    {
      $match: {
        userId,
        date: { $gte: yearStart },
      },
    },
    {
      $group: {
        _id: { $month: "$date" }, // MongoDB month (1=January, 12=December)
        total: { $sum: "$amountMl" },
      },
    },
  ]);

  // Map monthly results to placeholders
  for (const month of monthlyIntake) {
    const monthIndex = month._id - 1; // Convert MongoDB month to JS index
    const monthName = Object.keys(monthlyPlaceholders)[monthIndex];
    //@ts-ignore
    monthlyPlaceholders[monthName] = month.total;
  }

  return {
    data: records,
    today: todayIntake[0]?.total || 0,
    dailyThisWeek: weeklyPlaceholders,
    monthly: monthlyPlaceholders,
  };
};
// Delete a water intake record by ID
export const deleteWaterIntakeById = async (
  waterIntakeId: Types.ObjectId
): Promise<IWaterIntakeDocumentType | null> => {
  return await WaterIntake.findByIdAndDelete(waterIntakeId);
};

// Update a water intake record by ID
export const updateWaterIntakeById = async (
  waterIntakeId: Types.ObjectId,
  updateData: Partial<IWaterIntakeDocumentType>
): Promise<IWaterIntakeDocumentType | null> => {
  return await WaterIntake.findByIdAndUpdate(waterIntakeId, updateData, {
    new: true,
  });
};
