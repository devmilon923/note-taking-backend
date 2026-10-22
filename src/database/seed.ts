import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { User } from "./schema/user/schema.js";
import envManager from "../resource/env.js";

const env = envManager();

export async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(env.DATABASE_URL);
    console.log("Connected to MongoDB for seeding.");
  }

  const hashedPassword = await bcrypt.hash("password2", 10);

  const seedUsers = [
    {
      name: "Admin Account",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin" as const,
      interests: ["coding", "chess"] as Array<"coding" | "chess">,
      isDeleted: false,
    },
    {
      name: "Admin Account",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "admin" as const,
      interests: ["coding", "chess"] as Array<"coding" | "chess">,
      isDeleted: false,
    },
    {
      name: "User Account",
      email: "user@example.com",
      password: hashedPassword,
      role: "user" as const,
      interests: ["music", "travel"] as Array<"music" | "travel">,
      isDeleted: false,
    },
    {
      name: "User Account",
      email: "user@gmail.com",
      password: hashedPassword,
      role: "user" as const,
      interests: ["music", "travel"] as Array<"music" | "travel">,
      isDeleted: false,
    },
  ];

  for (const seed of seedUsers) {
    const existing = await User.findOne({ email: seed.email });
    if (existing) {
      await User.updateOne(
        { email: seed.email },
        {
          $set: {
            name: seed.name,
            password: seed.password,
            role: seed.role,
            interests: seed.interests,
            isDeleted: false,
          },
        },
      );
      console.log(
        `✅ Updated existing seed user: ${seed.email} (Role: ${seed.role})`,
      );
    } else {
      await User.create(seed);
      console.log(
        `✅ Created new seed user: ${seed.email} (Role: ${seed.role})`,
      );
    }
  }

  console.log(
    "✨ Seeding completed successfully! Default password for all seed accounts is: password2",
  );
}

if (process.argv[1]?.includes("seed")) {
  seedDatabase()
    .then(() => mongoose.disconnect())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seeding failed:", err);
      process.exit(1);
    });
}
