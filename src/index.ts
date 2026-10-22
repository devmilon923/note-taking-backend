import "dotenv/config";
import express from "express";
import globalErrorHandler from "./middleware/errorHandler.js";
import appRouters from "./route.js";
import connectDB from "./database/config.js";
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(appRouters);
app.use(globalErrorHandler);
connectDB();
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
