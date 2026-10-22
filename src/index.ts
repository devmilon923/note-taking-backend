import "dotenv/config";
const env = envManager();
import express from "express";
import globalErrorHandler from "./middleware/errorHandler.js";
import appRouters from "./route.js";
import connectDB from "./database/config.js";
import envManager from "./resource/env.js";
const app = express();
const port = env.Server_Port || 3001;
app.use(express.json());
app.use(appRouters);
app.use(globalErrorHandler);
connectDB();
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
