import z from "zod";
import mongoose from "mongoose";

// Custom Zod Schema for ObjectId
export const ObjectIdSchema = z.custom<mongoose.Types.ObjectId>((val) => {
  return mongoose.Types.ObjectId.isValid(val);
}, {
  message: "Invalid ObjectId",
});