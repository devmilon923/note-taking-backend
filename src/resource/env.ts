import { z } from "zod";
import { config } from "dotenv";
config();
const envData = z.object({
  Server_Port: z.coerce
    .number({ error: "Server port is required" })
    .min(1000, "4 Digit server port is required"),
  DATABASE_URL: z.string().min(10, "Database url is required"),
  CLIENT_URL: z.string().min(10, "Client url is required"),
  NODE_ENV: z.enum(["development", "production"]),
  JWT: z.string().min(10, "JWT secret is required"),
});

export type envTypes = z.infer<typeof envData>;

export default function envManager(): envTypes {
  const result = envData.safeParse(process.env);

  if (!result.success) {
    const formattedErrors = result.error.format();
    const { _errors, ...fieldErrors } = formattedErrors;
    console.error({
      system:
        "❌ Missing Required Environment Variables. Please make sure all environment variables are configured with valid credentials according to the `.env.sample` file.",
      error: fieldErrors,
    });

    console.log(fieldErrors);
    process.exit(1);
  }

  return result.data;
}