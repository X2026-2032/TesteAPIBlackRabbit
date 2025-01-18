import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["dev", "test", "production"]).default("dev"),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string(),
  SENTRY_DSN: z.string(),
  JWT_SECRET: z.string(),
  //IDEZ_API_URL: z.string(),
  COMPANY_ID: z.string(),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  throw new Error("Invalid environment variables.");
}

export const env = _env.data;
