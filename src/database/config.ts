import mongoose from "mongoose";
import envManager from "../resource/env.js";
const env = envManager();
export default async function connectDB() {
  try {
    const connection = await mongoose.connect(env.DATABASE_URL);
    console.log(`Database connected: ${connection.connection.host}`);
  } catch (error) {
    console.log(error);
  }
}
