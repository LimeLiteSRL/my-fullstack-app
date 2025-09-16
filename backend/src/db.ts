import consola from "consola";
import mongoose, { Model } from "mongoose";

const { DB_URL } = process.env;

const connectDB = async (): Promise<void> => {
  try {
    // Ensure we connect to the 'diet' database
    const mongoUrl = DB_URL?.replace(/\/[^\/]*$/, '/diet') || 'mongodb+srv://diet-2:ANakm8KAj5wN7S3r@diet-app.sawoq.mongodb.net/diet?retryWrites=true&w=majority';
    
    await mongoose.connect(mongoUrl);
    consola.info("MongoDB connected successfully to 'diet' database");

  } catch (error) {
    consola.error("Error connecting to MongoDB");
    consola.error(error);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;