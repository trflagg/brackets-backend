import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  schema: "./src/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    ssl: true,
    database: process.env.PGDATABASE || "",
    host: process.env.PGHOST || "",
    user: process.env.PGUSER || "",
    password: process.env.PGPASSWORD || "",
  },
});
