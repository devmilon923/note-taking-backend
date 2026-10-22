/// <reference path="./types/express.d.ts" />
import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import globalErrorHandler from "./middleware/errorHandler.js";
import appRouters from "./route.js";
import connectDB from "./database/config.js";
import envManager from "./resource/env.js";

const env = envManager();
const app = express();
const port = env.Server_Port || 3001;

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);
app.get("/health", (req, res) => {
  res.send("OK");
});
app.use(cookieParser());
app.use(express.json());
app.use(appRouters);
app.use(globalErrorHandler);

connectDB();

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
