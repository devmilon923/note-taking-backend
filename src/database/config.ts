import mongoose from "mongoose";
import envManager from "../resource/env.js";

const env = envManager();

export default async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;

  try {
    const conn = await mongoose.connect(env.DATABASE_URL);
    console.log(`Database connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection error:", error);
  }
}
