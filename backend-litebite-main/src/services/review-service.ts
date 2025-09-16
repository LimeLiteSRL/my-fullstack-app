import { Food, Review, type IReviewDocumentType } from "@/models/models"; // Adjust the path as needed
import type mongoose from "mongoose";

// Create a new review
export const createReview = async (
  reviewData: Partial<IReviewDocumentType>
): Promise<IReviewDocumentType> => {
  const review = new Review(reviewData);
  return await review.save();
};

// Get a review by its ID
export const getReviewById = async (
  reviewId: mongoose.Types.ObjectId
): Promise<IReviewDocumentType | null> => {
  return await Review.findById(reviewId);
};

// Get all reviews for a specific user
export const getReviewsByUser = async (
  userId: mongoose.Types.ObjectId
): Promise<IReviewDocumentType[]> => {
  return await Review.find({ user: userId });
};

// Get all reviews for a specific food item
export const getReviewsByFood = async (
  foodId: mongoose.Types.ObjectId
): Promise<IReviewDocumentType[]> => {
  return await Review.find({ food: foodId });
};

// Update a review by its ID
export const updateReview = async (
  reviewId: mongoose.Types.ObjectId,
  updateData: Partial<IReviewDocumentType>
): Promise<IReviewDocumentType | null> => {
  const updatedReview = await Review.findByIdAndUpdate(reviewId, updateData, {
    new: true,
  });
  if (updatedReview) {
    await updateReviewSummary(updatedReview.food);
  }
  return updatedReview;
};

// Delete a review by its ID
export const deleteReview = async (
  reviewId: mongoose.Types.ObjectId
): Promise<IReviewDocumentType | null> => {
  const deletedReview = await Review.findByIdAndDelete(reviewId);
  if (deletedReview) {
    await updateReviewSummary(deletedReview.food);
  }
  return deletedReview;
};

// Add a review for a food item by a user
export const createUserReview = async (
  userId: mongoose.Types.ObjectId,
  foodId: mongoose.Types.ObjectId,
  healthRating?: number,
  tasteRating?: number,
  comment?: string,
  images?: string[],
  votes?: { calories: number; carbs: number; protein: number },
  userName?:string
): Promise<IReviewDocumentType | null> => {
  // Create a new review record
  const newReview = new Review({
    user: userId,
    food: foodId,
    healthRating,
    tasteRating,
    comment,
    images,
    votes,
    userName,
    createdAt: new Date(),
  });

  await newReview.save();
  await updateReviewSummary(foodId);

  return newReview; // Return the created review
};

// Update review summary for a specific food item
export const updateReviewSummary = async (foodId: mongoose.Types.ObjectId) => {
  const summary = await Review.aggregate([
    { $match: { food: foodId } },
    {
      $group: {
        _id: "$food",
        averageHealthRating: { $avg: "$healthRating" },
        averageTasteRating: { $avg: "$tasteRating" },
        totalReviews: { $sum: 1 },
        totalComments: {
          $sum: { $cond: [{ $ifNull: ["$comment", false] }, 1, 0] },
        },
        calories: { $sum: "$votes.calories" },
        carbs: { $sum: "$votes.carbs" },
        protein: { $sum: "$votes.protein" },
      },
    },
  ]);

  const [summaryData] = summary;

  if (summaryData) {
    await Food.findByIdAndUpdate(foodId, {
      $set: {
        reviewSummary: {
          averageHealthRating: summaryData.averageHealthRating || 0,
          averageTasteRating: summaryData.averageTasteRating || 0,
          totalReviews: summaryData.totalReviews || 0,
          totalComments: summaryData.totalComments || 0,
          votesSummary: {
            calories: summaryData.calories || 0,
            carbs: summaryData.carbs || 0,
            protein: summaryData.protein || 0,
          },
        },
      },
    });
  }
};
