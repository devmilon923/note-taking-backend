import mongoose from "mongoose";

export default async function connectDB() {
  try {
    const connection = await mongoose.connect(process.env.DATABASE_URL!);
    console.log(`Database connected: ${connection.connection.host}`);
  } catch (error) {
    console.log(error);
  }
}
