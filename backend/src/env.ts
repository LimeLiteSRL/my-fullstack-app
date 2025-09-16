import { z, ZodError } from "zod";
import "dotenv/config";

const configSchema = z.object({
  ENV: z.enum(["development", "production", "staging"]),
  PORT: z.string().regex(/^\d{4,5}$/),
  DB_URL: z.string(),
  JWT_SECRET: z.string(),
  TWILIO_ACCOUNT_SID: z.string(),
  TWILIO_AUTH_TOKEN: z.string(),
  TWILIO_PHONE_NUMBER: z.string(),
  TWILIO_SERVICE_ID: z.string(),
  OPENAI_API_KEY: z.string(),
  // WASABI_ACCESS_KEY: z.string(),
  // WASABI_SECRET_KEY: z.string(),
});

try {
  configSchema.parse(process.env);
} catch (error) {
  if (error instanceof ZodError) {
    console.error(error.errors);
  }
  process.exit(1);
}

export type Env = z.infer<typeof configSchema>;
