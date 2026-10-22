/// <reference path="./types/express.d.ts" />
import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import globalErrorHandler from "./middleware/errorHandler.js";
import appRouters from "./route.js";
import connectDB from "./database/config.js";
import envManager from "./resource/env.js";
import { seedDatabase } from "./database/seed.js";

const env = envManager();
const app = express();
const port = env.Server_Port || 3001;

// Enable trust proxy for Vercel/reverse proxy HTTPS detection
app.set("trust proxy", 1);

const clientUrl = env.CLIENT_URL.replace(/\/$/, "");

app.use(
  cors({
    origin: env.CLIENT_URL as string,
    credentials: true,
  }),
);
connectDB();
app.get("/health", (req, res) => {
  res.json({
    message: "OK",
    status: "success",
    statusCode: 200,
    origin: env.CLIENT_URL,
  });
});
app.use(cookieParser());
app.use(express.json());
app.use(appRouters);
app.use(globalErrorHandler);

if (!process.env.VERCEL) {
  app.listen(port, async () => {
    await seedDatabase();
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
